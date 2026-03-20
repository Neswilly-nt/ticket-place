package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.request.EventRequest;
import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.EventResponse;
import com.insi.ticketplace.entity.EventCategory;
import com.insi.ticketplace.entity.EventStatus;
import com.insi.ticketplace.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    /**
     * @AuthenticationPrincipal UserDetails userDetails
     * → Spring injecte automatiquement l'utilisateur connecté
     *   (extrait du token JWT par JwtAuthFilter).
     * On récupère son email avec userDetails.getUsername()
     * pour savoir QUI fait la requête.
     */

    // Créer un événement — ADMIN ou ORGANIZER uniquement
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        EventResponse response = eventService.createEvent(
                request, userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Événement créé", response));
    }

    // Lister tous les événements — tout le monde (même non connecté)
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(
                ApiResponse.success("Liste des événements",
                        eventService.getAll()));
    }

    // Détail d'un événement par ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Événement trouvé",
                        eventService.getById(id)));
    }

    // Recherche par mot-clé dans le titre
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponse>>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success("Résultats de recherche",
                        eventService.search(keyword)));
    }

    // Filtrer par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByStatus(
            @PathVariable EventStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Événements par statut",
                        eventService.getByStatus(status)));
    }

    // Filtrer par catégorie
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByCategory(
            @PathVariable EventCategory category) {
        return ResponseEntity.ok(
                ApiResponse.success("Événements par catégorie",
                        eventService.getByCategory(category)));
    }

    // Modifier un événement
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success("Événement modifié",
                        eventService.updateEvent(id, request,
                                userDetails.getUsername())));
    }

    // Publier un événement (DRAFT → PUBLISHED)
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success("Événement publié",
                        eventService.publish(id,
                                userDetails.getUsername())));
    }

    // Annuler un événement
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success("Événement annulé",
                        eventService.cancel(id,
                                userDetails.getUsername())));
    }

    // Supprimer un événement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        eventService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Événement supprimé", null));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<EventResponse>>> filter(
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) EventCategory category,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Le Controller extrait juste les rôles et délègue tout au Service
        boolean isAdmin = userDetails != null &&
                userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority()
                                .equals("ROLE_ADMIN"));

        boolean isOrganizer = userDetails != null &&
                userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority()
                                .equals("ROLE_ORGANIZER"));

        String userEmail = userDetails != null
                ? userDetails.getUsername() : null;

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Événements filtrés",
                        eventService.filter(
                                status, category,
                                userEmail, isAdmin, isOrganizer)));
    }
}