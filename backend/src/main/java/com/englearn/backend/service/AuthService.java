package com.englearn.backend.service;

import com.englearn.backend.dto.AuthRequest;
import com.englearn.backend.dto.AuthResponse;
import com.englearn.backend.model.Role;
import com.englearn.backend.model.User;
import com.englearn.backend.model.UserProgress;
import com.englearn.backend.repository.UserProgressRepository;
import com.englearn.backend.repository.UserRepository;
import com.englearn.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, 
                       UserProgressRepository userProgressRepository,
                       PasswordEncoder passwordEncoder, 
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse register(AuthRequest.RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : extractNameFromEmail(request.getEmail()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        // Create initial progress for user
        UserProgress progress = UserProgress.builder()
                .user(user)
                .xp(0)
                .level(1)
                .totalWordsLearned(0)
                .totalReviews(0)
                .perfectReviews(0)
                .streak(0)
                .maxStreak(0)
                .achievements("[]")
                .srsData("{}")
                .history("[]")
                .build();

        userProgressRepository.save(progress);

        return createAuthResponse(user);
    }

    public AuthResponse login(AuthRequest.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return createAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken) || !jwtUtils.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        Long userId = jwtUtils.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return createAuthResponse(user);
    }

    public AuthResponse.UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .build();
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .displayName(user.getDisplayName())
                        .avatar(user.getAvatar())
                        .role(user.getRole())
                        .build())
                .build();
    }

    private String extractNameFromEmail(String email) {
        String name = email.split("@")[0];
        // Capitalize first letter
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}
