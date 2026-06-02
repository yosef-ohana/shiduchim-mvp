package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.photo.PhotoResponse;
import com.shiduchim.backend.dto.photo.PhotoUploadResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping
    public ResponseEntity<PhotoUploadResponse> uploadPhoto(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile image) {
        PhotoUploadResponse response = photoService.uploadPhoto(user, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<PhotoResponse>> getMyPhotos(@AuthenticationPrincipal User user) {
        List<PhotoResponse> photos = photoService.getMyPhotos(user);
        return ResponseEntity.ok(photos);
    }

    @PutMapping("/{photoId}/primary")
    public ResponseEntity<PhotoResponse> setPrimary(
            @AuthenticationPrincipal User user,
            @PathVariable Long photoId) {
        PhotoResponse response = photoService.setPrimary(user, photoId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<PhotoUploadResponse> deletePhoto(
            @AuthenticationPrincipal User user,
            @PathVariable Long photoId) {
        PhotoUploadResponse response = photoService.deletePhoto(user, photoId);
        return ResponseEntity.ok(response);
    }
}
