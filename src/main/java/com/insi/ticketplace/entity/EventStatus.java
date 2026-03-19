package com.insi.ticketplace.entity;

/**
 * Cycle de vie d'un événement :
 * DRAFT      → créé mais pas encore publié (brouillon)
 * PUBLISHED  → visible par tous les utilisateurs
 * CANCELLED  → annulé (les billets seront remboursés)
 * COMPLETED  → l'événement a eu lieu
 */
public enum EventStatus {
    DRAFT,
    PUBLISHED,
    CANCELLED,
    COMPLETED
}