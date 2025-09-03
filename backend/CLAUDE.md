# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the backend code in this monorepo.

## Project Overview

Heimdallr is a lightweight notification gateway written in Python using FastAPI. This is the backend component of the monorepo, providing a RESTful API for managing users, groups, channels, and sending notifications. It aggregates various push channels and can be deployed as a serverless application with minimal cost. The project serves as an open-source alternative to Server酱 with support for multiple notification channels.

**Note**: This backend is part of a larger monorepo structure. See the root `CLAUDE.md` for overall project guidance.

## Commands

### Development Environment (Recommended)
**From repository root:**
- `make dev-rebuild` - Start complete development environment with hot reload
- `make dev-up` - Start existing development environment  
- `make backend-logs` - View backend service logs
- `make dev-down` - Stop development environment

**Development URLs:**
- Backend API: http://localhost:9000
- Frontend: http://localhost:5173  
- MySQL: localhost:3306

### Local Development
**From backend directory:**
- `cd backend` - Navigate to backend directory (run from repo root)
- `python main.py` - Run the development server locally
- `make run` - Alternative way to run the server
- `make pre-commit` - Run code formatting and linting checks

### Code Quality
- `poetry run pre-commit run` - Run pre-commit hooks (formatting, linting)
- `poetry run black .` - Format code with Black
- `poetry run isort .` - Sort imports
- `poetry run autoflake --remove-all-unused-imports --recursive .` - Remove unused imports

### Dependencies
- `poetry install` - Install all dependencies
- `poetry add <package>` - Add new dependency
- `poetry remove <package>` - Remove dependency

### Database
- `python init_db.py` - Initialize database tables (optional, auto-created on startup)
- `python main.py` - Starts server and auto-creates database tables

## Architecture

### Core Components

**FastAPI Application Structure:**
- `main.py` - Application entry point with FastAPI app initialization and database setup
- `heimdallr/api/` - API routes and endpoints (Controller layer)
  - `api.py` - Main router that includes all sub-routers
  - `auth.py` - Authentication endpoints (register, login, user profile)
  - `users.py` - User management endpoints (admin only)
  - `groups.py` - Group management endpoints (CRUD, token management)
  - `channels.py` - Channel management endpoints (CRUD)
  - `push.py` - Core push notification endpoints
  - `webhook.py` - Webhook handling endpoints
  - `competable.py` - Compatibility endpoints for Bark, PushDeer, etc.
  - `welcome.py` - Welcome/health check endpoints

**Database Layer:**
- `heimdallr/database/` - Database configuration and utilities
  - `database.py` - SQLAlchemy engine, session management, table creation
  - `schemas.py` - Pydantic models for API request/response validation
- `heimdallr/entity/` - SQLAlchemy entity definitions (Data layer)
  - `user.py` - User entity with authentication and admin flags
  - `group.py` - Group entity with unique tokens
  - `channel.py` - Channel entity with JSON config storage
  - `association_tables.py` - Many-to-many relationship tables
- `heimdallr/model/` - Data access layer (Repository pattern)
  - `user_model.py` - User CRUD operations
  - `group_model.py` - Group CRUD operations and token generation
  - `channel_model.py` - Channel CRUD operations and group associations

**Service Layer:**
- `heimdallr/services/` - Business logic layer
  - `auth_service.py` - Authentication and authorization logic
  - `user_service.py` - User management business rules
  - `group_service.py` - Group management with ownership validation
  - `channel_service.py` - Channel management with permission checks
  - `config_service.py` - Database-based configuration service

**Authentication System:**
- `heimdallr/auth/` - Authentication utilities (stateless)
  - `jwt.py` - JWT token creation and validation
  - `password.py` - Password hashing and verification using bcrypt
  - `dependencies.py` - FastAPI dependency injection for authentication

**Channel System:**
- `heimdallr/channel/` - Notification channel implementations
  - `base.py` - Base channel interface
  - `factory.py` - Channel factory for creating instances
  - Individual channel files (bark.py, telegram.py, wecom.py, etc.)

**Configuration System:**
- `heimdallr/shared/config.py` - Database configuration manager
- `heimdallr/services/config_service.py` - Database-based configuration service

### Key Patterns

1. **Layered Architecture**: Controller → Service → Model → Entity pattern for clear separation of concerns
2. **Repository Pattern**: Model layer provides data access abstraction
3. **Service Layer**: Business logic and validation centralized in service classes
4. **Dependency Injection**: FastAPI dependency system for database sessions and authentication
5. **Channel Factory Pattern**: Channels are created dynamically based on configuration
6. **Group-based Routing**: Messages are sent to all channels within a group
7. **Database-first Configuration**: User data stored in database with JWT authentication
8. **Compatibility Layers**: Separate endpoints for Bark, PushDeer, message-pusher compatibility

