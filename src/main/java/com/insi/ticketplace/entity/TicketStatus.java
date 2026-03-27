package com.insi.ticketplace.entity;

/**
 * Cycle de vie d'un billet :
 *
 * RESERVED  → billet réservé, paiement en attente
 * PAID      → paiement confirmé, billet valide
 * USED      → billet scanné à l'entrée de l'événement
 * CANCELLED → billet annulé (remboursement à gérer)
 */
public enum TicketStatus {
    RESERVED,
    PAID,
    USED,
    CANCELLED
}