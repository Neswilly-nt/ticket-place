package com.insi.ticketplace.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Statistiques pour UN événement spécifique.
 * Utilisé dans le top des événements les plus vendus
 * et dans le dashboard de l'organisateur.
 */
@Data
@Builder
public class EventStatsResponse {
    private Long eventId;
    private String eventTitle;
    private String location;
    private long ticketsSold;       // nombre de billets vendus
    private long availableSeats;    // places restantes
    private long totalSeats;        // places totales
    private BigDecimal revenue;     // revenus générés
    private double occupancyRate;   // taux de remplissage en %
}