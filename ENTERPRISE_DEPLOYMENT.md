# Enterprise-Grade Deployment Guide
## The Open Draft - Production Infrastructure

> **Note**: This is an enterprise-grade deployment architecture designed for learning purposes. It covers VPC setup, dedicated servers, high availability, disaster recovery, and security best practices.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Network Architecture (VPC)](#network-architecture-vpc)
4. [Server Infrastructure](#server-infrastructure)
5. [Database Architecture](#database-architecture)
6. [Security Configuration](#security-configuration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Deployment Steps](#deployment-steps)
11. [Scaling Strategy](#scaling-strategy)
12. [Cost Optimization](#cost-optimization)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   CDN   │  (CloudFlare/CloudFront)
                    │ + WAF   │
                    └────┬────┘
                         │
                    ┌────▼────────────────────────────────────┐
                    │  Load Balancer (ALB/NLB)                │
                    │  - SSL Termination                       │
                    │  - Health Checks                         │
                    └────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │  App    │     │  App    │     │  App    │
   │ Server  │     │ Server  │     │ Server  │
   │   #1    │     │   #2    │     │   #3    │
   └────┬────┘     └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       ┌────▼────┐              ┌────▼────────┐
       │ Primary │◄─────────────┤  Standby    │
       │   DB    │  Replication │     DB      │
       │ (Write) │              │   (Read)    │
       └────┬────┘              └─────────────┘
            │
       ┌────▼────┐
       │ Backup  │
       │ Storage │
       └─────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **App Runtime** | Node.js 20 LTS | Application server |
| **Framework** | Next.js 15 | React framework |
| **Database** | PostgreSQL 16 | Primary data store |
| **Cache** | Redis 7.x | Session & data caching |
| **File Storage** | Appwrite Storage | User uploads |
| **CDN** | CloudFlare | Static assets & DDoS protection |
| **Load Balancer** | AWS ALB / Nginx | Traffic distribution |
| **Monitoring** | Grafana + Prometheus | Metrics & alerting |
| **Logging** | ELK Stack | Centralized logging |
| **CI/CD** | GitHub Actions | Automated deployments |

---

## Infrastructure Requirements

### Minimum Production Specs

#### Application Servers (3x for HA)
```yaml
CPU: 4 vCPUs
RAM: 8 GB
Storage: 50 GB SSD
OS: Ubuntu 22.04 LTS
Network: 1 Gbps
```

#### Database Server (Primary)
```yaml
CPU: 8 vCPUs
RAM: 32 GB
Storage: 500 GB NVMe SSD (expandable)
OS: Ubuntu 22.04 LTS
Network: 10 Gbps (dedicated)
IOPS: 10,000+ provisioned
```

#### Database Server (Standby/Read Replica)
```yaml
CPU: 8 vCPUs
RAM: 32 GB
Storage: 500 GB NVMe SSD
OS: Ubuntu 22.04 LTS
Network: 10 Gbps
```

#### Redis Cache Server
```yaml
CPU: 2 vCPUs
RAM: 16 GB
Storage: 50 GB SSD
OS: Ubuntu 22.04 LTS
```

#### Bastion/Jump Server
```yaml
CPU: 2 vCPUs
RAM: 4 GB
Storage: 20 GB SSD
OS: Ubuntu 22.04 LTS
Purpose: Secure SSH gateway
```

---

## Network Architecture (VPC)

### VPC Design (AWS Example - adaptable to GCP/Azure)

```
VPC CIDR: 10.0.0.0/16

┌─────────────────────────────────────────────────────────────┐
│                    VPC: open-draft-prod                      │
│                     CIDR: 10.0.0.0/16                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Public Subnet 1 (us-east-1a)                      │     │
│  │  CIDR: 10.0.1.0/24                                 │     │
│  │  - NAT Gateway                                     │     │
│  │  - Bastion Host                                    │     │
│  │  - Load Balancer (internet-facing)                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Public Subnet 2 (us-east-1b)                      │     │
│  │  CIDR: 10.0.2.0/24                                 │     │
│  │  - NAT Gateway (HA)                                │     │
│  │  - Load Balancer (internet-facing)                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Private Subnet 1 (App Tier - us-east-1a)          │     │
│  │  CIDR: 10.0.10.0/24                                │     │
│  │  - App Server 1                                    │     │
│  │  - App Server 2                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Private Subnet 2 (App Tier - us-east-1b)          │     │
│  │  CIDR: 10.0.11.0/24                                │     │
│  │  - App Server 3                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Private Subnet 3 (Data Tier - us-east-1a)         │     │
│  │  CIDR: 10.0.20.0/24                                │     │
│  │  - PostgreSQL Primary                              │     │
│  │  - Redis Cache                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Private Subnet 4 (Data Tier - us-east-1b)         │     │
│  │  CIDR: 10.0.21.0/24                                │     │
│  │  - PostgreSQL Standby                              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Security Groups

#### 1. Load Balancer Security Group
```yaml
Name: sg-lb-public
Inbound:
  - Port 443 (HTTPS) from 0.0.0.0/0
  - Port 80 (HTTP) from 0.0.0.0/0 (redirect to 443)
Outbound:
  - All traffic to App Security Group
```

#### 2. Application Server Security Group
```yaml
Name: sg-app-private
Inbound:
  - Port 3000 from Load Balancer SG
  - Port 22 (SSH) from Bastion SG
Outbound:
  - Port 5432 (PostgreSQL) to Database SG
  - Port 6379 (Redis) to Cache SG
  - Port 443 (HTTPS) to 0.0.0.0/0 (for external APIs)
```

#### 3. Database Security Group
```yaml
Name: sg-db-private
Inbound:
  - Port 5432 from Application SG
  - Port 5432 from Bastion SG (maintenance)
Outbound:
  - Port 5432 to Database SG (replication)
```

#### 4. Redis Security Group
```yaml
Name: sg-redis-private
Inbound:
  - Port 6379 from Application SG
Outbound:
  - None
```

#### 5. Bastion Security Group
```yaml
Name: sg-bastion-public
Inbound:
  - Port 22 from YOUR_OFFICE_IP/32
  - Port 22 from VPN_IP_RANGE
Outbound:
  - Port 22 to all private subnets
```

### Network ACLs (Optional Additional Layer)

```yaml
Public Subnet NACL:
  Inbound:
    100: Allow HTTP/HTTPS from 0.0.0.0/0
    200: Allow SSH from corporate IPs
    *: Deny all
  Outbound:
    100: Allow all
    *: Deny all

Private App Subnet NACL:
  Inbound:
    100: Allow traffic from Load Balancer subnets
    200: Allow SSH from Bastion subnet
    *: Deny all
  Outbound:
    100: Allow all to VPC CIDR
    *: Deny all

Private DB Subnet NACL:
  Inbound:
    100: Allow PostgreSQL from App subnets
    200: Allow PostgreSQL between DB subnets (replication)
    *: Deny all
  Outbound:
    100: Allow all to VPC CIDR
    *: Deny all
```

---

## Server Infrastructure

### 1. Load Balancer Configuration

#### AWS Application Load Balancer (ALB)

```hcl
# Terraform example
resource "aws_lb" "main" {
  name               = "open-draft-alb-prod"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id
  ]

  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = aws_s3_bucket.lb_logs.bucket
    enabled = true
  }

  tags = {
    Environment = "production"
    Application = "open-draft"
  }
}

resource "aws_lb_target_group" "app" {
  name     = "open-draft-app-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

#### Nginx Load Balancer (Alternative - Self-Hosted)

```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;

    # Upstream app servers
    upstream app_backend {
        least_conn;
        server 10.0.10.10:3000 max_fails=3 fail_timeout=30s;
        server 10.0.10.11:3000 max_fails=3 fail_timeout=30s;
        server 10.0.11.10:3000 max_fails=3 fail_timeout=30s;
        keepalive 64;
    }

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # HTTP to HTTPS redirect
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name theopendraft.com www.theopendraft.com;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name theopendraft.com www.theopendraft.com;

        ssl_certificate /etc/ssl/certs/theopendraft.com.crt;
        ssl_certificate_key /etc/ssl/private/theopendraft.com.key;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # General pages
        location / {
            limit_req zone=general burst=100 nodelay;
            proxy_pass http://app_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app_backend;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }

        # Image optimization
        location ~ \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
            proxy_pass http://app_backend;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. Application Server Setup

#### System Preparation Script

```bash
#!/bin/bash
# app-server-setup.sh
# Run on each application server

set -e

echo "=== Open Draft Application Server Setup ==="

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install other dependencies
apt-get install -y \
    git \
    build-essential \
    python3 \
    curl \
    wget \
    vim \
    htop \
    net-tools \
    ufw \
    fail2ban \
    unattended-upgrades

# Create application user
useradd -m -s /bin/bash -U app
usermod -aG sudo app

# Create application directory
mkdir -p /var/www/open-draft
chown -R app:app /var/www/open-draft

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow from 10.0.0.0/16 to any port 3000  # Allow from VPC
ufw allow from 10.0.1.0/24 to any port 22    # SSH from bastion subnet only
ufw --force enable

# Configure fail2ban
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Enable automatic security updates
dpkg-reconfigure -plow unattended-upgrades

# Configure system limits
cat >> /etc/security/limits.conf <<EOF
app soft nofile 65535
app hard nofile 65535
app soft nproc 65535
app hard nproc 65535
EOF

# Configure sysctl for performance
cat >> /etc/sysctl.conf <<EOF
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
vm.swappiness = 10
EOF

sysctl -p

echo "=== Setup Complete ==="
```

#### PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'open-draft',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/open-draft-error.log',
    out_file: '/var/log/pm2/open-draft-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

#### Deployment Script

```bash
#!/bin/bash
# deploy.sh
# Run as 'app' user

set -e

APP_DIR="/var/www/open-draft"
REPO_URL="git@github.com:yourusername/open-draft.git"
BRANCH="main"

echo "=== Starting deployment ==="

cd $APP_DIR

# Pull latest code
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build application
echo "Building Next.js application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Reload PM2
echo "Reloading PM2..."
pm2 reload ecosystem.config.js --update-env

# Save PM2 configuration
pm2 save

echo "=== Deployment complete ==="
```

---

## Database Architecture

### PostgreSQL Primary-Standby Setup

#### 1. Primary Database Server Setup

```bash
#!/bin/bash
# postgres-primary-setup.sh

set -e

echo "=== PostgreSQL Primary Server Setup ==="

# Install PostgreSQL 16
apt-get update
apt-get install -y wget gnupg2
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-16 postgresql-contrib-16

# Configure PostgreSQL
cat > /etc/postgresql/16/main/postgresql.conf <<EOF
# Connection settings
listen_addresses = '10.0.20.10'  # Primary IP
port = 5432
max_connections = 200

# Memory settings
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
work_mem = 41MB

# WAL settings for replication
wal_level = replica
max_wal_senders = 5
max_replication_slots = 5
wal_keep_size = 1GB
hot_standby = on

# Performance tuning
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_min_duration_statement = 1000  # Log slow queries > 1s
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 30s
EOF

# Configure pg_hba.conf
cat > /etc/postgresql/16/main/pg_hba.conf <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             10.0.0.0/16             scram-sha-256
host    replication     replicator      10.0.21.10/32           scram-sha-256
EOF

# Create replication user
sudo -u postgres psql <<EOF
CREATE ROLE replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD 'SECURE_PASSWORD_HERE';
EOF

# Restart PostgreSQL
systemctl restart postgresql@16-main
systemctl enable postgresql@16-main

echo "=== Primary setup complete ==="
```

#### 2. Standby Database Server Setup

```bash
#!/bin/bash
# postgres-standby-setup.sh

set -e

PRIMARY_IP="10.0.20.10"
STANDBY_IP="10.0.21.10"

echo "=== PostgreSQL Standby Server Setup ==="

# Install PostgreSQL 16
apt-get update
apt-get install -y postgresql-16 postgresql-contrib-16

# Stop PostgreSQL
systemctl stop postgresql@16-main

# Remove default data directory
rm -rf /var/lib/postgresql/16/main

# Create base backup from primary
sudo -u postgres pg_basebackup \
    -h $PRIMARY_IP \
    -D /var/lib/postgresql/16/main \
    -U replicator \
    -v \
    -P \
    -W \
    -R

# Create standby.signal
sudo -u postgres touch /var/lib/postgresql/16/main/standby.signal

# Configure standby
cat >> /var/lib/postgresql/16/main/postgresql.auto.conf <<EOF
primary_conninfo = 'host=$PRIMARY_IP port=5432 user=replicator password=SECURE_PASSWORD_HERE'
hot_standby = on
EOF

# Start PostgreSQL
systemctl start postgresql@16-main
systemctl enable postgresql@16-main

echo "=== Standby setup complete ==="
echo "Check replication status with: sudo -u postgres psql -c 'SELECT * FROM pg_stat_replication;'"
```

#### 3. Database Monitoring Script

```bash
#!/bin/bash
# check-replication.sh

echo "=== PostgreSQL Replication Status ==="

# On Primary
echo -e "\n--- Primary Server Status ---"
sudo -u postgres psql -c "SELECT * FROM pg_stat_replication;"

# On Standby
echo -e "\n--- Standby Server Status ---"
sudo -u postgres psql -c "SELECT * FROM pg_stat_wal_receiver;"

echo -e "\n--- Replication Lag ---"
sudo -u postgres psql -c "SELECT
    CASE WHEN pg_last_wal_receive_lsn() = pg_last_wal_replay_lsn()
        THEN 0
        ELSE EXTRACT (EPOCH FROM now() - pg_last_xact_replay_timestamp())
    END AS lag_seconds;"
```

### Redis Setup

```bash
#!/bin/bash
# redis-setup.sh

set -e

echo "=== Redis Setup ==="

# Install Redis
apt-get update
apt-get install -y redis-server

# Configure Redis
cat > /etc/redis/redis.conf <<EOF
# Network
bind 10.0.20.11  # Redis server IP
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

# General
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Replication
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no

# Security
requirepass SECURE_REDIS_PASSWORD_HERE

# Memory Management
maxmemory 12gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Slow Log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency Monitor
latency-monitor-threshold 100
EOF

# Configure systemd
systemctl restart redis-server
systemctl enable redis-server

echo "=== Redis setup complete ==="
```

---

## Security Configuration

### 1. SSL/TLS Certificate Management

#### Using Let's Encrypt with Certbot

```bash
#!/bin/bash
# setup-ssl.sh

set -e

DOMAIN="theopendraft.com"
EMAIL="admin@theopendraft.com"

echo "=== Setting up SSL certificates ==="

# Install Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

# Set up auto-renewal
cat > /etc/cron.d/certbot-renewal <<EOF
0 3 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

echo "=== SSL setup complete ==="
```

### 2. Secrets Management

#### Using AWS Secrets Manager (Example)

```bash
#!/bin/bash
# fetch-secrets.sh

set -e

SECRET_NAME="open-draft-prod-secrets"
REGION="us-east-1"

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Fetch secrets
aws secretsmanager get-secret-value \
    --secret-id $SECRET_NAME \
    --region $REGION \
    --query SecretString \
    --output text > /tmp/secrets.json

# Parse and export environment variables
export DATABASE_URL=$(jq -r '.DATABASE_URL' /tmp/secrets.json)
export NEXTAUTH_SECRET=$(jq -r '.NEXTAUTH_SECRET' /tmp/secrets.json)
export RAZORPAY_KEY_ID=$(jq -r '.RAZORPAY_KEY_ID' /tmp/secrets.json)
export RAZORPAY_KEY_SECRET=$(jq -r '.RAZORPAY_KEY_SECRET' /tmp/secrets.json)
# ... etc

# Secure delete
shred -u /tmp/secrets.json
```

#### Environment Variables Template

```bash
# .env.production (stored in secrets manager)
# Never commit this file to git

# Database
DATABASE_URL="postgresql://opendraft:SECURE_PASSWORD@10.0.20.10:5432/opendraft_prod?schema=public&connection_limit=20&pool_timeout=20"
DATABASE_URL_READ_REPLICA="postgresql://opendraft:SECURE_PASSWORD@10.0.21.10:5432/opendraft_prod?schema=public&connection_limit=40&pool_timeout=20"

# Redis
REDIS_URL="redis://:SECURE_PASSWORD@10.0.20.11:6379/0"

# NextAuth
NEXTAUTH_URL="https://theopendraft.com"
NEXTAUTH_SECRET="GENERATED_WITH_openssl_rand_base64_32"

# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your-project-id"
APPWRITE_API_KEY="your-api-key"
APPWRITE_DATABASE_ID="main"
APPWRITE_BUCKET_ID="animal-photos"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="xxxxxxxxxxxx"

# Email (SendGrid/SES)
EMAIL_FROM="noreply@theopendraft.com"
SENDGRID_API_KEY="SG.xxxxxxxxxxxx"

# Monitoring
SENTRY_DSN="https://xxxx@sentry.io/xxxx"
NEW_RELIC_LICENSE_KEY="xxxxxxxxxxxx"

# Feature Flags
ENABLE_AI_MODERATION=true
ENABLE_SUBSCRIPTIONS=true

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. Firewall & DDoS Protection

#### CloudFlare Configuration

```yaml
# cloudflare-config.yml
# Apply via Terraform or CloudFlare API

zone: theopendraft.com

settings:
  # SSL/TLS
  ssl: full_strict
  always_use_https: true
  automatic_https_rewrites: true
  min_tls_version: "1.2"
  tls_1_3: "on"

  # Security
  security_level: medium
  challenge_passage: 30
  browser_check: true

  # DDoS Protection
  ddos_protection: true
  rate_limiting:
    - name: api-protection
      threshold: 100
      period: 60
      action: challenge
      match:
        url: "*.theopendraft.com/api/*"

    - name: login-protection
      threshold: 5
      period: 300
      action: block
      match:
        url: "*.theopendraft.com/api/auth/*"

  # WAF Rules
  waf_managed_rules: true
  waf_custom_rules:
    - description: "Block SQL Injection"
      expression: '(http.request.uri.query contains "union select")'
      action: block

    - description: "Block XSS Attempts"
      expression: '(http.request.uri.query contains "<script")'
      action: block

  # Caching
  browser_cache_ttl: 14400
  cache_level: aggressive

  # Performance
  minify:
    css: true
    js: true
    html: true

  brotli: true
  http2: true
  http3: true
  early_hints: true
  rocket_loader: false  # Can break Next.js

  # Bot Management
  bot_management:
    enable: true
    verified_bots: allow
    corporate_proxy: off
    super_bot_fight_mode: true
```

### 4. Intrusion Detection

#### OSSEC Configuration

```bash
#!/bin/bash
# setup-ossec.sh

set -e

echo "=== Installing OSSEC HIDS ==="

# Download and install OSSEC
cd /tmp
wget https://github.com/ossec/ossec-hids/archive/3.7.0.tar.gz
tar -xzf 3.7.0.tar.gz
cd ossec-hids-3.7.0
./install.sh

# Configure OSSEC
cat > /var/ossec/etc/ossec.conf <<EOF
<ossec_config>
  <global>
    <email_notification>yes</email_notification>
    <email_to>security@theopendraft.com</email_to>
    <smtp_server>localhost</smtp_server>
    <email_from>ossec@theopendraft.com</email_from>
  </global>

  <syscheck>
    <frequency>7200</frequency>
    <directories check_all="yes">/var/www/open-draft</directories>
    <directories check_all="yes">/etc,/usr/bin,/usr/sbin</directories>
    <directories check_all="yes">/bin,/sbin</directories>
  </syscheck>

  <rootcheck>
    <rootkit_files>/var/ossec/etc/shared/rootkit_files.txt</rootkit_files>
    <rootkit_trojans>/var/ossec/etc/shared/rootkit_trojans.txt</rootkit_trojans>
  </rootcheck>

  <alerts>
    <log_alert_level>3</log_alert_level>
    <email_alert_level>7</email_alert_level>
  </alerts>
</ossec_config>
EOF

# Start OSSEC
/var/ossec/bin/ossec-control start

echo "=== OSSEC setup complete ==="
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20.x'

jobs:
  # Step 1: Run tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: opendraft_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/opendraft_test

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/opendraft_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/opendraft_test

  # Step 2: Build application
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js app
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            .next
            public
            node_modules
          retention-days: 1

  # Step 3: Security scanning
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
          args: --severity-threshold=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Step 4: Database migration (dry run)
  migration-check:
    name: Database Migration Check
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      - name: Check for pending migrations
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}

  # Step 5: Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, security-scan, migration-check]
    environment:
      name: staging
      url: https://staging.theopendraft.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Deploy to staging servers
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: app
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/open-draft
            git pull origin main
            npm ci
            npm run build
            npx prisma migrate deploy
            pm2 reload ecosystem.config.js --update-env

      - name: Run smoke tests
        run: |
          npm run test:smoke
        env:
          BASE_URL: https://staging.theopendraft.com

  # Step 6: Deploy to production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production
      url: https://theopendraft.com

    strategy:
      matrix:
        server: [
          { host: 'app-server-1', ip: '10.0.10.10' },
          { host: 'app-server-2', ip: '10.0.10.11' },
          { host: 'app-server-3', ip: '10.0.11.10' }
        ]
      max-parallel: 1  # Rolling deployment

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Deploy to ${{ matrix.server.host }}
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ matrix.server.ip }}
          username: app
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          proxy_host: ${{ secrets.BASTION_HOST }}
          proxy_username: bastion
          proxy_key: ${{ secrets.BASTION_SSH_KEY }}
          script: |
            cd /var/www/open-draft
            git pull origin main
            npm ci
            npm run build
            pm2 reload ecosystem.config.js --update-env
            pm2 save

      - name: Health check ${{ matrix.server.host }}
        run: |
          sleep 30
          curl -f https://theopendraft.com/api/health || exit 1

      - name: Wait between servers
        if: matrix.server.host != 'app-server-3'
        run: sleep 60

  # Step 7: Run database migrations on production
  migrate-production:
    name: Migrate Production Database
    runs-on: ubuntu-latest
    needs: deploy-production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      - name: Run migrations via bastion
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.BASTION_HOST }}
          username: bastion
          key: ${{ secrets.BASTION_SSH_KEY }}
          script: |
            ssh app@10.0.10.10 "cd /var/www/open-draft && npx prisma migrate deploy"

  # Step 8: Post-deployment tests
  post-deployment-tests:
    name: Post-Deployment Tests
    runs-on: ubuntu-latest
    needs: migrate-production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run E2E tests against production
        run: npm run test:e2e
        env:
          BASE_URL: https://theopendraft.com
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Performance tests
        run: |
          npm install -g lighthouse
          lighthouse https://theopendraft.com \
            --output=json \
            --output-path=./lighthouse-report.json \
            --chrome-flags="--headless"

      - name: Upload lighthouse report
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: lighthouse-report.json

  # Step 9: Notify on completion
  notify:
    name: Send Notifications
    runs-on: ubuntu-latest
    needs: post-deployment-tests
    if: always()

    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Production deployment ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

      - name: Email notification
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: Production Deployment ${{ job.status }}
          to: team@theopendraft.com
          from: ci@theopendraft.com
          body: |
            Production deployment ${{ job.status }}

            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            Time: ${{ github.event.head_commit.timestamp }}
        if: always()
```

---

## Monitoring & Logging

### 1. Prometheus Configuration

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'open-draft-prod'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# Load rules
rule_files:
  - "alerts/*.yml"

# Scrape configurations
scrape_configs:
  # Node Exporter (system metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets:
          - '10.0.10.10:9100'  # App server 1
          - '10.0.10.11:9100'  # App server 2
          - '10.0.11.10:9100'  # App server 3
          - '10.0.20.10:9100'  # DB primary
          - '10.0.21.10:9100'  # DB standby
          - '10.0.20.11:9100'  # Redis

  # PostgreSQL Exporter
  - job_name: 'postgres-exporter'
    static_configs:
      - targets:
          - '10.0.20.10:9187'  # Primary
          - '10.0.21.10:9187'  # Standby

  # Redis Exporter
  - job_name: 'redis-exporter'
    static_configs:
      - targets:
          - '10.0.20.11:9121'

  # Nginx Exporter
  - job_name: 'nginx-exporter'
    static_configs:
      - targets:
          - '10.0.1.10:9113'  # Load balancer

  # Node.js application metrics
  - job_name: 'app-metrics'
    static_configs:
      - targets:
          - '10.0.10.10:3001'
          - '10.0.10.11:3001'
          - '10.0.11.10:3001'
```

### 2. Alert Rules

```yaml
# /etc/prometheus/alerts/app-alerts.yml
groups:
  - name: application
    interval: 30s
    rules:
      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.instance }}"
          description: "95th percentile response time is {{ $value }}s"

      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value }} errors/sec"

      # Application down
      - alert: ApplicationDown
        expr: up{job="app-metrics"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Application is down on {{ $labels.instance }}"
          description: "Application has been down for more than 2 minutes"

  - name: database
    interval: 30s
    rules:
      # Database down
      - alert: DatabaseDown
        expr: up{job="postgres-exporter"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down on {{ $labels.instance }}"

      # High replication lag
      - alert: HighReplicationLag
        expr: pg_replication_lag_seconds > 60
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High replication lag on standby"
          description: "Replication lag is {{ $value }}s"

      # Database connections high
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection usage is high"
          description: "Using {{ $value }}% of max connections"

      # Slow queries
      - alert: SlowQueries
        expr: rate(pg_slow_queries_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of slow queries"
          description: "{{ $value }} slow queries per second"

  - name: infrastructure
    interval: 30s
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      # Disk space low
      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
          description: "Disk usage is {{ $value }}%"

      # High disk I/O
      - alert: HighDiskIO
        expr: rate(node_disk_io_time_seconds_total[5m]) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High disk I/O on {{ $labels.instance }}"
```

### 3. Grafana Dashboards

```bash
#!/bin/bash
# setup-grafana.sh

set -e

echo "=== Installing Grafana ==="

# Add Grafana repository
apt-get install -y software-properties-common
add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -

# Install Grafana
apt-get update
apt-get install -y grafana

# Configure Grafana
cat > /etc/grafana/grafana.ini <<EOF
[server]
protocol = http
http_port = 3000
domain = monitoring.theopendraft.com
root_url = https://monitoring.theopendraft.com

[security]
admin_user = admin
admin_password = SECURE_PASSWORD_HERE
secret_key = SECURE_SECRET_KEY_HERE

[auth]
disable_login_form = false

[auth.anonymous]
enabled = false

[smtp]
enabled = true
host = smtp.gmail.com:587
user = alerts@theopendraft.com
password = SMTP_PASSWORD_HERE
from_address = alerts@theopendraft.com
from_name = Grafana Alerts

[alerting]
enabled = true
execute_alerts = true
EOF

# Start Grafana
systemctl daemon-reload
systemctl start grafana-server
systemctl enable grafana-server

echo "=== Grafana setup complete ==="
echo "Access at: http://monitoring.theopendraft.com:3000"
```

### 4. ELK Stack for Centralized Logging

```bash
#!/bin/bash
# setup-elk.sh

set -e

echo "=== Installing ELK Stack ==="

# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list
apt-get update
apt-get install -y elasticsearch

# Configure Elasticsearch
cat > /etc/elasticsearch/elasticsearch.yml <<EOF
cluster.name: open-draft-logs
node.name: elk-server
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 10.0.20.20
http.port: 9200
discovery.type: single-node
xpack.security.enabled: true
EOF

systemctl start elasticsearch
systemctl enable elasticsearch

# Install Logstash
apt-get install -y logstash

# Configure Logstash
cat > /etc/logstash/conf.d/app-logs.conf <<EOF
input {
  beats {
    port => 5044
  }
}

filter {
  if [type] == "nginx-access" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }

  if [type] == "app-logs" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "logs-%{type}-%{+YYYY.MM.dd}"
  }
}
EOF

systemctl start logstash
systemctl enable logstash

# Install Kibana
apt-get install -y kibana

# Configure Kibana
cat > /etc/kibana/kibana.yml <<EOF
server.port: 5601
server.host: "10.0.20.20"
elasticsearch.hosts: ["http://localhost:9200"]
kibana.index: ".kibana"
EOF

systemctl start kibana
systemctl enable kibana

echo "=== ELK Stack setup complete ==="
echo "Kibana: http://10.0.20.20:5601"
```

### 5. Application Logging Configuration

```typescript
// lib/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://10.0.20.20:9200',
  },
  index: 'app-logs',
};

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'open-draft',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // File output
    new winston.transports.File({
      filename: '/var/log/app/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: '/var/log/app/combined.log',
      maxsize: 10485760,
      maxFiles: 10,
    }),

    // Elasticsearch
    new ElasticsearchTransport(esTransportOpts),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: '/var/log/app/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: '/var/log/app/rejections.log' }),
  ],
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: () => void) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
  });

  next();
};
```

---

## Backup & Disaster Recovery

### 1. Database Backup Strategy

```bash
#!/bin/bash
# backup-database.sh

