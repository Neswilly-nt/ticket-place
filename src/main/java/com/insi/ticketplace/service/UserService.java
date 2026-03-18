package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.request.RegisterRequest;
import com.insi.ticketplace.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse registerUser(RegisterRequest request);
    UserResponse findById(Long id);
    List<UserResponse> findAll();
    void deleteById(Long id);
}