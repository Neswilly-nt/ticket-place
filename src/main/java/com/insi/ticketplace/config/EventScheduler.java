package com.insi.ticketplace.config;

import com.insi.ticketplace.entity.EventStatus;
import com.insi.ticketplace.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

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
}