package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.WeddingStatus;
import java.time.LocalDate;

public class ValidateWeddingCodeResponse {

    private boolean valid;
    private Long weddingId;
    private String weddingName;
    private String city;
    private LocalDate weddingDate;
    private WeddingStatus status;
    private boolean joinAllowed;
    private String message;
    private String backgroundImageUrl;

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public String getWeddingName() { return weddingName; }
    public void setWeddingName(String weddingName) { this.weddingName = weddingName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public WeddingStatus getStatus() { return status; }
    public void setStatus(WeddingStatus status) { this.status = status; }

    public boolean isJoinAllowed() { return joinAllowed; }
    public void setJoinAllowed(boolean joinAllowed) { this.joinAllowed = joinAllowed; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBackgroundImageUrl() { return backgroundImageUrl; }
    public void setBackgroundImageUrl(String backgroundImageUrl) { this.backgroundImageUrl = backgroundImageUrl; }
}
