package com.insi.ticketplace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {

    /**
     * Bean pour encoder les mots de passe avec BCrypt.
     * BCrypt est un algorithme de hachage sécurisé, adapté aux mots de passe.
     * On le déclare ici pour l'injecter partout où on en a besoin.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
