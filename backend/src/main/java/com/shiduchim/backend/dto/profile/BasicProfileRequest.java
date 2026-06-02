package com.shiduchim.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BasicProfileRequest {

    @NotBlank(message = "fullName is required")
    private String fullName;

    @NotNull(message = "age is required")
    private Integer age;

    @NotNull(message = "heightCm is required")
    private Integer heightCm;

    @NotBlank(message = "areaOfResidence is required")
    private String areaOfResidence;

    @NotBlank(message = "religiousLevel is required")
    private String religiousLevel;

    @NotBlank(message = "phone is required")
    private String phone;

    public BasicProfileRequest() {}

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

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
