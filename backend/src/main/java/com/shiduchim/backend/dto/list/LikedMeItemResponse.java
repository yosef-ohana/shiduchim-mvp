package com.shiduchim.backend.dto.list;

import com.shiduchim.backend.enums.PoolType;
import java.time.LocalDateTime;

public class LikedMeItemResponse {

    private Long userId;
    private String primaryPhotoUrl;
    private String fullName;
    private Integer age;
    private Integer heightCm;
    private String areaOfResidence;
    private String religiousLevel;
    private String education;
    private String lookingForShort;
    private PoolType poolType;
    private Long weddingId;
    private LocalDateTime likedAt;

    public LikedMeItemResponse() {}

    public LikedMeItemResponse(Long userId, String primaryPhotoUrl, String fullName, Integer age, Integer heightCm,
                               String areaOfResidence, String religiousLevel, String education, String lookingForShort,
                               PoolType poolType, Long weddingId, LocalDateTime likedAt) {
        this.userId = userId;
        this.primaryPhotoUrl = primaryPhotoUrl;
        this.fullName = fullName;
        this.age = age;
        this.heightCm = heightCm;
        this.areaOfResidence = areaOfResidence;
        this.religiousLevel = religiousLevel;
        this.education = education;
        this.lookingForShort = lookingForShort;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.likedAt = likedAt;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPrimaryPhotoUrl() { return primaryPhotoUrl; }
    public void setPrimaryPhotoUrl(String primaryPhotoUrl) { this.primaryPhotoUrl = primaryPhotoUrl; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }

    public String getAreaOfResidence() { return areaOfResidence; }
    public void setAreaOfResidence(String areaOfResidence) { this.areaOfResidence = areaOfResidence; }

    public String getReligiousLevel() { return religiousLevel; }
    public void setReligiousLevel(String religiousLevel) { this.religiousLevel = religiousLevel; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getLookingForShort() { return lookingForShort; }
    public void setLookingForShort(String lookingForShort) { this.lookingForShort = lookingForShort; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public LocalDateTime getLikedAt() { return likedAt; }
    public void setLikedAt(LocalDateTime likedAt) { this.likedAt = likedAt; }
}
