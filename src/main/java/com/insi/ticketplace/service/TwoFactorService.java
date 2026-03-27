package com.insi.ticketplace.service;

import com.insi.ticketplace.dto.response.AuthResponse;

public interface TwoFactorService {
    String generateSecret();
    String generateQrCodeUri(String secret, String email);
    boolean verifyCode(String secret, String code);
    AuthResponse setupAndEnable(String email, String code);
    void disable(String email, String code);
    AuthResponse verifyAndLogin(String email, String code);
    String getCurrentSecret(String email);
}
