# API Documentation - Ticket Place

## Authentication Endpoints

---

### POST /api/auth/register
Inscription d'un nouvel utilisateur. Retourne un token JWT utilisable immédiatement.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "timestamp": "2026-03-18T10:17:00"
}
```

---

### POST /api/auth/login
Connexion d'un utilisateur existant. Retourne un token JWT.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "timestamp": "2026-03-18T10:17:00"
}
```

---

### Utiliser le token JWT

Toutes les routes protégées nécessitent ce header :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Validation Rules

| Champ       | Règle                              |
|-------------|------------------------------------|
| firstName   | Obligatoire, non vide              |
| lastName    | Obligatoire, non vide              |
| email       | Obligatoire, format email, unique  |
| password    | Obligatoire, minimum 8 caractères  |

---

## Error Responses

| Code | Cas                        | Message                         |
|------|----------------------------|---------------------------------|
| 400  | Champ invalide ou manquant | Détail par champ                |
| 401  | Mauvais mot de passe       | "Email ou mot de passe incorrect"|
| 409  | Email déjà utilisé         | "Email déjà utilisé"            |