set -e

BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=30
S3_BUCKET="s3://open-draft-backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="opendraft_prod"
DB_HOST="10.0.20.10"

echo "=== Starting database backup at $DATE ==="

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database dump
pg_dump -h $DB_HOST -U opendraft -F c -b -v -f "$BACKUP_DIR/db_full_$DATE.dump" $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/db_full_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_full_$DATE.dump.gz" "$S3_BUCKET/full/db_full_$DATE.dump.gz" \
    --storage-class STANDARD_IA

# WAL archiving (continuous backup)
# Already configured in postgresql.conf:
# archive_mode = on
# archive_command = 'aws s3 cp %p s3://open-draft-backups/wal/%f'

# Remove old local backups
find $BACKUP_DIR -name "db_full_*.dump.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup
echo "=== Verifying backup ==="
gunzip -t "$BACKUP_DIR/db_full_$DATE.dump.gz"

# Send notification
echo "Backup completed: db_full_$DATE.dump.gz" | \
    mail -s "Database Backup Success" ops@theopendraft.com

echo "=== Backup complete ==="
```

### 2. Application Files Backup

```bash
#!/bin/bash
# backup-app-files.sh

set -e

BACKUP_DIR="/var/backups/app"
S3_BUCKET="s3://open-draft-backups/app-files"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/open-draft"

