package com.insi.ticketplace.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Pour réserver un billet, le client envoie uniquement :
 * - l'ID de l'événement
 * - la quantité souhaitée
 *
 * Tout le reste (prix, QR code, statut, user)
 * est géré automatiquement par le serveur.
 */
@Data
public class TicketRequest {

    @NotNull(message = "L'événement est obligatoire")
    private Long eventId;

    @NotNull
    @Min(value = 1, message = "Au moins 1 billet requis")
    private Integer quantity;
}