package com.insi.ticketplace.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO du dashboard — regroupe toutes les statistiques
 * en un seul objet retourné par un seul endpoint.
 */
@Data
@Builder
public class DashboardResponse {

    // ===== Statistiques globales =====
    private long totalUsers;         // nombre total d'utilisateurs
    private long totalEvents;        // nombre total d'événements
    private long totalTicketsSold;   // billets PAID + USED
    private long totalTicketsCancelled;
    private BigDecimal totalRevenue; // somme de tous les billets payés

    // ===== Statistiques par statut d'événement =====
    private long draftEvents;
    private long publishedEvents;
    private long completedEvents;
    private long cancelledEvents;

    // ===== Top événements =====
    private List<EventStatsResponse> topEvents; // les plus vendus
}