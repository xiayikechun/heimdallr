.PHONY: dev-up dev-down dev-logs dev-restart dev-build dev-rebuild backend-logs mysql-logs frontend-logs backend-restart backend-rebuild prod-up prod-down prod-logs prod-restart prod-build prod-rebuild prod-init prod-backup

# Development environment with Docker Compose
dev-up:
	@echo "🚀 Starting Heimdallr development environment..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "dev") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f dev.docker-compose.yaml up -d
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend available at: http://localhost:5173"
	@echo "📖 API available at: http://localhost:9000"
	@echo "🗄️  MySQL available at: localhost:3306"

dev-down:
	@echo "🛑 Stopping development environment..."
	cd deploy && docker-compose -f dev.docker-compose.yaml down
	@echo "✅ Development environment stopped!"

dev-logs:
	cd deploy && docker-compose -f dev.docker-compose.yaml logs -f

dev-restart:
	@echo "🔄 Restarting development environment..."
	cd deploy && docker-compose -f dev.docker-compose.yaml restart
	@echo "✅ Development environment restarted!"

dev-build:
	@echo "🔧 Building development environment..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "dev") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f dev.docker-compose.yaml build

dev-rebuild:
	@echo "🔧 Rebuilding development environment..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "dev") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f dev.docker-compose.yaml up --build -d
	@echo "✅ Development environment rebuilt and started!"

# Individual service logs
backend-logs:
	cd deploy && docker-compose -f dev.docker-compose.yaml logs -f backend

mysql-logs:
	cd deploy && docker-compose -f dev.docker-compose.yaml logs -f mysql

frontend-logs:
	cd deploy && docker-compose -f dev.docker-compose.yaml logs -f frontend

# Backend development (local)
backend-dev:
	cd backend && python main.py

backend-install:
	cd backend && poetry install

# Backend service management
backend-restart:
	@echo "🔄 Restarting backend service..."
	cd deploy && docker-compose -f dev.docker-compose.yaml restart backend
	@echo "✅ Backend service restarted!"

backend-rebuild:
	@echo "🔧 Rebuilding and restarting backend service..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "dev") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f dev.docker-compose.yaml up --build -d backend
	@echo "✅ Backend service rebuilt and restarted!"

# Version management
version-get:
	@echo "📦 Current version:"
	@cat VERSION

version-set:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Please provide VERSION parameter: make version-set VERSION=3.1.0"; \
		exit 1; \
	fi
	@echo "📦 Setting version to $(VERSION)..."
	@echo "$(VERSION)" > VERSION
	@sed -i.bak 's/version = "v[^"]*"/version = "v$(VERSION)"/' backend/pyproject.toml && rm -f backend/pyproject.toml.bak
	@sed -i.bak 's/"version": "[^"]*"/"version": "$(VERSION)"/' frontend/package.json && rm -f frontend/package.json.bak
	@echo "✅ Version updated to $(VERSION) in all files!"
	@echo "📝 Files updated:"
	@echo "   - VERSION"
	@echo "   - backend/pyproject.toml"
	@echo "   - frontend/package.json"

version-sync:
	@echo "🔄 Synchronizing version from VERSION file..."
	@VERSION=$$(cat VERSION) && $(MAKE) version-set VERSION=$$VERSION

version-check:
	@echo "🔍 Checking version consistency..."
	@ROOT_VERSION=$$(cat VERSION); \
	BACKEND_VERSION=$$(grep 'version = "v' backend/pyproject.toml | sed 's/.*"v\([^"]*\)".*/\1/'); \
	FRONTEND_VERSION=$$(grep '"version":' frontend/package.json | sed 's/.*": "\([^"]*\)".*/\1/'); \
	echo "📦 Root VERSION file: $$ROOT_VERSION"; \
	echo "🐍 Backend pyproject.toml: $$BACKEND_VERSION"; \
	echo "⚛️  Frontend package.json: $$FRONTEND_VERSION"; \
	if [ "$$ROOT_VERSION" = "$$BACKEND_VERSION" ] && [ "$$ROOT_VERSION" = "$$FRONTEND_VERSION" ]; then \
		echo "✅ All versions are synchronized!"; \
	else \
		echo "❌ Version mismatch detected! Run 'make version-sync' to fix."; \
		exit 1; \
	fi

# =============================================================================
# PRODUCTION ENVIRONMENT COMMANDS
# =============================================================================

prod-up:
	@echo "🚀 Starting Heimdallr production environment..."
	@if [ ! -f deploy/.env ]; then \
		echo "❌ Production .env file not found!"; \
		echo "📋 Please copy and configure the environment file:"; \
		echo "   cp deploy/.env.example deploy/.env"; \
		echo "   nano deploy/.env"; \
		exit 1; \
	fi
	@VERSION=$$(cat VERSION 2>/dev/null || echo "3.0.0") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f docker-compose.prod.yaml --profile mysql up -d
	@echo "✅ Production environment started!"
	@echo "🌐 Application available at: http://localhost"
	@echo "📖 API available at: http://localhost/api"

