package com.insi.ticketplace.dto.response;

import com.insi.ticketplace.entity.SubscriptionPlan;
import com.insi.ticketplace.entity.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponse {
    private Long id;
    private String organizerName;
    private String organizerEmail;
    private SubscriptionPlan plan;
    private SubscriptionStatus status;
    private BigDecimal price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean active;
    private long daysRemaining;
}
