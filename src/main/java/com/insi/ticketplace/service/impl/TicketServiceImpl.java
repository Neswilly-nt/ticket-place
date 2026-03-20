package com.insi.ticketplace.service.impl;

import com.google.zxing.WriterException;
import com.insi.ticketplace.dto.request.TicketRequest;
import com.insi.ticketplace.dto.response.TicketResponse;
import com.insi.ticketplace.entity.*;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.EventRepository;
import com.insi.ticketplace.repository.TicketRepository;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.service.TicketService;
import com.insi.ticketplace.util.QrCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QrCodeService qrCodeService;

    /**
     * Réserver un ou plusieurs billets.
     *
     * @Transactional garantit que TOUTES les opérations
     * réussissent ou TOUTES échouent ensemble.
     * Ex: si on crée 3 billets et que le 3ème échoue,
     * les 2 premiers sont automatiquement annulés.
     * C'est ce qu'on appelle une transaction atomique.
     */
    @Override
    @Transactional
    public List<TicketResponse> reserve(TicketRequest request,
                                        String userEmail) {
        // 1. Charger l'utilisateur connecté
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(
                        "Utilisateur introuvable", HttpStatus.NOT_FOUND));

        // 2. Charger l'événement
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new AppException(
                        "Événement introuvable", HttpStatus.NOT_FOUND));

        // 3. Vérifier que l'événement est bien PUBLISHED
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new AppException(
                    "Cet événement n'est pas disponible à la réservation",
                    HttpStatus.BAD_REQUEST);
        }

        // 4. Vérifier qu'il y a assez de places
        if (event.getAvailableSeats() < request.getQuantity()) {
            throw new AppException(
                    "Pas assez de places disponibles. Restant : "
                            + event.getAvailableSeats(),
                    HttpStatus.BAD_REQUEST);
        }

        // 5. Vérifier que l'user n'a pas déjà un billet actif
        boolean alreadyBooked = ticketRepository
                .existsByUserIdAndEventIdAndStatusNot(
                        user.getId(), event.getId(),
                        TicketStatus.CANCELLED);

        if (alreadyBooked) {
            throw new AppException(
                    "Vous avez déjà réservé un billet pour cet événement",
                    HttpStatus.CONFLICT);
        }

        // 6. Créer les billets
        List<Ticket> tickets = new ArrayList<>();

        for (int i = 0; i < request.getQuantity(); i++) {
            Ticket ticket = Ticket.builder()
                    .user(user)
                    .event(event)
                    .price(event.getPrice())     // snapshot du prix
                    .qrCode(qrCodeService.generateQrCode())
                    .status(TicketStatus.RESERVED)
                    .build();
            tickets.add(ticket);
        }

        // 7. Décrémenter les places disponibles
        event.setAvailableSeats(
                event.getAvailableSeats() - request.getQuantity());
        eventRepository.save(event);

        // 8. Sauvegarder tous les billets
        List<Ticket> saved = ticketRepository.saveAll(tickets);

        log.info("✅ {} billet(s) réservé(s) pour {} - événement '{}'",
                request.getQuantity(), userEmail, event.getTitle());

        return saved.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public TicketResponse pay(Long ticketId, String userEmail) {
        Ticket ticket = getTicketAndCheckOwnership(ticketId, userEmail);

        if (ticket.getStatus() != TicketStatus.RESERVED) {
            throw new AppException(
                    "Seul un billet réservé peut être payé",
                    HttpStatus.BAD_REQUEST);
        }

        ticket.setStatus(TicketStatus.PAID);
        ticket.setPaidAt(LocalDateTime.now());

        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse cancel(Long ticketId, String userEmail) {
        Ticket ticket = getTicketAndCheckOwnership(ticketId, userEmail);

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new AppException(
                    "Un billet déjà utilisé ne peut pas être annulé",
                    HttpStatus.BAD_REQUEST);
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(
                    "Ce billet est déjà annulé",
                    HttpStatus.BAD_REQUEST);
        }

        // Remettre la place disponible
        Event event = ticket.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + 1);
        eventRepository.save(event);

        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setCancelledAt(LocalDateTime.now());

        return toResponse(ticketRepository.save(ticket));
    }

    /**
     * Vérification du billet au scan QR à l'entrée.
     * Le scanner lit le QR Code → envoie le code au serveur
     * → le serveur vérifie et marque le billet USED.
     */
    @Override
    @Transactional
    public TicketResponse verify(String qrCode) {
        Ticket ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new AppException(
                        "QR Code invalide", HttpStatus.NOT_FOUND));

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new AppException(
                    "Ce billet a déjà été utilisé",
                    HttpStatus.BAD_REQUEST);
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(
                    "Ce billet est annulé",
                    HttpStatus.BAD_REQUEST);
        }

        if (ticket.getStatus() == TicketStatus.RESERVED) {
            throw new AppException(
                    "Ce billet n'a pas encore été payé",
                    HttpStatus.BAD_REQUEST);
        }

        // Marquer comme utilisé
        ticket.setStatus(TicketStatus.USED);
        ticket.setUsedAt(LocalDateTime.now());

        log.info("🎫 Billet {} scanné et validé pour '{}'",
                qrCode, ticket.getEvent().getTitle());

        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public List<TicketResponse> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(
                        "Utilisateur introuvable", HttpStatus.NOT_FOUND));

        return ticketRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<TicketResponse> getTicketsByEvent(Long eventId,
                                                  String organizerEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(
                        "Événement introuvable", HttpStatus.NOT_FOUND));

        // Seul l'organisateur ou l'admin peut voir les billets
        if (!event.getOrganizer().getEmail().equals(organizerEmail)) {
            throw new AppException(
                    "Accès non autorisé", HttpStatus.FORBIDDEN);
        }

        return ticketRepository.findByEventId(eventId)
                .stream().map(this::toResponse).toList();
    }

    // ===== Méthodes privées =====

    private Ticket getTicketAndCheckOwnership(Long ticketId,
                                              String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(
                        "Billet introuvable", HttpStatus.NOT_FOUND));

        if (!ticket.getUser().getEmail().equals(userEmail)) {
            throw new AppException(
                    "Ce billet ne vous appartient pas",
                    HttpStatus.FORBIDDEN);
        }

        return ticket;
    }

    private TicketResponse toResponse(Ticket ticket) {
        String qrCodeImage = null;

        // Générer l'image QR Code seulement si le billet est PAID
        if (ticket.getStatus() == TicketStatus.PAID) {
            try {
                qrCodeImage = qrCodeService
                        .generateQrCodeImage(ticket.getQrCode(), 200, 200);
            } catch (WriterException | IOException e) {
                log.warn("Impossible de générer l'image QR : {}",
                        e.getMessage());
            }
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .eventTitle(ticket.getEvent().getTitle())
                .eventLocation(ticket.getEvent().getLocation())
                .eventDate(ticket.getEvent().getEventDate())
                .userName(ticket.getUser().getFirstName()
                        + " " + ticket.getUser().getLastName())
                .price(ticket.getPrice())
                .status(ticket.getStatus())
                .qrCode(ticket.getQrCode())
                .qrCodeImage(qrCodeImage)
                .reservedAt(ticket.getReservedAt())
                .build();
    }
    /**
     * Stats détaillées des billets d'un événement.
     * Utile pour l'organisateur qui veut savoir :
     * combien de billets sont RESERVED, PAID, USED, CANCELLED
     * pour son événement.
     */
    @Override
    public Map<String, Long> getEventTicketStats(Long eventId,
                                                 String userEmail) {
        // Vérifie que l'événement existe et appartient à cet organisateur
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(
                        "Événement introuvable", HttpStatus.NOT_FOUND));

        if (!event.getOrganizer().getEmail().equals(userEmail)) {
            throw new AppException(
                    "Accès non autorisé", HttpStatus.FORBIDDEN);
        }

        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("RESERVED", ticketRepository
                .countByEventIdAndStatus(eventId, TicketStatus.RESERVED));
        stats.put("PAID",     ticketRepository
                .countByEventIdAndStatus(eventId, TicketStatus.PAID));
        stats.put("USED",     ticketRepository
                .countByEventIdAndStatus(eventId, TicketStatus.USED));
        stats.put("CANCELLED",ticketRepository
                .countByEventIdAndStatus(eventId, TicketStatus.CANCELLED));
        stats.put("TOTAL",    ticketRepository
                .countByEventId(eventId));

        return stats;
    }
}