echo "=== Backing up application files ==="

# Create backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    $APP_DIR

# Upload to S3
aws s3 cp "$BACKUP_DIR/app_$DATE.tar.gz" "$S3_BUCKET/app_$DATE.tar.gz" \
    --storage-class STANDARD_IA

# Remove old backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "=== Application backup complete ==="
```

### 3. Automated Backup Schedule

```bash
# /etc/cron.d/open-draft-backups

# Full database backup - Daily at 2 AM
0 2 * * * postgres /opt/scripts/backup-database.sh >> /var/log/backups/db-backup.log 2>&1

# Application files backup - Daily at 3 AM
0 3 * * * root /opt/scripts/backup-app-files.sh >> /var/log/backups/app-backup.log 2>&1

# Redis snapshot backup - Every 6 hours
0 */6 * * * root cp /var/lib/redis/dump.rdb /var/backups/redis/dump_$(date +\%Y\%m\%d_\%H\%M).rdb

# Upload Redis backups to S3 - Daily at 4 AM
0 4 * * * root find /var/backups/redis -name "dump_*.rdb" -mtime -1 -exec aws s3 cp {} s3://open-draft-backups/redis/ \;

# Clean old Redis backups - Weekly
0 5 * * 0 root find /var/backups/redis -name "dump_*.rdb" -mtime +14 -delete

