package com.insi.ticketplace.dto.response;

import com.insi.ticketplace.entity.EventCategory;
import com.insi.ticketplace.entity.EventStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de réponse — on n'expose jamais l'entité directement.
 * Pourquoi ? L'entité contient des relations JPA (@ManyToOne)
 * qui peuvent causer des boucles infinies en JSON ou charger
 * trop de données non nécessaires.
 */
@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal price;
    private EventCategory category;
    private EventStatus status;
    private String organizerName;   // prénom + nom de l'organisateur
    private LocalDateTime createdAt;
}