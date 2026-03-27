package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.request.EventRequest;
import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.EventResponse;
import com.insi.ticketplace.entity.EventCategory;
import com.insi.ticketplace.entity.EventStatus;
import com.insi.ticketplace.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Événements",
        description = "Gestion des événements — création, modification, publication")
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

    @Operation(summary = "Créer un événement",
            description = "Réservé aux ADMIN et ORGANIZER",
            security = @SecurityRequirement(name = "bearerAuth"))
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

    @Operation(summary = "Lister les événements publiés",
            description = "Accessible sans token — retourne seulement les PUBLISHED")
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(
                ApiResponse.success("Liste des événements",
                        eventService.getAll()));
    }

    @Operation(summary = "Détail d'un événement par ID",
            description = "Accessible sans token")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Événement trouvé",
                        eventService.getById(id)));
    }

    @Operation(summary = "Rechercher des événements par mot-clé",
            description = "Recherche dans le titre — accessible sans token")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponse>>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success("Résultats de recherche",
                        eventService.search(keyword)));
    }

    @Operation(summary = "Filtrer par statut",
            description = "Ex: PUBLISHED, DRAFT, CANCELLED — ADMIN recommandé")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByStatus(
            @PathVariable EventStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Événements par statut",
                        eventService.getByStatus(status)));
    }

    @Operation(summary = "Filtrer par catégorie",
            description = "Ex: CONCERT, CONFERENCE, THEATRE")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByCategory(
            @PathVariable EventCategory category) {
        return ResponseEntity.ok(
                ApiResponse.success("Événements par catégorie",
                        eventService.getByCategory(category)));
    }

    @Operation(summary = "Modifier un événement",
            description = "Seulement si status = DRAFT",
            security = @SecurityRequirement(name = "bearerAuth"))
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

    @Operation(summary = "Publier un événement (DRAFT → PUBLISHED)",
            security = @SecurityRequirement(name = "bearerAuth"))
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

    @Operation(summary = "Annuler un événement",
            description = "Impossible si déjà CANCELLED ou COMPLETED",
            security = @SecurityRequirement(name = "bearerAuth"))
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

    @Operation(summary = "Supprimer un événement",
            description = "Seulement si status = DRAFT",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        eventService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Événement supprimé", null));
    }

    @Operation(summary = "Filtrer les événements",
            description = """
                   Filtre adapté selon le rôle :
                   - Sans token / USER → seulement les PUBLISHED
                   - ORGANIZER → ses événements tous statuts
                   - ADMIN → tout sans restriction
                   """)
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<EventResponse>>> filter(
            @Parameter(description = "Statut de l'événement (optionnel)")
            @RequestParam(required = false) EventStatus status,
            @Parameter(description = "Catégorie de l'événement (optionnel)")
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