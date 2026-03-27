package com.insi.ticketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Relations :
 * - @ManyToOne vers User    : un user peut avoir plusieurs billets
 * - @ManyToOne vers Event   : un événement peut avoir plusieurs billets
 *
 * qrCode : pour vérifier le billet à l'entrée.
 *
 * price : on stocke le prix AU MOMENT de la réservation.
 *         Si l'organisateur change le prix plus tard,
 *         les anciens billets gardent leur prix d'origine.
 */
@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relation vers l'utilisateur qui a réservé le billet.
     * LAZY = on ne charge pas l'user depuis la BDD
     * sauf si on en a explicitement besoin.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.RESERVED;


    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Code QR unique pour ce billet.
     * Format : UUID aléatoire → impossible à deviner ou dupliquer.
     * Stocké en BDD pour pouvoir le vérifier au scan.
     */
    @Column(nullable = false, unique = true)
    private String qrCode;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime reservedAt = LocalDateTime.now();

    private LocalDateTime paidAt;       // rempli quand status → PAID
    private LocalDateTime usedAt;       // rempli quand scanné à l'entrée
    private LocalDateTime cancelledAt;  // rempli quand annulé
}