prod-up-sqlite:
	@echo "🚀 Starting Heimdallr production environment (SQLite)..."
	@if [ ! -f deploy/.env ]; then \
		echo "❌ Production .env file not found!"; \
		echo "📋 Please copy and configure the environment file:"; \
		echo "   cp deploy/.env.example deploy/.env"; \
		echo "   nano deploy/.env"; \
		exit 1; \
	fi
	@VERSION=$$(cat VERSION 2>/dev/null || echo "3.0.0") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f docker-compose.prod.yaml up -d
	@echo "✅ Production environment (SQLite) started!"
	@echo "🌐 Application available at: http://localhost"
	@echo "📖 API available at: http://localhost/api"

prod-down:
	@echo "🛑 Stopping production environment..."
	cd deploy && docker-compose -f docker-compose.prod.yaml --profile mysql down
	@echo "✅ Production environment stopped!"

prod-logs:
	@echo "📋 Showing production environment logs..."
	cd deploy && docker-compose -f docker-compose.prod.yaml logs -f

prod-restart:
	@echo "🔄 Restarting production environment..."
	cd deploy && docker-compose -f docker-compose.prod.yaml --profile mysql restart
	@echo "✅ Production environment restarted!"

prod-build:
	@echo "🔧 Building production environment..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "3.0.0") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f docker-compose.prod.yaml --profile mysql build

prod-rebuild:
	@echo "🔧 Rebuilding production environment..."
	@VERSION=$$(cat VERSION 2>/dev/null || echo "3.0.0") && \
	COMMIT_ID=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	cd deploy && HEIMDALLR_VERSION=$$VERSION COMMIT_ID=$$COMMIT_ID docker-compose -f docker-compose.prod.yaml --profile mysql up --build -d
	@echo "✅ Production environment rebuilt and started!"

prod-init:
	@echo "🎯 Initializing production environment..."
	@if [ ! -f deploy/.env ]; then \
		echo "📋 Copying environment template..."; \
		cp deploy/.env.example deploy/.env; \
		echo "✅ Environment file created: deploy/.env"; \
		echo ""; \
		echo "⚠️  IMPORTANT: Please edit deploy/.env and configure:"; \
		echo "   - DOMAIN: Your actual domain name"; \
		echo "   - SECRET_KEY: Generate with 'openssl rand -hex 32'"; \
		echo "   - MYSQL_PASSWORD: Set a secure password"; \
		echo "   - DATABASE_DSN: Update with your password"; \
		echo ""; \
		echo "📖 Then run: make prod-up"; \
	else \
		echo "✅ Environment file already exists: deploy/.env"; \
		echo "📖 Run: make prod-up"; \
	fi

prod-backup:
	@echo "💾 Creating production backup..."
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	echo "📦 Backup timestamp: $$TIMESTAMP"; \
	mkdir -p deploy/backups; \
	if docker ps --format 'table {{.Names}}' | grep -q heimdallr-mysql-prod; then \
		echo "🗄️  Backing up MySQL database..."; \
		docker exec heimdallr-mysql-prod mysqldump -u root -p$$(grep MYSQL_ROOT_PASSWORD deploy/.env | cut -d'=' -f2) heimdallr > deploy/backups/mysql_backup_$$TIMESTAMP.sql; \
		echo "✅ MySQL backup saved: deploy/backups/mysql_backup_$$TIMESTAMP.sql"; \
	fi; \
	if [ -d deploy/data/sqlite ]; then \
		echo "🗄️  Backing up SQLite database..."; \
		cp deploy/data/sqlite/* deploy/backups/ 2>/dev/null || true; \
		echo "✅ SQLite backup saved to: deploy/backups/"; \
	fi; \
	echo "🎉 Backup completed!"

# Production service logs
prod-backend-logs:
	cd deploy && docker-compose -f docker-compose.prod.yaml logs -f backend

prod-mysql-logs:
	cd deploy && docker-compose -f docker-compose.prod.yaml logs -f mysql

prod-nginx-logs:
	cd deploy && docker-compose -f docker-compose.prod.yaml logs -f nginx

# Quick help
prod-help:
	@echo "🚀 Heimdallr Production Commands:"
	@echo ""
	@echo "📋 Setup:"
	@echo "  make prod-init      - Initialize production environment"
	@echo "  make prod-up        - Start production (MySQL)"
	@echo "  make prod-up-sqlite - Start production (SQLite)"
	@echo ""
	@echo "🔧 Management:"
	@echo "  make prod-down      - Stop production"
	@echo "  make prod-restart   - Restart production"
	@echo "  make prod-logs      - View all logs"
	@echo "  make prod-backup    - Create backup"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  make prod-build     - Build production images"
	@echo "  make prod-rebuild   - Rebuild and start production"
	@echo ""
	@echo "📝 Individual Logs:"
	@echo "  make prod-backend-logs - Backend service logs"
	@echo "  make prod-mysql-logs   - MySQL service logs"  
	@echo "  make prod-nginx-logs   - Nginx service logs"