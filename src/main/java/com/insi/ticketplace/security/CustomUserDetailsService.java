package com.insi.ticketplace.security;

import com.insi.ticketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Implémentation de UserDetailsService pour Spring Security.
 *
 * Spring Security appelle loadUserByUsername() automatiquement
 * quand il a besoin de vérifier qui est l'utilisateur.
 *
 * Notre "username" = l'email de l'utilisateur.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé avec l'email : " + email
                ));
        // Notre entité User implémente déjà UserDetails → retour direct
    }
}