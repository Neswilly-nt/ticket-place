package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.response.NotificationResponse;
import com.insi.ticketplace.entity.Notification;
import com.insi.ticketplace.entity.NotificationType;
import com.insi.ticketplace.entity.User;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.NotificationRepository;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void send(User user, NotificationType type,
                     String title, String message, Long relatedId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notifications",
                    response);
            log.debug("Notification pushed to {}: {}", user.getEmail(), title);
        } catch (Exception e) {
            log.warn("Could not push WS notification to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Override
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = getUser(email);
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public long countUnread(String email) {
        User user = getUser(email);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markRead(Long notificationId, String email) {
        User user = getUser(email);
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException("Notification introuvable", HttpStatus.NOT_FOUND));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new AppException("Accès non autorisé", HttpStatus.FORBIDDEN);
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void markAllRead(String email) {
        User user = getUser(email);
        notificationRepository.markAllReadByUserId(user.getId());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .relatedId(n.getRelatedId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
