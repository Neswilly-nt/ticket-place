package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.request.SubscriptionRequest;
import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.SubscriptionResponse;
import com.insi.ticketplace.dto.response.SubscriptionStatsResponse;
import com.insi.ticketplace.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "Abonnements",
        description = "Gestion des abonnements organisateurs")
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "Souscrire à un abonnement",
            description = "ORGANIZER uniquement — MONTHLY (29.99€) ou YEARLY (249.99€)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> subscribe(
            @Valid @RequestBody SubscriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        SubscriptionResponse response = subscriptionService.subscribe(
                request, userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Abonnement souscrit avec succès", response));
    }

    @Operation(summary = "Mon abonnement actuel",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getMySubscription(
            @AuthenticationPrincipal UserDetails userDetails) {

        SubscriptionResponse response = subscriptionService
                .getMySubscription(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success("Abonnement trouvé", response));
    }

    @Operation(summary = "Annuler mon abonnement",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(
            @AuthenticationPrincipal UserDetails userDetails) {

        SubscriptionResponse response = subscriptionService
                .cancelSubscription(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success("Abonnement annulé", response));
    }

    @Operation(summary = "Lister tous les abonnements",
            description = "ADMIN uniquement",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getAllSubscriptions() {
        return ResponseEntity.ok(
                ApiResponse.success("Liste des abonnements",
                        subscriptionService.getAllSubscriptions()));
    }

    @Operation(summary = "Statistiques des abonnements",
            description = "ADMIN uniquement — revenus et compteurs",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Statistiques des abonnements",
                        subscriptionService.getStats()));
    }
}
