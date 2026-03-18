package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.request.RegisterRequest;
import com.insi.ticketplace.dto.response.UserResponse;
import com.insi.ticketplace.entity.Role;
import com.insi.ticketplace.entity.User;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor  // Lombok génère un constructeur avec tous les champs final
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email déjà utilisé", HttpStatus.CONFLICT);
        }

        // Construire l'entité User
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Rôle par défaut
                .build();

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Override
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        return toResponse(user);
    }

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    // Conversion Entity → DTO (évite d'exposer l'entité directement)
    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