# Backup rotation check - Weekly
0 6 * * 1 root /opt/scripts/verify-backups.sh >> /var/log/backups/verification.log 2>&1
```

### 4. Disaster Recovery Procedure

```bash
#!/bin/bash
# disaster-recovery.sh
# Use this script to restore the entire system from backups

set -e

BACKUP_DATE=$1  # Format: YYYYMMDD_HHMMSS
S3_BUCKET="s3://open-draft-backups"
RESTORE_DIR="/var/restore"

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 <BACKUP_DATE>"
    echo "Example: $0 20260121_020000"
    exit 1
fi

echo "=== DISASTER RECOVERY PROCEDURE ==="
echo "=== Restoring from backup: $BACKUP_DATE ==="
read -p "Are you sure? This will OVERWRITE existing data. (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Recovery cancelled"
    exit 0
fi

mkdir -p $RESTORE_DIR

# Step 1: Restore database
echo "=== Step 1: Restoring database ==="
aws s3 cp "$S3_BUCKET/database/full/db_full_$BACKUP_DATE.dump.gz" "$RESTORE_DIR/"
gunzip "$RESTORE_DIR/db_full_$BACKUP_DATE.dump.gz"

# Stop application
pm2 stop all

# Drop and recreate database
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS opendraft_prod;
CREATE DATABASE opendraft_prod;
GRANT ALL PRIVILEGES ON DATABASE opendraft_prod TO opendraft;
EOF

