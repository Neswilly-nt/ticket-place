package com.insi.ticketplace.controller;

import com.insi.ticketplace.dto.response.ApiResponse;
import com.insi.ticketplace.dto.response.AuthResponse;
import com.insi.ticketplace.service.TwoFactorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TwoFactorController {

    private final TwoFactorService twoFactorService;

    @GetMapping("/setup")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        String secret = twoFactorService.getCurrentSecret(email);
        String uri = twoFactorService.generateQrCodeUri(secret, email);

        return ResponseEntity.ok(ApiResponse.success("Configuration 2FA prête",
                Map.of("secret", secret, "qrUri", uri)));
    }

    @PostMapping("/enable")
    public ResponseEntity<ApiResponse<AuthResponse>> enable(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String code = body.get("code");
        AuthResponse response = twoFactorService.setupAndEnable(userDetails.getUsername(), code);
        return ResponseEntity.ok(ApiResponse.success("Authentification à 2 facteurs activée", response));
    }

    @PostMapping("/disable")
    public ResponseEntity<ApiResponse<Void>> disable(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String code = body.get("code");
        twoFactorService.disable(userDetails.getUsername(), code);
        return ResponseEntity.ok(ApiResponse.success("Authentification à 2 facteurs désactivée", null));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verify(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String code = body.get("code");
        AuthResponse response = twoFactorService.verifyAndLogin(email, code);
        return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
    }
}
