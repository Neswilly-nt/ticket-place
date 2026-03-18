package com.insi.ticketplace.entity;

/**
 * Enumération des rôles disponibles dans l'application.
 *
 * - USER    : client standard, peut réserver des billets
 * - ORGANIZER : peut créer et gérer ses événements
 * - ADMIN   : accès total, supervision globale
 *
 * Spring Security utilisera ces rôles pour protéger les endpoints.
 * Convention Spring : les rôles sont préfixés ROLE_ en interne.
 */
public enum Role {
    USER,
    ORGANIZER,
    ADMIN
}
