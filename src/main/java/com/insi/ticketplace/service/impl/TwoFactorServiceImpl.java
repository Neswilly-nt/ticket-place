package com.insi.ticketplace.service.impl;

import com.insi.ticketplace.dto.response.AuthResponse;
import com.insi.ticketplace.entity.User;
import com.insi.ticketplace.exception.AppException;
import com.insi.ticketplace.repository.UserRepository;
import com.insi.ticketplace.security.JwtService;
import com.insi.ticketplace.service.TwoFactorService;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TwoFactorServiceImpl implements TwoFactorService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();

    @Override
    public String generateSecret() {
        return secretGenerator.generate();
    }

    @Override
    public String generateQrCodeUri(String secret, String email) {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("Ticket Place")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    @Override
    public boolean verifyCode(String secret, String code) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        return verifier.isValidCode(secret, code);
    }

    @Override
    @Transactional
    public AuthResponse setupAndEnable(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        String secret = user.getTwoFactorSecret();
        if (secret == null) {
            throw new AppException("Aucune configuration 2FA en cours. Appelez /setup d'abord.", HttpStatus.BAD_REQUEST);
        }
        if (!verifyCode(secret, code)) {
            throw new AppException("Code invalide", HttpStatus.UNAUTHORIZED);
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .twoFactorEnabled(true)
                .build();
    }

    @Override
    @Transactional
    public void disable(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (!user.isTwoFactorEnabled()) {
            throw new AppException("La 2FA n'est pas activée", HttpStatus.BAD_REQUEST);
        }
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new AppException("Code invalide", HttpStatus.UNAUTHORIZED);
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    @Override
    public AuthResponse verifyAndLogin(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (!user.isTwoFactorEnabled()) {
            throw new AppException("La 2FA n'est pas activée pour cet utilisateur", HttpStatus.BAD_REQUEST);
        }
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new AppException("Code invalide", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .twoFactorEnabled(true)
                .build();
    }

    @Override
    @Transactional
    public String getCurrentSecret(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (user.isTwoFactorEnabled()) {
            throw new AppException("La 2FA est déjà activée. Désactivez-la d'abord.", HttpStatus.BAD_REQUEST);
        }

        String secret = generateSecret();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);
        return secret;
    }
}
