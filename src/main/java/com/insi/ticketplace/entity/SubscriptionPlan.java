package com.insi.ticketplace.entity;

import java.math.BigDecimal;

public enum SubscriptionPlan {

    MONTHLY(new BigDecimal("29.99"), 1),
    YEARLY(new BigDecimal("249.99"), 12);

    private final BigDecimal price;
    private final int durationMonths;

    SubscriptionPlan(BigDecimal price, int durationMonths) {
        this.price = price;
        this.durationMonths = durationMonths;
    }

    public BigDecimal getPrice() { return price; }
    public int getDurationMonths() { return durationMonths; }
}
