package com.insi.ticketplace.repository;

import com.insi.ticketplace.entity.Ticket;
import com.insi.ticketplace.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

    // Compter les billets vendus pour un événement
    long countByEventIdAndStatus(Long eventId, TicketStatus status);
}