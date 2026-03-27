package com.insi.ticketplace.config;

import com.insi.ticketplace.entity.*;
import com.insi.ticketplace.repository.EventRepository;
import com.insi.ticketplace.repository.TicketRepository;
import com.insi.ticketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tâche planifiée qui s'exécute automatiquement.
 *
 * @Scheduled(cron = "...") → syntaxe cron :
 *   "0 0 * * * *"     = toutes les heures
 *   "0 0 0 * * *"     = tous les jours à minuit
 *   "0 * * * * *"     = toutes les minutes (pour tester)
 *
 * Format : secondes minutes heures jour mois jour-semaine
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventScheduler {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    /**
     * S'exécute toutes les heures.
     * Cherche les événements PUBLISHED dont la date est passée
     * et les passe automatiquement en COMPLETED.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void markCompletedEvents() {
        LocalDateTime now = LocalDateTime.now();

        // Trouve tous les PUBLISHED dont eventDate < maintenant
        var expiredEvents = eventRepository
                .findByStatusAndEventDateBefore(EventStatus.PUBLISHED, now);

        if (expiredEvents.isEmpty()) {
            log.debug("Aucun événement à marquer comme terminé");
            return;
        }

        // Passe chacun en COMPLETED
        expiredEvents.forEach(event -> {
            event.setStatus(EventStatus.COMPLETED);
            log.info("Événement '{}' marqué COMPLETED", event.getTitle());
        });

        eventRepository.saveAll(expiredEvents);
        log.info("{} événement(s) marqué(s) comme terminé(s)",
                expiredEvents.size());
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cancelExpiredUnpaidReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Ticket> expired = ticketRepository.findExpiredUnpaidReservations(now);

        if (expired.isEmpty()) return;

        for (Ticket ticket : expired) {
            Event event = ticket.getEvent();
            ticket.setStatus(TicketStatus.CANCELLED);
            ticket.setCancelledAt(now);
            event.setAvailableSeats(event.getAvailableSeats() + 1);
            eventRepository.save(event);
            ticketRepository.save(ticket);

            notificationService.send(
                    ticket.getUser(),
                    NotificationType.RESERVATION_AUTO_CANCELLED,
                    "Réservation annulée automatiquement",
                    "Votre réservation pour \"" + event.getTitle()
                            + "\" a été annulée car le paiement n'a pas été effectué avant le "
                            + event.getPaymentDeadline().format(
                                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm"))
                            + ". La place est à nouveau disponible.",
                    ticket.getId());

            log.info("Billet #{} annulé auto (délai paiement) - événement '{}'",
                    ticket.getId(), event.getTitle());
        }

        log.info("{} réservation(s) annulée(s) automatiquement", expired.size());
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusHours(23);
        LocalDateTime windowEnd   = now.plusHours(25);

        List<Event> upcoming = eventRepository
                .findByStatusAndEventDateBetweenAndReminderSentFalse(
                        EventStatus.PUBLISHED, windowStart, windowEnd);

        for (Event event : upcoming) {
            String when = event.getEventDate().format(
                    java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm"));

            List<Ticket> holders = ticketRepository
                    .findPaidTicketHoldersByEvent(event.getId());

            for (Ticket ticket : holders) {
                notificationService.send(
                        ticket.getUser(),
                        NotificationType.EVENT_REMINDER,
                        "Rappel : " + event.getTitle() + " demain 🎉",
                        "N'oubliez pas ! L'événement \"" + event.getTitle()
                                + "\" a lieu demain le " + when
                                + " à " + event.getLocation() + ".",
                        event.getId());
            }

            notificationService.send(
                    event.getOrganizer(),
                    NotificationType.EVENT_REMINDER,
                    "Votre événement \"" + event.getTitle() + "\" est demain",
                    holders.size() + " participant(s) attendu(s) le " + when
                            + " à " + event.getLocation() + ".",
                    event.getId());

            event.setReminderSent(true);
            eventRepository.save(event);

            log.info("Rappels envoyés pour '{}' ({} billets)",
                    event.getTitle(), holders.size());
        }
    }
}