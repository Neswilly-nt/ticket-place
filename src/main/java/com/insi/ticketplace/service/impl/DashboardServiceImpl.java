package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.response.DashboardResponse;
import com.insi.ticketplace.dto.response.EventStatsResponse;
import com.insi.ticketplace.entity.*;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.*;
import com.insi.ticketplace.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    /**
     * Dashboard admin — vue globale de toute la plateforme.
     *
     * On fait plusieurs requêtes BDD légères plutôt qu'une
     * seule grosse requête complexe → plus lisible et maintenable.
     */
    @Override
    public DashboardResponse getAdminDashboard() {

        // Statuts qui comptent comme "vendus"
        List<TicketStatus> soldStatuses = List.of(
                TicketStatus.PAID, TicketStatus.USED);

        // Calcul du revenu total
        BigDecimal totalRevenue = ticketRepository
                .sumRevenueByStatuses(soldStatuses);

        // Top 5 événements les plus vendus
        List<EventStatsResponse> topEvents = ticketRepository
                .findTopEventsByTicketsSold()
                .stream()
                .limit(5)
                .map(row -> {
                    Event event = (Event) row[0];
                    long count = (long) row[1];
                    return buildEventStats(event, count);
                })
                .toList();

        return DashboardResponse.builder()
                // Stats utilisateurs
                .totalUsers(userRepository.count())
                // Stats événements
                .totalEvents(eventRepository.count())
                .draftEvents(eventRepository
                        .countByStatus(EventStatus.DRAFT))
                .publishedEvents(eventRepository
                        .countByStatus(EventStatus.PUBLISHED))
                .completedEvents(eventRepository
                        .countByStatus(EventStatus.COMPLETED))
                .cancelledEvents(eventRepository
                        .countByStatus(EventStatus.CANCELLED))
                // Stats billets
                .totalTicketsSold(
                        ticketRepository.countByStatus(TicketStatus.PAID)
                                + ticketRepository.countByStatus(TicketStatus.USED))
                .totalTicketsCancelled(
                        ticketRepository.countByStatus(TicketStatus.CANCELLED))
                .totalRevenue(totalRevenue)
                // Top événements
                .topEvents(topEvents)
                .build();
    }

    /**
     * Dashboard organisateur — vue de ses propres événements.
     * Un organisateur ne voit QUE ses événements et leurs stats.
     */
    @Override
    public List<EventStatsResponse> getOrganizerDashboard(
            String organizerEmail) {

        return eventRepository.findByOrganizerId(
                        getUserId(organizerEmail))
                .stream()
                .map(event -> {
                    long sold = ticketRepository
                            .countByEventIdAndStatus(
                                    event.getId(), TicketStatus.PAID)
                            + ticketRepository
                            .countByEventIdAndStatus(
                                    event.getId(), TicketStatus.USED);
                    return buildEventStats(event, sold);
                })
                .toList();
    }

    // ===== Méthodes privées =====

    /**
     * Construit les stats d'un événement.
     * Calcule le taux de remplissage :
     * ex: 150 billets vendus / 200 places totales = 75%
     */
    private EventStatsResponse buildEventStats(Event event,
                                               long ticketsSold) {
        // Revenu = billets vendus × prix unitaire
        BigDecimal revenue = event.getPrice()
                .multiply(BigDecimal.valueOf(ticketsSold));

        // Taux de remplissage en pourcentage
        double occupancyRate = event.getTotalSeats() > 0
                ? (double) ticketsSold / event.getTotalSeats() * 100
                : 0.0;

        // Arrondi à 2 décimales ex: 75.50%
        occupancyRate = BigDecimal.valueOf(occupancyRate)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        return EventStatsResponse.builder()
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .location(event.getLocation())
                .ticketsSold(ticketsSold)
                .availableSeats(event.getAvailableSeats())
                .totalSeats(event.getTotalSeats())
                .revenue(revenue)
                .occupancyRate(occupancyRate)
                .build();
    }

    private Long getUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "Utilisateur introuvable", HttpStatus.NOT_FOUND))
                .getId();
    }
}