package com.insi.ticketplace.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Swagger / OpenAPI 3.
 *
 * Deux choses configurées ici :
 * 1. Les infos générales de l'API (titre, version, description)
 * 2. Le schéma de sécurité JWT — pour pouvoir tester les
 *    endpoints protégés directement depuis Swagger UI
 */
@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                // Informations générales de l'API
                .info(new Info()
                        .title("Ticket Place API")
                        .description("""
                                API REST de gestion de billetterie en ligne.
                                
                                **Rôles disponibles :**
                                - `ADMIN` — supervision globale
                                - `ORGANIZER` — gestion de ses événements
                                - `USER` — réservation de billets
                                
                                **Authentification :**
                                1. Appeler `POST /api/auth/login`
                                2. Copier le token reçu
                                3. Cliquer sur le bouton **Authorize** 🔒
                                4. Entrer `Bearer <votre_token>`
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("L2 GL INSI")
                                .email("jeannoneswilly@gmail.com")))

                // Déclarer le schéma de sécurité JWT
                // Cela ajoute le bouton "Authorize" dans Swagger UI
                .addSecurityItem(new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre token JWT")));
    }
}