package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.DashboardResponse;
import com.insi.ticketplace.dto.response.EventStatsResponse;
import com.insi.ticketplace.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Dashboard",
        description = "Statistiques et tableaux de bord")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Dashboard administrateur",
            description = "Statistiques globales — ADMIN uniquement",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard administrateur",
                        dashboardService.getAdminDashboard()));
    }

    @Operation(summary = "Dashboard organisateur",
            description = "Statistiques des événements de l'organisateur connecté",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/organizer")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<EventStatsResponse>>>
    getOrganizerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard organisateur",
                        dashboardService.getOrganizerDashboard(
                                userDetails.getUsername())));
    }
}