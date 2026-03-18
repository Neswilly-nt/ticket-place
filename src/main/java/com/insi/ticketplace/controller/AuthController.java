package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.request.RegistrationRequest;
import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.UserResponse;
import com.insi.ticketplace.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        UserResponse userResponse = userService.registerUser(registrationRequest);
        
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Utilisateur enregistré avec succès")
                .data(userResponse)
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