# Restore database
pg_restore -h 10.0.20.10 -U opendraft -d opendraft_prod "$RESTORE_DIR/db_full_$BACKUP_DATE.dump"

# Step 2: Restore application files
echo "=== Step 2: Restoring application files ==="
aws s3 cp "$S3_BUCKET/app-files/app_$BACKUP_DATE.tar.gz" "$RESTORE_DIR/"
tar -xzf "$RESTORE_DIR/app_$BACKUP_DATE.tar.gz" -C /var/www/

# Rebuild application
cd /var/www/open-draft
npm ci
npm run build

# Step 3: Restore Redis data
echo "=== Step 3: Restoring Redis ==="
systemctl stop redis-server
aws s3 cp "$S3_BUCKET/redis/dump_$BACKUP_DATE.rdb" /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb
systemctl start redis-server

# Step 4: Restart services
echo "=== Step 4: Restarting services ==="
pm2 restart all
pm2 save

# Step 5: Verify
echo "=== Step 5: Running health checks ==="
sleep 10
curl -f http://localhost:3000/api/health || echo "WARNING: Health check failed"

echo "=== RECOVERY COMPLETE ==="
echo "Please verify the application manually"
```

### 5. Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr-recovery.sh
# Restore database to a specific point in time using WAL archives

set -e

TARGET_TIME=$1  # Format: "YYYY-MM-DD HH:MM:SS"
BASE_BACKUP=$2  # Base backup date
S3_BUCKET="s3://open-draft-backups"
RESTORE_DIR="/var/restore/pitr"

if [ -z "$TARGET_TIME" ] || [ -z "$BASE_BACKUP" ]; then
    echo "Usage: $0 <TARGET_TIME> <BASE_BACKUP>"
    echo "Example: $0 '2026-01-21 10:30:00' 20260121_020000"
    exit 1
fi

echo "=== Point-in-Time Recovery ==="
echo "Target time: $TARGET_TIME"
echo "Base backup: $BASE_BACKUP"

mkdir -p $RESTORE_DIR

# Download base backup
echo "Downloading base backup..."
aws s3 cp "$S3_BUCKET/database/full/db_full_$BASE_BACKUP.dump.gz" "$RESTORE_DIR/"
gunzip "$RESTORE_DIR/db_full_$BASE_BACKUP.dump.gz"

# Download WAL archives
echo "Downloading WAL archives..."
aws s3 sync "$S3_BUCKET/wal/" "$RESTORE_DIR/wal/"

# Stop PostgreSQL
systemctl stop postgresql@16-main

# Clear data directory
rm -rf /var/lib/postgresql/16/main/*

# Restore base backup
pg_restore -d postgres "$RESTORE_DIR/db_full_$BASE_BACKUP.dump"

# Configure recovery
cat > /var/lib/postgresql/16/main/recovery.conf <<EOF
restore_command = 'cp $RESTORE_DIR/wal/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL (will enter recovery mode)
systemctl start postgresql@16-main

echo "=== PITR initiated ==="
echo "PostgreSQL is now recovering to $TARGET_TIME"
echo "Monitor progress: tail -f /var/log/postgresql/postgresql-*.log"
```

