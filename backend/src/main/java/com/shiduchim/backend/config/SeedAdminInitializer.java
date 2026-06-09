package com.shiduchim.backend.config;

import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SeedAdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public SeedAdminInitializer(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByRole(UserRole.ADMIN)) {
            User admin = new User();
            admin.setFullName("System Owner Admin");
            admin.setEmail("owner.admin@shiduchim.local");
            admin.setPasswordHash(passwordEncoder.encode("ShiduchimAdmin!2026"));
            admin.setRole(UserRole.ADMIN);
            admin.setProfileStatus(ProfileStatus.NONE);
            admin.setAdminBlocked(false);
            userRepository.save(admin);
            System.out.println("Seed Admin created successfully.");
        }
    }
}
