package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.response.DashboardResponse;
import com.insi.ticketplace.dto.response.EventStatsResponse;
import java.util.List;

public interface DashboardService {
    DashboardResponse getAdminDashboard();
    List<EventStatsResponse> getOrganizerDashboard(String organizerEmail);
}