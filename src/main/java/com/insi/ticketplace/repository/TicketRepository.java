package com.insi.ticketplace.repository;

import com.insi.ticketplace.entity.Ticket;
import com.insi.ticketplace.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Tous les billets d'un utilisateur
    List<Ticket> findByUserId(Long userId);

    // Tous les billets d'un événement
    List<Ticket> findByEventId(Long eventId);

    // Tous les billets d'un événement par statut
    // ex: tous les billets PAID de l'événement 1
    List<Ticket> findByEventIdAndStatus(Long eventId, TicketStatus status);

    // Chercher un billet par son QR Code — utilisé au scan
    Optional<Ticket> findByQrCode(String qrCode);

    // Vérifier si un user a déjà un billet actif pour un événement
    // (évite la double réservation)
    boolean existsByUserIdAndEventIdAndStatusNot(
            Long userId, Long eventId, TicketStatus status);

    /**
     * Compte tous les billets avec un statut donné.
     * Utilisé pour : total billets vendus, annulés...
     */
    long countByStatus(TicketStatus status);

    /**
     * Calcule le revenu total — somme de tous les prix
     * des billets PAID et USED.
     *
     * @Query JPQL : SUM(t.price) sur les billets dont
     * le statut est dans la liste fournie.
     * COALESCE(..., 0) → retourne 0 si aucun résultat
     * au lieu de null (évite NullPointerException).
     */
    @Query("SELECT COALESCE(SUM(t.price), 0) FROM Ticket t " +
            "WHERE t.status IN :statuses")
    BigDecimal sumRevenueByStatuses(
            @org.springframework.data.repository.query.Param("statuses")
            List<TicketStatus> statuses);

    /**
     * Compte les billets vendus par événement.
     * Retourne une liste de tableaux Object[] :
     * [0] = event (objet Event)
     * [1] = count (nombre de billets)
     *
     * ORDER BY count DESC → les plus vendus en premier.
     */
    @Query("SELECT t.event, COUNT(t) as ticketCount " +
            "FROM Ticket t " +
            "WHERE t.status IN ('PAID', 'USED') " +
            "GROUP BY t.event " +
            "ORDER BY ticketCount DESC")
    List<Object[]> findTopEventsByTicketsSold();

    // Compte tous les billets d'un événement (tous statuts confondus)
    long countByEventId(Long eventId);

    // Compter les billets vendus pour un événement
    long countByEventIdAndStatus(Long eventId, TicketStatus status);
}