---

## Deployment Steps

### Initial Infrastructure Setup

```bash
#!/bin/bash
# deploy-infrastructure.sh
# Complete infrastructure deployment from scratch

set -e

echo "=== Open Draft Infrastructure Deployment ==="

# Step 1: Create VPC
echo "Step 1: Creating VPC..."
./scripts/create-vpc.sh

# Step 2: Provision servers
echo "Step 2: Provisioning servers..."
./scripts/provision-servers.sh

# Step 3: Configure network
echo "Step 3: Configuring network..."
./scripts/configure-network.sh

# Step 4: Setup load balancer
echo "Step 4: Setting up load balancer..."
./scripts/setup-load-balancer.sh

# Step 5: Install and configure PostgreSQL
echo "Step 5: Setting up PostgreSQL cluster..."
ssh bastion "ssh 10.0.20.10 'bash -s' < scripts/postgres-primary-setup.sh"
ssh bastion "ssh 10.0.21.10 'bash -s' < scripts/postgres-standby-setup.sh"

# Step 6: Install and configure Redis
echo "Step 6: Setting up Redis..."
ssh bastion "ssh 10.0.20.11 'bash -s' < scripts/redis-setup.sh"

# Step 7: Setup application servers
echo "Step 7: Setting up application servers..."
for server in 10.0.10.10 10.0.10.11 10.0.11.10; do
    ssh bastion "ssh $server 'bash -s' < scripts/app-server-setup.sh"
done

# Step 8: Deploy application
echo "Step 8: Deploying application..."
for server in 10.0.10.10 10.0.10.11 10.0.11.10; do
    ssh bastion "ssh $server 'bash -s' < scripts/deploy.sh"
done

# Step 9: Setup monitoring
echo "Step 9: Setting up monitoring..."
./scripts/setup-monitoring.sh

# Step 10: Configure backups
echo "Step 10: Configuring backups..."
./scripts/configure-backups.sh

# Step 11: Setup SSL
echo "Step 11: Configuring SSL..."
./scripts/setup-ssl.sh

# Step 12: Run health checks
echo "Step 12: Running health checks..."
./scripts/health-check.sh

echo "=== Deployment Complete ==="
echo "Application URL: https://theopendraft.com"
echo "Monitoring: https://monitoring.theopendraft.com"
```

