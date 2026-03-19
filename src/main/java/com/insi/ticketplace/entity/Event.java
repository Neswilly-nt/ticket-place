package com.insi.ticketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité Event = table "events" dans MySQL.
 *
 * Relation avec User : un organisateur (User) peut créer
 * plusieurs événements → @ManyToOne vers User.
 *
 * BigDecimal pour le prix → plus précis que double pour
 * les calculs financiers (pas de problème d'arrondi).
 */
@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")  // texte long, pas limité à 255 chars
    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate;    // date et heure de l'événement

    @Column(nullable = false)
    private String location;            // lieu (ville, salle...)

    @Column(nullable = false)
    private Integer totalSeats;         // nombre total de places

    @Column(nullable = false)
    private Integer availableSeats;     // places encore disponibles

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;           // prix du billet

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EventCategory category = EventCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;  // brouillon par défaut

    /**
     * Relation ManyToOne : plusieurs événements → un organisateur.
     * @JoinColumn : la colonne "organizer_id" dans la table events
     * pointe vers la table users.
     *
     * FetchType.LAZY : on ne charge l'organisateur depuis la BDD
     * que si on en a besoin (optimisation performance).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}