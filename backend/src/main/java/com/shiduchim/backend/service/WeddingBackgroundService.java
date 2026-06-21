package com.shiduchim.backend.service;

import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.WeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class WeddingBackgroundService {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");

    private final WeddingRepository weddingRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public WeddingBackgroundService(WeddingRepository weddingRepository) {
        this.weddingRepository = weddingRepository;
    }

    @Transactional
    public Wedding uploadBackground(Long weddingId, MultipartFile file, User currentUser) {
        Wedding wedding = getWeddingAndCheckPermissions(weddingId, currentUser);

        if (wedding.getStatus() != com.shiduchim.backend.enums.WeddingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload background for non-active wedding");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required and must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported image type. Allowed: jpeg, png, webp");
        }

        // Delete old file if exists
        deleteFileQuietly(wedding.getBackgroundStoragePath());

        // Save new file
        String filename = saveFile(file);
        String imageUrl = "/uploads/" + filename;
        String storagePath = resolveUploadPath().resolve(filename).toString();

        wedding.setBackgroundImageUrl(imageUrl);
        wedding.setBackgroundStoragePath(storagePath);
        return weddingRepository.save(wedding);
    }

    @Transactional
    public Wedding deleteBackground(Long weddingId, User currentUser) {
        Wedding wedding = getWeddingAndCheckPermissions(weddingId, currentUser);

        if (wedding.getStatus() != com.shiduchim.backend.enums.WeddingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete background for non-active wedding");
        }

        deleteFileQuietly(wedding.getBackgroundStoragePath());

        wedding.setBackgroundImageUrl(null);
        wedding.setBackgroundStoragePath(null);
        return weddingRepository.save(wedding);
    }

    private Wedding getWeddingAndCheckPermissions(Long weddingId, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (Boolean.TRUE.equals(user.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is blocked");
        }
        if (user.getRole() == UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access restricted");
        }

        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        if (user.getRole() == UserRole.EVENT_MANAGER) {
            if (!user.getId().equals(wedding.getOwnerUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner of this wedding");
            }
        }

        return wedding;
    }

    private String saveFile(MultipartFile file) {
        Path dir = resolveUploadPath();
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not create upload directory");
        }

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf(".")).toLowerCase();
            if (!List.of(".jpg", ".jpeg", ".png", ".webp").contains(ext)) {
                ext = "";
            }
        }

        String filename = UUID.randomUUID().toString() + ext;
        Path dest = dir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save image file");
        }

        return filename;
    }

    private Path resolveUploadPath() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private void deleteFileQuietly(String storagePath) {
        if (storagePath == null) return;
        try {
            Path path = Paths.get(storagePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("[WeddingBackgroundService] Warning: could not delete file at " + storagePath + " - " + e.getMessage());
        }
    }
}
