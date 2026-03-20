package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.request.TicketRequest;
import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.TicketResponse;
import com.insi.ticketplace.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // Réserver un billet — tout utilisateur connecté
    @PostMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> reserve(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<TicketResponse> tickets = ticketService.reserve(
                request, userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        tickets.size() + " billet(s) réservé(s)", tickets));
    }

    // Payer un billet
    @PatchMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<TicketResponse>> pay(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Billet payé",
                ticketService.pay(id, userDetails.getUsername())));
    }

    // Annuler un billet
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<TicketResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Billet annulé",
                ticketService.cancel(id, userDetails.getUsername())));
    }

    // Mes billets — historique de l'utilisateur connecté
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Mes billets",
                ticketService.getMyTickets(userDetails.getUsername())));
    }

    // Vérifier un billet au scan — ADMIN ou ORGANIZER
    @GetMapping("/verify/{qrCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<TicketResponse>> verify(
            @PathVariable String qrCode) {

        return ResponseEntity.ok(ApiResponse.success(
                "Billet valide ✅",
                ticketService.verify(qrCode)));
    }

    // Billets d'un événement — pour l'organisateur
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getByEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Billets de l'événement",
                ticketService.getTicketsByEvent(
                        eventId, userDetails.getUsername())));
    }

    @GetMapping("/event/{eventId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getEventTicketStats(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Stats billets événement " + eventId,
                        ticketService.getEventTicketStats(
                                eventId, userDetails.getUsername())));
    }
}