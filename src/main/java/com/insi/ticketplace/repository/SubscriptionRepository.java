package com.insi.ticketplace.repository;

import com.insi.ticketplace.entity.Subscription;
import com.insi.ticketplace.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);

    Optional<Subscription> findTopByOrganizerIdAndStatusOrderByEndDateDesc(
            Long organizerId, SubscriptionStatus status);

    boolean existsByOrganizerIdAndStatusAndEndDateAfter(
            Long organizerId, SubscriptionStatus status, LocalDateTime date);
}
