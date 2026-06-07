package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.photo.PhotoResponse;
import com.shiduchim.backend.dto.photo.PhotoUploadResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserPhoto;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserPhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PhotoService {

    private static final int MAX_PHOTOS_PER_USER = 2;
    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");

    private final UserPhotoRepository userPhotoRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public PhotoService(UserPhotoRepository userPhotoRepository) {
        this.userPhotoRepository = userPhotoRepository;
    }

    // ─── POST /api/photos ─────────────────────────────────────────────────────

    public PhotoUploadResponse uploadPhoto(User user, MultipartFile file) {
        requireUserRole(user);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required and must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported image type. Allowed: jpeg, png, webp");
        }

        List<UserPhoto> existingPhotos = userPhotoRepository.findByUserId(user.getId());
        long currentCount = existingPhotos.size();
        if (currentCount >= MAX_PHOTOS_PER_USER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Maximum of " + MAX_PHOTOS_PER_USER + " photos allowed per user");
        }

        // Determine order and primary flag before saving to disk
        boolean isFirst = existingPhotos.isEmpty();
        int orderIndex = 1;
        if (!isFirst) {
            boolean hasSlot1 = existingPhotos.stream()
                    .anyMatch(p -> p.getOrderIndex() != null && p.getOrderIndex() == 1);
            orderIndex = hasSlot1 ? 2 : 1;
        }
        boolean isPrimary = isFirst;

        // Save file to local storage
        String filename = saveFile(file);
        String imageUrl = "/uploads/" + filename;
        String storagePath = resolveUploadPath().resolve(filename).toString();

        // Persist DB record
        UserPhoto photo = new UserPhoto();
        photo.setUserId(user.getId());
        photo.setStoragePath(storagePath);
        photo.setImageUrl(imageUrl);
        photo.setIsPrimary(isPrimary);
        photo.setOrderIndex(orderIndex);
        photo = userPhotoRepository.save(photo);

        long newCount = userPhotoRepository.countByUserId(user.getId());
        boolean hasPrimary = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId());

        return new PhotoUploadResponse(photo.getId(), photo.getImageUrl(), photo.getIsPrimary(),
                photo.getOrderIndex(), newCount, hasPrimary);
    }

    // ─── GET /api/photos/me ──────────────────────────────────────────────────

    public List<PhotoResponse> getMyPhotos(User user) {
        requireUserRole(user);

        return userPhotoRepository
                .findByUserIdOrderByOrderIndexAscCreatedAtAsc(user.getId())
                .stream()
                .map(p -> new PhotoResponse(p.getId(), p.getImageUrl(), p.getIsPrimary(),
                        p.getOrderIndex(), p.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // ─── PUT /api/photos/{photoId}/primary ────────────────────────────────────

    public PhotoResponse setPrimary(User user, Long photoId) {
        requireUserRole(user);

        UserPhoto target = userPhotoRepository.findByIdAndUserId(photoId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Photo not found or does not belong to current user"));

        // Clear primary from all user's photos, then set on the target
        List<UserPhoto> allPhotos = userPhotoRepository.findByUserId(user.getId());
        for (UserPhoto p : allPhotos) {
            p.setIsPrimary(p.getId().equals(photoId));
        }
        userPhotoRepository.saveAll(allPhotos);

        // Reload target to return fresh state
        target.setIsPrimary(true);
        return new PhotoResponse(target.getId(), target.getImageUrl(), true,
                target.getOrderIndex(), target.getCreatedAt());
    }

    // ─── DELETE /api/photos/{photoId} ────────────────────────────────────────

    public PhotoUploadResponse deletePhoto(User user, Long photoId) {
        requireUserRole(user);

        UserPhoto photo = userPhotoRepository.findByIdAndUserId(photoId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Photo not found or does not belong to current user"));

        boolean wasPhotoFirst = Boolean.TRUE.equals(photo.getIsPrimary());

        // Delete physical file (tolerate missing file gracefully)
        deleteFileQuietly(photo.getStoragePath());

        // Delete DB record
        userPhotoRepository.delete(photo);

        // If deleted photo was primary and another photo exists, promote it
        List<UserPhoto> remaining = userPhotoRepository.findByUserIdOrderByOrderIndexAscCreatedAtAsc(user.getId()).stream()
                .filter(p -> !p.getId().equals(photoId))
                .collect(Collectors.toList());
        if (wasPhotoFirst && !remaining.isEmpty()) {
            UserPhoto newPrimary = remaining.get(0);
            newPrimary.setIsPrimary(true);
            userPhotoRepository.save(newPrimary);
        }

        long newCount = remaining.size();
        boolean hasPrimary = remaining.stream().anyMatch(p -> Boolean.TRUE.equals(p.getIsPrimary()));

        return new PhotoUploadResponse(null, null, null, null, newCount, hasPrimary);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void requireUserRole(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access restricted to USER role");
        }
        if (Boolean.TRUE.equals(user.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is blocked");
        }
    }

    /**
     * Saves the file to the upload directory with a UUID-based filename.
     * Returns the generated filename (not the full path).
     */
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
            // Basic safety: only keep known extensions
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
            // Log and continue — do not fail the delete operation over a missing file
            System.err.println("[PhotoService] Warning: could not delete file at " + storagePath + " — " + e.getMessage());
        }
    }
}
