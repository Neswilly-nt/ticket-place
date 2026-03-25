package com.insi.ticketplace.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.converter.HttpMessageNotReadableException;


import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Gère nos exceptions métier personnalisées
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        return buildResponse(ex.getMessage(), ex.getStatus());
    }

    // Gère les erreurs de validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + " : " + e.getDefaultMessage())
                .toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", 400);
        body.put("errors", errors);

        return ResponseEntity.badRequest().body(body);
    }

    // Gère les erreurs non prévues
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {
        return buildResponse(
                "Accès refusé — vous n'avez pas les droits nécessaires",
                HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(
            AuthenticationException ex) {
        return buildResponse(
                "Non authentifié — token manquant ou invalide",
                HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(
            HttpMessageNotReadableException ex) {

        String message = "Format JSON invalide";

        // Déterminer la cause précise pour un message utile
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife) {
            String fieldName = ife.getPath().isEmpty()
                    ? "inconnu"
                    : ife.getPath().get(0).getFieldName();

            // Cas spécial : date mal formatée
            if (ife.getTargetType() != null &&
                    ife.getTargetType().equals(
                            java.time.LocalDateTime.class)) {
                message = "Format de date invalide pour le champ '"
                        + fieldName
                        + "'. Format attendu : yyyy-MM-ddTHH:mm:ss"
                        + " (ex: 2026-12-15T20:00:00)";
            }
            // Cas spécial : enum invalide (ex: catégorie inexistante)
            else if (ife.getTargetType() != null &&
                    ife.getTargetType().isEnum()) {
                message = "Valeur invalide pour le champ '"
                        + fieldName + "'. Valeurs acceptées : "
                        + java.util.Arrays.toString(
                        ife.getTargetType().getEnumConstants());
            } else {
                message = "Valeur invalide pour le champ '"
                        + fieldName + "'";
            }
        }

        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }
}
