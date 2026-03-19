package com.insi.ticketplace.entity;

/**
 * Catégories possibles pour un événement.
 * Stocké comme String en BDD (ex: "CONCERT") grâce à @Enumerated(EnumType.STRING).
 */
public enum EventCategory {
    CONCERT,
    THEATRE,
    CONFERENCE,
    SPORT,
    FESTIVAL,
    OTHER
}