package com.insi.ticketplace.dto.request;

import com.insi.ticketplace.entity.EventCategory;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de création/modification d'un événement.
 * Contient uniquement ce que le client envoie —
 * pas l'organisateur (on le récupère depuis le token JWT)
 * pas le statut (géré par le serveur)
 * pas les dates de création (gérées automatiquement)
 */
@Data
public class EventRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;

    @NotNull(message = "La date est obligatoire")
    @Future(message = "La date doit être dans le futur")
    private LocalDateTime eventDate;

    @NotBlank(message = "Le lieu est obligatoire")
    private String location;

    @NotNull
    @Min(value = 1, message = "Au moins 1 place requise")
    private Integer totalSeats;

    @NotNull
    @DecimalMin(value = "0.0", message = "Le prix ne peut pas être négatif")
    private BigDecimal price;

    private EventCategory category = EventCategory.OTHER;
}