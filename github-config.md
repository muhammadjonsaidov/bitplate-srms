# GitHub & CI/CD Setup Guide — BitePlate SRMS

## 1. Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `bitplate-srms`
3. **Owner:** `muhammadjonsaidov`
4. Visibility: Public or Private (your choice)
5. ⚠️ Do NOT check "Add README" — we already have one
6. Click **Create repository**

---

## 2. Push Local Code to GitHub

Run these commands in the project root (`bitplate-srms/`):

```bash
git init
git add .
git commit -m "feat: initial BitePlate SRMS implementation"
git remote add origin https://github.com/muhammadjonsaidov/bitplate-srms.git
git branch -M main
git push -u origin main
```

---

## 3. Add GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Add each secret below:

| Secret Name      | Value                                              |
|------------------|----------------------------------------------------|
| `SERVER_HOST`    | `saidovmuhammadjon.me`                            |
| `SERVER_USER`    | Your SSH username on the VPS (e.g. `ubuntu`)      |
| `SERVER_SSH_KEY` | Contents of your private SSH key (see below)      |
| `DB_PASS`        | Strong PostgreSQL password for production         |
| `JWT_SECRET`     | 64+ character random string (see below)           |

### Generate JWT_SECRET:
```bash
openssl rand -hex 64
```

### Get SERVER_SSH_KEY:
```bash
cat ~/.ssh/id_rsa
# Copy the ENTIRE output including -----BEGIN/END----- lines
```

If you don't have an SSH key pair yet:
```bash
ssh-keygen -t ed25519 -C "github-actions-biteplate"
# Add public key to server: ssh-copy-id -i ~/.ssh/id_ed25519.pub user@saidovmuhammadjon.me
# Use private key content as SERVER_SSH_KEY secret
```

---

## 4. Enable GitHub Container Registry

The CI/CD pipeline pushes Docker images to `ghcr.io`. Enable it:

1. Go to **GitHub → Settings → Packages**
2. Ensure "Improved container support" is enabled
3. The `GITHUB_TOKEN` in Actions automatically has package write access

---

## 5. Set Up API Subdomain on Server

SSH into your server and set up the `api.saidovmuhammadjon.me` subdomain:

```bash
ssh ubuntu@saidovmuhammadjon.me
```

**Step 5a — Add DNS record:**
In your domain provider (where saidovmuhammadjon.me is registered), add:
- Type: `A`
- Name: `api`
- Value: your VPS IP address
- Wait 5–30 minutes for DNS propagation

**Step 5b — Install Nginx site config:**
```bash
sudo cp /opt/biteplate/nginx/biteplate.conf /etc/nginx/sites-available/biteplate
sudo ln -s /etc/nginx/sites-available/biteplate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 5c — Get SSL certificate for API subdomain:**
```bash
sudo certbot --nginx -d api.saidovmuhammadjon.me
```

---

## 6. Prepare Server Deployment Directory

SSH into server and set up:

```bash
ssh ubuntu@saidovmuhammadjon.me

# Create deployment directory
sudo mkdir -p /opt/biteplate
sudo chown $USER:$USER /opt/biteplate
cd /opt/biteplate

# Create production .env file
cat > .env << 'EOF'
DB_PASS=your_strong_postgres_password_here
JWT_SECRET=your_64_char_random_string_here
SPRING_PROFILES_ACTIVE=prod
EOF

chmod 600 .env
```

---

## 7. First Manual Deploy (Bootstrap)

Before CI/CD runs, do one manual deploy to pull images and start services:

```bash
cd /opt/biteplate

# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u muhammadjonsaidov --password-stdin

# Copy compose files (or create them manually)
# Then start services:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps
docker compose logs -f backend
```

---

## 8. Verify Deployment

```bash
# API health check
curl https://api.saidovmuhammadjon.me/actuator/health
# Expected: {"status":"UP"}

# Swagger UI
open https://api.saidovmuhammadjon.me/swagger-ui.html

# Frontend
open https://saidovmuhammadjon.me
# Expected: BitePlate login page
```

Default login credentials (from seed data):
- **Manager:** `manager` / `manager123`
- **Waiter:** `waiter1` / `waiter123`
- **Chef:** `chef1` / `chef123`
- **Cashier:** `cashier1` / `cashier123`

---

## 9. CI/CD Auto-Deploy (After Setup)

Every push to `main` branch automatically:
1. ✅ Builds backend JAR (Gradle)
2. ✅ Builds frontend (npm + Vite)
3. ✅ Pushes Docker images to `ghcr.io`
4. ✅ SSHes into server
5. ✅ Pulls new images + restarts containers
6. ✅ Health check confirms deployment

Monitor deployments: **GitHub repo → Actions**

---

## 10. Useful Server Commands

```bash
# View logs
docker compose -f /opt/biteplate/docker-compose.yml logs -f backend
docker compose -f /opt/biteplate/docker-compose.yml logs -f frontend

# Check running containers
docker compose -f /opt/biteplate/docker-compose.yml ps

# Restart single service
docker compose -f /opt/biteplate/docker-compose.yml restart backend

# Stop everything
docker compose -f /opt/biteplate/docker-compose.yml down

# View Redis kitchen queue
docker exec biteplate-redis redis-cli LRANGE kitchen:queue 0 -1

# Connect to PostgreSQL
docker exec -it biteplate-postgres psql -U biteplate -d biteplate
```
