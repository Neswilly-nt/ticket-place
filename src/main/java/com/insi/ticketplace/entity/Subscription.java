package com.insi.ticketplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