---

## Scaling Strategy

### Horizontal Scaling Plan

```yaml
# scaling-plan.yml

# Current capacity (Launch)
initial:
  app_servers: 3
  db_primary: 1
  db_standby: 1
  redis: 1
  load_balancers: 1

# Scale to 10K concurrent users
scale_10k:
  app_servers: 6
  db_primary: 1
  db_standby: 2  # Add read replicas
  redis: 2       # Redis cluster
  load_balancers: 2
  cdn: cloudflare

# Scale to 100K concurrent users
scale_100k:
  app_servers: 20
  db_primary: 1
  db_standby: 5
  redis: 4       # Redis cluster with sharding
  load_balancers: 3
  cdn: cloudflare
  cache_layer: varnish  # Add Varnish cache

# Auto-scaling rules
autoscaling:
  app_servers:
    min: 3
    max: 50
    target_cpu: 70%
    scale_up_cooldown: 300s
    scale_down_cooldown: 600s

  database:
    read_replicas:
      min: 1
      max: 10
      trigger: "replication_lag > 5s OR read_connections > 80%"
```

### Auto-Scaling Configuration (AWS)

```hcl
# autoscaling.tf
resource "aws_autoscaling_group" "app" {
  name                 = "open-draft-app-asg"
  vpc_zone_identifier  = [
    aws_subnet.private_app_1.id,
    aws_subnet.private_app_2.id
  ]
  target_group_arns    = [aws_lb_target_group.app.arn]
  health_check_type    = "ELB"
  health_check_grace_period = 300

  min_size             = 3
  max_size             = 50
  desired_capacity     = 3

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "open-draft-app-server"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale-up"
  scaling_adjustment     = 2
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.app.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 600
  autoscaling_group_name = aws_autoscaling_group.app.name
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "70"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }
}

resource "aws_cloudwatch_metric_alarm" "low_cpu" {
  alarm_name          = "low-cpu"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "30"
  alarm_actions       = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }
}
```

