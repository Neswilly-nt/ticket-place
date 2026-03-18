package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.LoginRequest;
import com.insi.ticketplace.dto.request.RegisterRequest;
import com.insi.ticketplace.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}