# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Heimdallr is a lightweight notification gateway with a modern monorepo architecture. The project consists of:
- **Backend**: FastAPI-based API server written in Python
- **Frontend**: React + TypeScript web UI for managing channels, groups, and notifications
- **Documentation**: Comprehensive guides and examples in the `docs/` directory

This is v3 of Heimdallr, featuring a complete rewrite with user authentication, database persistence, and a RESTful API.

## Monorepo Structure

```
heimdallr/
├── backend/                 # Python FastAPI backend
│   ├── CLAUDE.md           # Backend-specific Claude guidance
│   ├── heimdallr/          # Main Python package
│   ├── main.py             # Application entry point
│   ├── pyproject.toml      # Poetry dependencies and config
│   └── Dockerfile          # Backend containerization
├── frontend/               # React + TypeScript frontend application
│   ├── CLAUDE.md           # Frontend-specific Claude guidance
│   ├── src/                # React application source code
│   ├── package.json        # pnpm dependencies and scripts
│   ├── vite.config.ts      # Vite configuration
│   └── Dockerfile          # Frontend containerization
├── deploy/                 # Deployment configurations
│   ├── dev.docker-compose.yaml  # Development environment
│   └── data/              # Development data storage
├── docs/                   # Documentation and guides
│   ├── Api.md             # API documentation
│   ├── Config.md          # Configuration guide
│   ├── deploy/            # Deployment guides
│   └── example/           # Usage examples
├── Makefile               # Development environment commands
├── README.md              # Main project documentation
└── renovate.json          # Dependency update configuration
```

## Quick Start Commands

### Development Environment (Recommended)
```bash
# Start complete development environment with hot reload
make dev-rebuild

# Or start existing environment
make dev-up

# View logs
make dev-logs
make backend-logs
make frontend-logs

# Stop environment
make dev-down
```

**Development URLs:**
- Frontend: http://localhost:5173 (React + Vite dev server)
- Backend API: http://localhost:9000 (FastAPI)
- MySQL: localhost:3306

### Individual Development

#### Backend Development
```bash
cd backend
poetry install
python main.py
```

#### Frontend Development
```bash
cd frontend
pnpm install
pnpm dev
```

### Documentation
- See `backend/CLAUDE.md` for detailed backend development guidance
- See `frontend/CLAUDE.md` for detailed frontend development guidance
- See `docs/` directory for deployment and usage guides

## Project Context

This is a monorepo transition from the previous single-package structure. The backend maintains all existing functionality while preparing for frontend integration. The architecture supports:

- Multi-user system with JWT authentication
- 14+ notification channels (Bark, WeChat Work, Telegram, etc.)
- Group-based message routing
- Database persistence (SQLite/MySQL)
- API compatibility with existing services

## Development Workflow

### Recommended Development Flow
1. **Start Development Environment**: Use `make dev-rebuild` for complete setup with hot reload
2. **Backend Development**: Make changes in `backend/` directory - auto-reloads on file changes
3. **Frontend Development**: Make changes in `frontend/` directory - hot module replacement enabled
4. **Database Changes**: MySQL persists data in `deploy/data/mysql/`
5. **Documentation**: Update guides in `docs/` directory

### Component-Specific Guidelines
1. **Backend**: Follow guidance in `backend/CLAUDE.md` for FastAPI development
2. **Frontend**: Follow guidance in `frontend/CLAUDE.md` for React + TypeScript development
3. **Deployment**: Use configurations in `deploy/` directory
4. **Documentation**: Update relevant guides in `docs/` directory

### Development Features
- **Hot Reload**: Both frontend and backend auto-reload on code changes
- **Volume Mounting**: Source code mounted for live development
- **Dependency Management**: Auto-install dependencies on container startup
- **Database Persistence**: MySQL data persists across container restarts
- **Multi-stage Builds**: Separate dev and production Docker configurations

### MCP Usages
- Use context7 to check the usage of packages
- When debugging frontend issues, use browsermcp to get logs from console or get screenshot of the page

## Key Changes from Previous Version

- **Monorepo Structure**: Separated backend and frontend concerns
- **Database Persistence**: Moved from file-based to database configuration
- **User Authentication**: Added JWT-based authentication system
- **RESTful API**: Complete API for CRUD operations on channels, groups, and users
- **Enhanced Architecture**: Layered architecture with clear separation of concerns

## Common Issues and Solutions

### React Hook Form + Zod Type Errors

**Problem**: When using `useForm` with `zodResolver`, TypeScript errors occur due to type mismatches between Zod schema inference and React Hook Form types.

**Root Cause**: Using `.default()` in Zod schemas creates optional types (`field?: type | undefined`) but React Hook Form expects exact types.

**Solution**:
1. **Remove `.default()` from Zod schema** - Handle defaults in `defaultValues` instead:
   ```typescript
   // ❌ Wrong - creates optional types
   const schema = z.object({
     name: z.string(),
     is_active: z.boolean().default(true),
     config: z.record(z.unknown()).default({}),
   });

   // ✅ Correct - consistent required types
   const schema = z.object({
     name: z.string(),
     is_active: z.boolean(),
     config: z.record(z.string(), z.unknown()),
   });
   ```

2. **Set defaults in useForm configuration**:
   ```typescript
   const form = useForm<FormData>({
     resolver: zodResolver(schema),
     defaultValues: {
       name: '',
       is_active: true,
       config: {},
     },
   });
   ```

3. **Use `unknown` instead of `any`** for better type safety and to pass linting.

4. **Ensure component interfaces match form types** exactly to avoid Control type mismatches.

**Files affected**: Form components using react-hook-form with zod validation (e.g., `CreateChannelPage.tsx`, `ChannelConfigForm.tsx`)