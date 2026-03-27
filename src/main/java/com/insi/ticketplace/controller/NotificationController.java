package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.NotificationResponse;
import com.insi.ticketplace.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Notifications", description = "Notifications temps réel")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Mes notifications", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notifications",
                notificationService.getMyNotifications(userDetails.getUsername())));
    }

    @Operation(summary = "Nombre de notifications non lues", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUnread(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = notificationService.countUnread(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("count", count)));
    }

    @Operation(summary = "Marquer une notification comme lue", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markRead(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notification marquée comme lue", null));
    }

    @Operation(summary = "Marquer toutes les notifications comme lues", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Toutes les notifications lues", null));
    }
}
