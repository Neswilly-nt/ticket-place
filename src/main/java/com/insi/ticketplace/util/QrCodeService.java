package com.insi.ticketplace.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

/**
 * Service utilitaire pour les QR Codes.
 *
 * Deux responsabilités :
 * 1. Générer un code unique (UUID) pour identifier le billet
 * 2. Convertir ce code en image QR Code (PNG en base64)
 *    pour l'afficher ou l'envoyer par email
 */
@Service
public class QrCodeService {

    /**
     * Génère un identifiant unique pour le billet.
     * UUID = Universally Unique Identifier
     * Ex: "550e8400-e29b-41d4-a716-446655440000"
     * La probabilité de collision est quasi nulle.
     */
    public String generateQrCode() {
        return UUID.randomUUID().toString();
    }

    /**
     * Convertit un texte en image QR Code.
     * Retourne l'image encodée en Base64 (format texte)
     * pour pouvoir l'intégrer dans du JSON ou du HTML.
     *
     * @param content  le texte à encoder (notre UUID)
     * @param width    largeur en pixels
     * @param height   hauteur en pixels
     * @return image PNG encodée en Base64
     */
    public String generateQrCodeImage(String content,
                                      int width, int height)
            throws WriterException, IOException {

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        // Génère la matrice de pixels noir/blanc
        BitMatrix bitMatrix = qrCodeWriter.encode(
                content, BarcodeFormat.QR_CODE, width, height);

        // Convertit en PNG dans un buffer mémoire
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        // Encode en Base64 pour transport JSON
        return Base64.getEncoder()
                .encodeToString(outputStream.toByteArray());
    }
}