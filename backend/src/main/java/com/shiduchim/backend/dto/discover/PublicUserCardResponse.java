package com.shiduchim.backend.dto.discover;

import com.shiduchim.backend.enums.PoolType;

public class PublicUserCardResponse {

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
    private Boolean hasOpenOpeningConversation;
    private Long openingConversationId;
    private String openingConversationDirection; // "SENT" or "RECEIVED"
    private String openingConversationStatus;

    public PublicUserCardResponse() {
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

    public Boolean getHasOpenOpeningConversation() { return hasOpenOpeningConversation; }
    public void setHasOpenOpeningConversation(Boolean hasOpenOpeningConversation) { this.hasOpenOpeningConversation = hasOpenOpeningConversation; }

    public Long getOpeningConversationId() { return openingConversationId; }
    public void setOpeningConversationId(Long openingConversationId) { this.openingConversationId = openingConversationId; }

    public String getOpeningConversationDirection() { return openingConversationDirection; }
    public void setOpeningConversationDirection(String openingConversationDirection) { this.openingConversationDirection = openingConversationDirection; }

    public String getOpeningConversationStatus() { return openingConversationStatus; }
    public void setOpeningConversationStatus(String openingConversationStatus) { this.openingConversationStatus = openingConversationStatus; }
}
