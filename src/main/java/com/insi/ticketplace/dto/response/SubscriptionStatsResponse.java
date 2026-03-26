package com.insi.ticketplace.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SubscriptionStatsResponse {
    private long totalSubscriptions;
    private long activeSubscriptions;
    private long expiredSubscriptions;
    private long cancelledSubscriptions;
    private long monthlyCount;
    private long yearlyCount;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;
    private BigDecimal activeRevenue;
}
