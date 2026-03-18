# API Documentation - Ticket Place

## Authentication Endpoints

### POST /api/auth/register
Register a new user in the system.

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
  "message": "Utilisateur enregistré avec succès",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "enabled": true,
    "createdAt": "2026-03-18T10:17:00",
    "updatedAt": null
  },
  "timestamp": "2026-03-18T10:17:00"
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors
```json
{
  "success": false,
  "message": "Validation failed",
  "timestamp": "2026-03-18T10:17:00"
}
```

- **409 Conflict** - Email already exists
```json
{
  "success": false,
  "message": "Cet email est déjà utilisé",
  "timestamp": "2026-03-18T10:17:00"
}
```

## Validation Rules

- `firstName`: Required, not blank
- `lastName`: Required, not blank  
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

## Usage Example with curl

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com", 
    "password": "password123"
  }'
```
