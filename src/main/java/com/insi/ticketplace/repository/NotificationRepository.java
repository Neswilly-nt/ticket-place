package com.insi.ticketplace.repository;

import com.insi.ticketplace.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllReadByUserId(Long userId);
}
