package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.request.SubscriptionRequest;
import com.insi.ticketplace.dto.response.SubscriptionResponse;
import com.insi.ticketplace.dto.response.SubscriptionStatsResponse;
import com.insi.ticketplace.entity.*;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.SubscriptionRepository;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SubscriptionResponse subscribe(SubscriptionRequest request, String organizerEmail) {
        User organizer = findOrganizer(organizerEmail);

        Optional<Subscription> existing = subscriptionRepository
                .findTopByOrganizerIdAndStatusOrderByEndDateDesc(
                        organizer.getId(), SubscriptionStatus.ACTIVE);

        if (existing.isPresent() && existing.get().getEndDate().isAfter(LocalDateTime.now())) {
            throw new AppException(
                    "Vous avez déjà un abonnement actif jusqu'au "
                            + existing.get().getEndDate().toLocalDate(),
                    HttpStatus.CONFLICT);
        }

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusMonths(request.getPlan().getDurationMonths());

        Subscription subscription = Subscription.builder()
                .organizer(organizer)
                .plan(request.getPlan())
                .status(SubscriptionStatus.ACTIVE)
                .price(request.getPlan().getPrice())
                .startDate(start)
                .endDate(end)
                .build();

        return toResponse(subscriptionRepository.save(subscription));
    }

    @Override
    public SubscriptionResponse getMySubscription(String organizerEmail) {
        User organizer = findOrganizer(organizerEmail);

        Optional<Subscription> active = subscriptionRepository
                .findTopByOrganizerIdAndStatusOrderByEndDateDesc(
                        organizer.getId(), SubscriptionStatus.ACTIVE);

        if (active.isPresent()) {
            return toResponse(active.get());
        }

        List<Subscription> all = subscriptionRepository
                .findByOrganizerIdOrderByCreatedAtDesc(organizer.getId());

        if (!all.isEmpty()) {
            return toResponse(all.get(0));
        }

        throw new AppException("Aucun abonnement trouvé", HttpStatus.NOT_FOUND);
    }

    @Override
    @Transactional
    public SubscriptionResponse cancelSubscription(String organizerEmail) {
        User organizer = findOrganizer(organizerEmail);

        Subscription subscription = subscriptionRepository
                .findTopByOrganizerIdAndStatusOrderByEndDateDesc(
                        organizer.getId(), SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(
                        "Aucun abonnement actif à annuler", HttpStatus.NOT_FOUND));

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        return toResponse(subscriptionRepository.save(subscription));
    }

    @Override
    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SubscriptionStatsResponse getStats() {
        List<Subscription> all = subscriptionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long active = all.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE && s.getEndDate().isAfter(now))
                .count();
        long expired = all.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.EXPIRED
                        || (s.getStatus() == SubscriptionStatus.ACTIVE && !s.getEndDate().isAfter(now)))
                .count();
        long cancelled = all.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.CANCELLED)
                .count();
        long monthly = all.stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.MONTHLY)
                .count();
        long yearly = all.stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.YEARLY)
                .count();

        java.math.BigDecimal totalRevenue = all.stream()
                .map(Subscription::getPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal monthlyRevenue = all.stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.MONTHLY)
                .map(Subscription::getPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal yearlyRevenue = all.stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.YEARLY)
                .map(Subscription::getPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal activeRevenue = all.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE && s.getEndDate().isAfter(now))
                .map(Subscription::getPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return SubscriptionStatsResponse.builder()
                .totalSubscriptions(all.size())
                .activeSubscriptions(active)
                .expiredSubscriptions(expired)
                .cancelledSubscriptions(cancelled)
                .monthlyCount(monthly)
                .yearlyCount(yearly)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .yearlyRevenue(yearlyRevenue)
                .activeRevenue(activeRevenue)
                .build();
    }

    @Override
    public boolean hasActiveSubscription(String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElse(null);
        if (organizer == null) return false;

        return subscriptionRepository.existsByOrganizerIdAndStatusAndEndDateAfter(
                organizer.getId(), SubscriptionStatus.ACTIVE, LocalDateTime.now());
    }

    private User findOrganizer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.ORGANIZER && user.getRole() != Role.ADMIN) {
            throw new AppException(
                    "Seuls les organisateurs peuvent souscrire à un abonnement",
                    HttpStatus.FORBIDDEN);
        }

        return user;
    }

    private SubscriptionResponse toResponse(Subscription s) {
        LocalDateTime now = LocalDateTime.now();
        boolean active = s.getStatus() == SubscriptionStatus.ACTIVE
                && s.getEndDate().isAfter(now);
        long daysRemaining = active ? ChronoUnit.DAYS.between(now, s.getEndDate()) : 0;

        return SubscriptionResponse.builder()
                .id(s.getId())
                .organizerName(s.getOrganizer().getFirstName()
                        + " " + s.getOrganizer().getLastName())
                .organizerEmail(s.getOrganizer().getEmail())
                .plan(s.getPlan())
                .status(s.getStatus())
                .price(s.getPrice())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .createdAt(s.getCreatedAt())
                .active(active)
                .daysRemaining(daysRemaining)
                .build();
    }
}