---

## Cost Optimization

### Monthly Cost Estimate (AWS US-East-1)

```
Infrastructure Costs:

Application Tier:
- EC2 t3.large x3 (App Servers)      $150/month
- Reserved Instances (1 year)        -$45/month (30% savings)
                                     -------
                                     $105/month

Database Tier:
- EC2 r6i.2xlarge x2 (DB Servers)    $560/month
- EBS gp3 1TB x2                     $160/month
- Reserved Instances (1 year)        -$216/month (30% savings)
                                     -------
                                     $504/month

Cache & Storage:
- EC2 r6i.large (Redis)              $130/month
- S3 Standard 500GB                  $12/month
- S3 Standard-IA 5TB (backups)       $64/month
- CloudFront 1TB transfer            $85/month
                                     -------
                                     $291/month

Networking:
- Application Load Balancer          $23/month
- Data Transfer (2TB out)            $184/month
- NAT Gateway x2                     $65/month
                                     -------
                                     $272/month

Monitoring & Logging:
- CloudWatch Logs (50GB)             $25/month
- CloudWatch Metrics                 $10/month
                                     -------
                                     $35/month

Total Infrastructure:                $1,207/month

Third-Party Services:
- Appwrite Cloud (Pro)               $15/month
- Razorpay (transaction fees)        Variable
- SendGrid (Email)                   $20/month
- Sentry (Error monitoring)          $26/month
- CloudFlare Pro                     $20/month
                                     -------
                                     $81/month

TOTAL MONTHLY COST:                  ~$1,288/month

With further optimization:           ~$900-1000/month
```

### Cost Optimization Strategies

```markdown
1. Use Reserved Instances (30-40% savings)
2. Enable auto-scaling to reduce idle capacity
3. Use S3 Intelligent-Tiering for backups
4. Implement CloudFront caching aggressively
5. Use Aurora Serverless v2 for database (pay per use)
6. Leverage spot instances for non-critical workloads
7. Set up budget alerts in AWS
8. Regular cost audits and rightsizing
9. Use AWS Savings Plans
10. Implement proper caching to reduce compute needs
```

---

## Security Checklist

```markdown
- [ ] All servers patched and up-to-date
- [ ] SSH keys rotated and password authentication disabled
- [ ] Firewall configured with least-privilege rules
- [ ] Security groups properly configured
- [ ] All traffic encrypted in transit (TLS 1.2+)
- [ ] Database connections encrypted
- [ ] Secrets stored in secrets manager (not in code)
- [ ] Regular security audits scheduled
- [ ] Intrusion detection system (OSSEC) installed
- [ ] WAF rules configured on CloudFlare
- [ ] Rate limiting enabled
- [ ] DDoS protection enabled
- [ ] Backup encryption enabled
- [ ] Access logs enabled everywhere
- [ ] MFA enabled for all admin accounts
- [ ] Regular penetration testing scheduled
- [ ] Incident response plan documented
- [ ] Security training for team
- [ ] Vulnerability scanning automated
- [ ] Compliance checks (if applicable: PCI-DSS, GDPR, etc.)
```

---

## Final Notes

This enterprise deployment guide covers:

1. **High Availability**: Multi-AZ deployment, load balancing, database replication
2. **Security**: VPC isolation, security groups, WAF, intrusion detection
3. **Scalability**: Auto-scaling, read replicas, caching layers
4. **Monitoring**: Comprehensive metrics, logging, alerting
5. **Disaster Recovery**: Automated backups, PITR, documented recovery procedures
6. **Performance**: CDN, caching, optimized database queries
7. **Cost Efficiency**: Reserved instances, auto-scaling, resource optimization

**Remember**: This is enterprise-grade infrastructure. For most applications, you can start with:
- 1 application server
- 1 database server
- Managed services (RDS, ElastiCache, etc.)
- And scale up as needed

Good luck with your deployment! 🚀
