package com.insi.ticketplace.config;

import com.insi.ticketplace.entity.Role;
import com.insi.ticketplace.entity.User;
import com.insi.ticketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * S'exécute automatiquement au démarrage de l'application.
     * Crée l'admin uniquement s'il n'existe pas déjà en BDD.
     * Ainsi, même si tu redémarres 100 fois, il ne sera créé qu'une seule fois.
     */
    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@ticketplace.com";

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin déjà existant — aucune action nécessaire");
            return;
        }

        User admin = User.builder()
                .firstName("Admin")
                .lastName("Ticket Place")
                .email(adminEmail)
                .password(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("🚀 Compte ADMIN créé : {} / Admin@1234", adminEmail);
    }
}