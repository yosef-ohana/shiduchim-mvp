package com.shiduchim.backend.dto.list;

import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import java.time.LocalDateTime;

public class ActionListItemResponse {

    private Long userId;
    private String primaryPhotoUrl;
    private String fullName;
    private Integer age;
    private Integer heightCm;
    private String areaOfResidence;
    private String religiousLevel;
    private String education;
    private String lookingForShort;
    private ActionType actionType;
    private PoolType poolType;
    private Long weddingId;
    private LocalDateTime actionUpdatedAt;

    public ActionListItemResponse() {}

    public ActionListItemResponse(Long userId, String primaryPhotoUrl, String fullName, Integer age, Integer heightCm,
                                  String areaOfResidence, String religiousLevel, String education, String lookingForShort,
                                  ActionType actionType, PoolType poolType, Long weddingId, LocalDateTime actionUpdatedAt) {
        this.userId = userId;
        this.primaryPhotoUrl = primaryPhotoUrl;
        this.fullName = fullName;
        this.age = age;
        this.heightCm = heightCm;
        this.areaOfResidence = areaOfResidence;
        this.religiousLevel = religiousLevel;
        this.education = education;
        this.lookingForShort = lookingForShort;
        this.actionType = actionType;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.actionUpdatedAt = actionUpdatedAt;
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

    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public LocalDateTime getActionUpdatedAt() { return actionUpdatedAt; }
    public void setActionUpdatedAt(LocalDateTime actionUpdatedAt) { this.actionUpdatedAt = actionUpdatedAt; }
}
