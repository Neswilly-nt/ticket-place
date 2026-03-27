# Guide de Déploiement : Vercel + Railway + PlanetScale

## 🏗️ Architecture de production

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │ PlanetScale │
│  (Frontend) │◄──►│  (Backend)  │◄──►│ (Database)  │
│  Next.js    │    │ Spring Boot │    │    MySQL    │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 📋 Étape 1 : Base de données PlanetScale

### 1.1 Créer un compte PlanetScale
1. Allez sur [planetscale.com](https://planetscale.com)
2. Créez un compte (gratuit)
3. Vérifiez votre email

### 1.2 Créer la base de données
```bash
# Installer PlanetScale CLI
npm install -g @planetscale/cli

# Se connecter
pscale auth login

# Créer la base de données
pscale database create ticket-place --region us-east

# Créer une branche pour le développement
pscale branch create ticket-place main
```

### 1.3 Obtenir les informations de connexion
```bash
# Obtenir la chaîne de connexion
pscale connection-string ticket-place main
```

**Notez ces informations :**
- Database URL
- Username
- Password
- Database Name

---

## 📋 Étape 2 : Backend sur Railway

### 2.1 Préparer le backend pour Railway
Créer un fichier `railway.toml` :
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "app"
source = "."
[services.variables]
PORT = "8080"
```

### 2.2 Variables d'environnement Railway
```
DB_URL=votre_url_planetscale
DB_USERNAME=votre_username_planetscale
DB_PASSWORD=votre_password_planetscale
JWT_SECRET=votre_jwt_secret_32_caracteres
SPRING_PROFILES_ACTIVE=prod
```

### 2.3 Déployer sur Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Choisissez "Deploy from GitHub repo"
5. Sélectionnez votre repository `ticket-place`
6. Ajoutez les variables d'environnement
7. Cliquez sur "Deploy"

---

## 📋 Étape 3 : Frontend sur Vercel

### 3.1 Préparer le frontend pour Vercel
Créer `vercel.json` :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@backend_url"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "@backend_url/api/$1"
    }
  ]
}
```

### 3.2 Mettre à jour les variables d'environnement
Dans le frontend, assurez-vous que les appels API utilisent :
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

### 3.3 Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New..." → "Project"
4. Sélectionnez votre repository
5. Configurez les variables d'environnement :
   - `NEXT_PUBLIC_API_URL` = URL de votre backend Railway
6. Cliquez sur "Deploy"

---

## 🔧 Configuration CORS dans le backend

Ajoutez cette configuration dans votre `SecurityConfig.java` :

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 🌐 URLs finales après déploiement

- **Frontend (Vercel)** : `https://votre-app.vercel.app`
- **Backend (Railway)** : `https://votre-app.up.railway.app`
- **Database (PlanetScale)** : Connexion sécurisée

---

## 🧪 Tests après déploiement

1. Testez l'inscription/connexion
2. Vérifiez la création d'événements
3. Testez les réservations
4. Vérifiez les paiements

---

## 🔄 Déploiements automatiques

Les deux plateformes supportent les déploiements automatiques :
- **Push sur main** → Déploiement automatique
- **Pull Requests** → Déploiements de prévisualisation

---

## 📞 Support en cas de problèmes

- **Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Railway** : [docs.railway.app](https://docs.railway.app)
- **PlanetScale** : [planetscale.com/docs](https://planetscale.com/docs)
