# Configuration de la base de données

## Créer l'utilisateur MySQL
```sql
CREATE USER 'ticketUser'@'localhost' IDENTIFIED BY 'votrepassword';
GRANT ALL PRIVILEGES ON ticket_place_db.* TO 'ticketUser'@'localhost';
FLUSH PRIVILEGES;
```

## Variables d'environnement requises

Copier `.env.example` en `.env` et remplir les valeurs.