package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.EventRequest;
import com.insi.ticketplace.dto.response.EventResponse;
import com.insi.ticketplace.entity.EventCategory;
import com.insi.ticketplace.entity.EventStatus;

import java.util.List;

public interface EventService {
    EventResponse createEvent(EventRequest request, String organizerEmail);
    EventResponse updateEvent(Long id, EventRequest request, String organizerEmail);
    EventResponse getById(Long id);
    List<EventResponse> getAll();
    List<EventResponse> getByStatus(EventStatus status);
    List<EventResponse> getByCategory(EventCategory category);
    List<EventResponse> search(String keyword);
    EventResponse publish(Long id, String organizerEmail);
    EventResponse cancel(Long id, String organizerEmail);
    void delete(Long id, String organizerEmail);
    List<EventResponse> filter(EventStatus status,
                               EventCategory category,
                               String userEmail,
                               boolean isAdmin,
                               boolean isOrganizer);
}