package com.insi.ticketplace.dto.response;

import com.insi.ticketplace.entity.TicketStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String eventTitle;
    private String eventLocation;
    private LocalDateTime eventDate;
    private String userName;
    private BigDecimal price;
    private TicketStatus status;
    private String qrCode;          // l'UUID du billet
    private String qrCodeImage;     // image base64 (optionnel)
    private LocalDateTime reservedAt;
}