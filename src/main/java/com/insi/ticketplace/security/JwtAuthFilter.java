package com.insi.ticketplace.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre JWT — s'exécute UNE FOIS par requête HTTP.
 *
 * Fonctionnement :
 * 1. Récupère le header "Authorization: Bearer <token>"
 * 2. Extrait et valide le token JWT
 * 3. Charge l'utilisateur depuis la BDD
 * 4. Injecte l'utilisateur dans le SecurityContext
 *
 * Si le token est absent ou invalide → la requête continue
 * sans authentification (sera bloquée par SecurityConfig si la route est protégée).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Lire le header Authorization
        final String authHeader = request.getHeader("Authorization");

        // Si pas de header ou ne commence pas par "Bearer " → on passe
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraire le token (enlever "Bearer ")
        final String jwt = authHeader.substring(7);

        // 3. Extraire le username (email) du token
        final String userEmail = jwtService.extractUsername(jwt);

        // 4. Si email trouvé ET pas encore authentifié dans ce contexte
        if (userEmail != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // Charger l'utilisateur depuis la BDD
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // Valider le token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Créer l'objet d'authentification Spring Security
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,                          // credentials (pas besoin ici)
                                userDetails.getAuthorities()   // rôles
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Injecter dans le SecurityContext → Spring sait que l'user est connecté
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}