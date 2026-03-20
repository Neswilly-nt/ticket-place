package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.request.EventRequest;
import com.insi.ticketplace.dto.response.EventResponse;
import com.insi.ticketplace.entity.*;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.EventRepository;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    public EventResponse createEvent(EventRequest request, String organizerEmail) {

        // On récupère l'utilisateur connecté depuis son email (extrait du token JWT)
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new AppException("Utilisateur introuvable",
                        HttpStatus.NOT_FOUND));

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .location(request.getLocation())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats()) // au départ = total
                .price(request.getPrice())
                .category(request.getCategory())
                .status(EventStatus.DRAFT)               // toujours DRAFT à la création
                .organizer(organizer)
                .build();

        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(Long id, EventRequest request,
                                     String organizerEmail) {
        Event event = getEventAndCheckOwnership(id, organizerEmail);

        // On ne peut modifier qu'un événement en DRAFT
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(
                    "Seul un événement en brouillon peut être modifié",
                    HttpStatus.BAD_REQUEST);
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation());
        event.setTotalSeats(request.getTotalSeats());
        event.setAvailableSeats(request.getTotalSeats());
        event.setPrice(request.getPrice());
        event.setCategory(request.getCategory());

        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse getById(Long id) {
        return toResponse(findEventById(id));
    }

    @Override
    public List<EventResponse> getAll() {
        return eventRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EventResponse> getByStatus(EventStatus status) {
        return eventRepository.findByStatus(status)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EventResponse> getByCategory(EventCategory category) {
        return eventRepository.findByCategory(category)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EventResponse> search(String keyword) {
        return eventRepository.findByTitleContainingIgnoreCase(keyword)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public EventResponse publish(Long id, String organizerEmail) {
        Event event = getEventAndCheckOwnership(id, organizerEmail);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(
                    "Seul un brouillon peut être publié",
                    HttpStatus.BAD_REQUEST);
        }

        event.setStatus(EventStatus.PUBLISHED);
        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse cancel(Long id, String organizerEmail) {
        Event event = getEventAndCheckOwnership(id, organizerEmail);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new AppException(
                    "Cet événement est déjà annulé",
                    HttpStatus.BAD_REQUEST);
        }

        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new AppException(
                    "Un événement terminé ne peut pas être annulé",
                    HttpStatus.BAD_REQUEST);
        }

        event.setStatus(EventStatus.CANCELLED);
        return toResponse(eventRepository.save(event));
    }

    @Override
    public void delete(Long id, String organizerEmail) {
        Event event = getEventAndCheckOwnership(id, organizerEmail);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(
                    "Seul un brouillon peut être supprimé",
                    HttpStatus.BAD_REQUEST);
        }

        eventRepository.delete(event);
    }

    // ===== Méthodes privées utilitaires =====

    /**
     * Vérifie que l'événement existe ET que c'est bien
     * l'organisateur connecté qui en est le propriétaire.
     * Réutilisée dans update, publish, cancel, delete.
     */
    private Event getEventAndCheckOwnership(Long id, String organizerEmail) {
        Event event = findEventById(id);

        if (!event.getOrganizer().getEmail().equals(organizerEmail)) {
            throw new AppException(
                    "Vous n'êtes pas l'organisateur de cet événement",
                    HttpStatus.FORBIDDEN);
        }

        return event;
    }

    private Event findEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        "Événement introuvable", HttpStatus.NOT_FOUND));
    }

    /**
     * Convertit l'entité Event en EventResponse (DTO).
     * On construit le nom de l'organisateur ici pour ne pas
     * exposer l'objet User entier dans la réponse.
     */
    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .totalSeats(event.getTotalSeats())
                .availableSeats(event.getAvailableSeats())
                .price(event.getPrice())
                .category(event.getCategory())
                .status(event.getStatus())
                .organizerName(event.getOrganizer().getFirstName()
                        + " " + event.getOrganizer().getLastName())
                .createdAt(event.getCreatedAt())
                .build();
    }

    @Override
    public List<EventResponse> filter(EventStatus status,
                                      EventCategory category,
                                      String userEmail,
                                      boolean isAdmin,
                                      boolean isOrganizer) {
        /**
         * Règles métier centralisées ici dans le Service :
         *
         * ADMIN      → filtre libre sur tous les événements
         * ORGANIZER  → filtre sur SES événements uniquement
         * USER       → voit seulement les PUBLISHED
         */

        if (isAdmin) {
            // Admin — aucune restriction
            return eventRepository
                    .findByStatusAndCategory(status, category)
                    .stream().map(this::toResponse).toList();
        }

        if (isOrganizer) {
            // Organizer — seulement ses propres événements
            User organizer = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new AppException(
                            "Utilisateur introuvable", HttpStatus.NOT_FOUND));

            return eventRepository
                    .findByStatusAndCategory(status, category)
                    .stream()
                    // Filtre supplémentaire : garder seulement ses événements
                    .filter(e -> e.getOrganizer().getId()
                            .equals(organizer.getId()))
                    .map(this::toResponse)
                    .toList();
        }

        // USER ou non connecté — force PUBLISHED
        return eventRepository
                .findByStatusAndCategory(EventStatus.PUBLISHED, category)
                .stream().map(this::toResponse).toList();
    }
}