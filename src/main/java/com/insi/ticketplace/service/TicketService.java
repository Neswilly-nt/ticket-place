package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.TicketRequest;
import com.insi.ticketplace.dto.response.TicketResponse;
import java.util.List;
import java.util.Map;

public interface TicketService {
    List<TicketResponse> reserve(TicketRequest request, String userEmail);
    TicketResponse pay(Long ticketId, String userEmail);
    TicketResponse cancel(Long ticketId, String userEmail);
    TicketResponse verify(String qrCode);   // scan à l'entrée
    List<TicketResponse> getMyTickets(String userEmail);
    List<TicketResponse> getTicketsByEvent(Long eventId, String organizerEmail);
    Map<String, Long> getEventTicketStats(Long eventId, String userEmail);
}