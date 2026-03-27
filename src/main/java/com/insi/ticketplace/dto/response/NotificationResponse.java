package com.insi.ticketplace.dto.response;

import com.insi.ticketplace.entity.NotificationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private Long relatedId;
    private LocalDateTime createdAt;
}
