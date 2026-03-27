package com.insi.ticketplace.dto.request;

import com.insi.ticketplace.entity.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionRequest {

    @NotNull(message = "Le plan d'abonnement est requis")
    private SubscriptionPlan plan;
}
