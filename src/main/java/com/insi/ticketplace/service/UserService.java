package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.RegistrationRequest;
import com.insi.ticketplace.dto.response.UserResponse;
import com.insi.ticketplace.entity.Role;
import com.insi.ticketplace.entity.User;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(RegistrationRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Cet email est déjà utilisé", HttpStatus.CONFLICT);
        }

        // Créer le nouvel utilisateur
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Par défaut, tous les nouveaux utilisateurs sont de type USER
                .enabled(true)
                .build();

        // Sauvegarder l'utilisateur
        User savedUser = userRepository.save(user);

        // Retourner la réponse sans le mot de passe
        return UserResponse.builder()
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .enabled(savedUser.isEnabled())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .build();
    }
}
