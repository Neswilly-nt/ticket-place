package com.insi.ticketplace.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Le prénom est requis")
    private String firstName;
    
    @NotBlank(message = "Le nom est requis")
    private String lastName;
    
    @NotBlank(message = "L'email est requis")
    @Email(message = "Email invalide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;
}