### Database Schema

**Users Table:**
- `id` (Primary Key), `username` (Unique), `email`, `password_hash`, `is_admin`, timestamps
- First registered user automatically becomes admin

**Groups Table:**
- `id` (Primary Key), `name`, `token` (Unique), `description`, `user_id` (Foreign Key), timestamps
- Each group has a unique auto-generated token for API access

**Channels Table:**
- `id` (Primary Key), `name`, `channel_type`, `config` (JSON), `is_active`, `user_id` (Foreign Key), timestamps
- Configuration stored as JSON for flexibility across different channel types

**Group-Channel Association:**
- Many-to-many relationship between groups and channels
- Users can only associate their own channels with their own groups

### Configuration Options

**Database Configuration:**
- `DATABASE_DSN` - MySQL connection string (optional)
- `SQLITE_PATH` - SQLite file path (default: "heimdallr.db")
- If DSN is provided, MySQL is used; otherwise SQLite

**Authentication Configuration:**
- `SECRET_KEY` - JWT signing secret (change in production!)
- JWT tokens valid for 24 hours


### Supported Notification Channels

The system supports 14+ notification types including Bark, WeChat Work, Telegram, Discord, Email, ntfy, Lark, DingTalk, Apprise, PushDeer, Quote0, and more.

## Development Notes

### Technology Stack
- **Framework**: FastAPI with uvicorn server
- **Database**: SQLAlchemy 2.0+ with SQLite/MySQL support
- **Authentication**: JWT tokens with bcrypt password hashing  
- **Dependency Management**: Poetry
- **Code Quality**: pre-commit hooks (Black, isort, autoflake)
- **Configuration**: Database-based configuration system
- **Containerization**: Multi-stage Docker builds (dev/prod targets)

### Development Environment Setup

**Docker Development (Recommended):**
- Multi-stage Dockerfile with `dev` and `prod` targets
- Development container includes dev dependencies and debugging tools
- Volume mounting for live code reload
- Auto-installation of dependencies on container startup
- Environment variables configured for development
- MySQL database with persistent storage

**Development Environment Features:**
- **Hot Reload**: Backend auto-restarts on Python file changes
- **Volume Mounting**: Source code mounted as `/app` with live updates
- **Dependency Management**: `poetry install` runs automatically on startup
- **Database Persistence**: MySQL data stored in `deploy/data/mysql/`
- **Environment Variables**: Pre-configured for development (DEBUG=true, etc.)
- **Multi-service Setup**: Backend + Frontend + MySQL in single environment

### Coding Standards

**File Organization:**
- Follow layered architecture: API → Service → Model → Entity
- Each entity should have corresponding files in entity/, model/, and services/
- Keep auth/ package stateless (no database dependencies)
- Use dependency injection for database sessions and authentication

**Naming Conventions:**
- Files: snake_case (e.g., `user_service.py`, `group_model.py`)
- Classes: PascalCase (e.g., `UserService`, `GroupModel`)
- Functions/Variables: snake_case (e.g., `get_user_by_id`, `db_session`)
- Constants: UPPER_SNAKE_CASE (e.g., `SECRET_KEY`, `DATABASE_URL`)

**Import Structure:**
```python
# Standard library imports
from typing import List, Optional
import json

# Third-party imports  
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local imports
from heimdallr.auth.dependencies import get_current_user
from heimdallr.database.database import get_db
from heimdallr.entity.user import User
from heimdallr.services.user_service import UserService
```

**Error Handling:**
- Service layer raises `ValueError` for business logic errors
- Controller layer catches `ValueError` and converts to HTTP exceptions
- Use specific HTTP status codes (400 for validation, 401 for auth, 403 for permissions, 404 for not found)

**Database Patterns:**
- Always use Service layer for business logic and permission checks
- Model layer only contains CRUD operations
- Entity layer only contains SQLAlchemy model definitions
- Use type hints and handle SQLAlchemy column types properly

**Security Best Practices:**
- All user operations must validate ownership through Service layer
- JWT tokens for stateless authentication
- Bcrypt for password hashing
- No sensitive data in logs or error messages

### Testing
- No test suite currently exists (future enhancement needed)
- Manual testing via API endpoints
- Database auto-initializes on startup for easy development