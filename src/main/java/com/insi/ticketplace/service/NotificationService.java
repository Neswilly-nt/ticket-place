package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.response.NotificationResponse;
import com.insi.ticketplace.entity.NotificationType;
import com.insi.ticketplace.entity.User;

import java.util.List;

public interface NotificationService {

    void send(User user, NotificationType type, String title, String message, Long relatedId);

    List<NotificationResponse> getMyNotifications(String email);

    long countUnread(String email);

    void markRead(Long notificationId, String email);

    void markAllRead(String email);
}
