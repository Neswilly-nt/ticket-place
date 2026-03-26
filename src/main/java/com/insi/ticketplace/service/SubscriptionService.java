package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.SubscriptionRequest;
import com.insi.ticketplace.dto.response.SubscriptionResponse;
import com.insi.ticketplace.dto.response.SubscriptionStatsResponse;

import java.util.List;

public interface SubscriptionService {
    SubscriptionResponse subscribe(SubscriptionRequest request, String organizerEmail);
    SubscriptionResponse getMySubscription(String organizerEmail);
    SubscriptionResponse cancelSubscription(String organizerEmail);
    List<SubscriptionResponse> getAllSubscriptions();
    boolean hasActiveSubscription(String organizerEmail);
    SubscriptionStatsResponse getStats();
}
