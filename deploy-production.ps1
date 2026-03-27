# Script de déploiement production - Vercel + Railway + PlanetScale

Write-Host "=== DEPLOIEMENT PRODUCTION TICKET PLACE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script va vous guider pour deployer:" -ForegroundColor Yellow
Write-Host "1. Base de donnees sur PlanetScale" -ForegroundColor White
Write-Host "2. Backend sur Railway" -ForegroundColor White  
Write-Host "3. Frontend sur Vercel" -ForegroundColor White
Write-Host ""

# Etape 1: PlanetScale
Write-Host "=== ETAPE 1: PLANETSCALE ===" -ForegroundColor Green
Write-Host "1. Allez sur https://planetscale.com" -ForegroundColor Yellow
Write-Host "2. Creez un compte et connectez-vous" -ForegroundColor Yellow
Write-Host "3. Installez PlanetScale CLI:" -ForegroundColor Yellow
Write-Host "   npm install -g @planetscale/cli" -ForegroundColor Gray
Write-Host "4. Connectez-vous:" -ForegroundColor Yellow
Write-Host "   pscale auth login" -ForegroundColor Gray
Write-Host "5. Creez la base de donnees:" -ForegroundColor Yellow
Write-Host "   pscale database create ticket-place --region us-east" -ForegroundColor Gray
Write-Host "6. Creez une branche:" -ForegroundColor Yellow
Write-Host "   pscale branch create ticket-place main" -ForegroundColor Gray
Write-Host "7. Obtenez la chaîne de connexion:" -ForegroundColor Yellow
Write-Host "   pscale connection-string ticket-place main" -ForegroundColor Gray
Write-Host ""

# Etape 2: Railway
Write-Host "=== ETAPE 2: RAILWAY (BACKEND) ===" -ForegroundColor Green
Write-Host "1. Allez sur https://railway.app" -ForegroundColor Yellow
Write-Host "2. Connectez-vous avec GitHub" -ForegroundColor Yellow
Write-Host "3. Cliquez sur 'New Project' -> 'Deploy from GitHub repo'" -ForegroundColor Yellow
Write-Host "4. Selectionnez votre repository ticket-place" -ForegroundColor Yellow
Write-Host "5. Ajoutez ces variables d'environnement:" -ForegroundColor Yellow
Write-Host "   DB_URL=votre_url_planetscale" -ForegroundColor Gray
Write-Host "   DB_USERNAME=votre_username_planetscale" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=votre_password_planetscale" -ForegroundColor Gray
Write-Host "   JWT_SECRET=votre_jwt_secret_32_caracteres" -ForegroundColor Gray
Write-Host "   SPRING_PROFILES_ACTIVE=prod" -ForegroundColor Gray
Write-Host "6. Cliquez sur 'Deploy'" -ForegroundColor Yellow
Write-Host ""

# Etape 3: Vercel
Write-Host "=== ETAPE 3: VERCEL (FRONTEND) ===" -ForegroundColor Green
Write-Host "1. Allez sur https://vercel.com" -ForegroundColor Yellow
Write-Host "2. Connectez-vous avec GitHub" -ForegroundColor Yellow
Write-Host "3. Cliquez sur 'Add New...' -> 'Project'" -ForegroundColor Yellow
Write-Host "4. Selectionnez votre repository ticket-place" -ForegroundColor Yellow
Write-Host "5. Configurez le repertoire racine: frontend" -ForegroundColor Yellow
Write-Host "6. Ajoutez cette variable d'environnement:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_API_URL=https://votre-backend-url.up.railway.app" -ForegroundColor Gray
Write-Host "7. Cliquez sur 'Deploy'" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== APRES DEPLOIEMENT ===" -ForegroundColor Cyan
Write-Host "Testez votre application:" -ForegroundColor Yellow
Write-Host "- Incription/connexion" -ForegroundColor White
Write-Host "- Creation d'evenements" -ForegroundColor White
Write-Host "- Reservations" -ForegroundColor White
Write-Host "- Paiements" -ForegroundColor White
Write-Host ""

Write-Host "URLs finales:" -ForegroundColor Yellow
Write-Host "- Frontend: https://votre-app.vercel.app" -ForegroundColor White
Write-Host "- Backend: https://votre-app.up.railway.app" -ForegroundColor White
Write-Host "- Database: PlanetScale (secure)" -ForegroundColor White
Write-Host ""

Write-Host "Documentation complete disponible dans DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
