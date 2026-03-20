package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.DashboardResponse;
import com.insi.ticketplace.dto.response.EventStatsResponse;
import com.insi.ticketplace.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Dashboard global — ADMIN uniquement.
     * Retourne toutes les statistiques de la plateforme.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard administrateur",
                        dashboardService.getAdminDashboard()));
    }

    /**
     * Dashboard organisateur — ADMIN ou ORGANIZER.
     * Retourne les stats des événements de l'organisateur connecté.
     */
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