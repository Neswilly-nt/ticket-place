package com.insi.ticketplace.repository;

import com.insi.ticketplace.entity.Event;
import com.insi.ticketplace.entity.EventCategory;
import com.insi.ticketplace.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Tous les événements par statut (ex: tous les PUBLISHED)
    List<Event> findByStatus(EventStatus status);

    // Tous les événements par catégorie
    List<Event> findByCategory(EventCategory category);

    // Tous les événements d'un organisateur spécifique
    List<Event> findByOrganizerId(Long organizerId);

    // Recherche par titre (contient le mot, insensible à la casse)
    // %keyword% = "contient" en SQL
    List<Event> findByTitleContainingIgnoreCase(String keyword);

    // Trouve tous les événements PUBLISHED dont la date est passée
    List<Event> findByStatusAndEventDateBefore(EventStatus status,
                                               LocalDateTime date);

    /**
     * Requête JPQL personnalisée — filtre par statut ET catégorie.
     * JPQL = SQL mais avec les noms des classes Java, pas des tables.
     * "e" = alias pour Event, "e.status" = champ Java (pas colonne BDD).
     */
    @Query("SELECT e FROM Event e WHERE " +
            "(:status IS NULL OR e.status = :status) AND " +
            "(:category IS NULL OR e.category = :category)")
    List<Event> findByStatusAndCategory(EventStatus status,
                                        EventCategory category);
}