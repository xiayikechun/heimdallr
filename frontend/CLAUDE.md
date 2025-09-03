# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend application for Heimdallr v3, a React-based web UI for managing notification channels, groups, and users. The frontend provides a modern interface to interact with the Heimdallr FastAPI backend.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with Fast Refresh and Hot Module Replacement
- **Styling**: Tailwind CSS v4 with CSS-in-JS support
- **UI Components**: shadcn/ui (New York style) with Lucide React icons
- **Package Manager**: pnpm (lockfile present)
- **Code Quality**: ESLint with TypeScript support
- **Containerization**: Multi-stage Docker builds (dev/prod targets)

## Development Commands

### Development Environment (Recommended)
**From repository root:**
```bash
# Start complete development environment with hot reload
make dev-rebuild

# Start existing development environment  
make dev-up

# View frontend service logs
make frontend-logs

# Stop development environment
make dev-down
```

**Development URLs:**
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:9000
- MySQL: localhost:3306

### Local Development
**From frontend directory:**
```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview

# i18n management
pnpm i18n:workflow   # Complete i18n workflow
pnpm i18n:scan       # Scan for translation keys
pnpm i18n:check      # Check translation status
pnpm i18n:clean      # Clean untranslated keys
```

## Architecture and Structure

### Core Configuration
- **Vite Config**: Uses React plugin with Tailwind CSS v4 integration
- **Path Aliases**: `@/*` maps to `./src/*` for clean imports
- **TypeScript**: Project references split between app and node configs
- **ESLint**: Modern flat config with React hooks and TypeScript rules
- **Development Server**: Configured for Docker with host `0.0.0.0` and polling

### Development Environment Setup

**Docker Development (Recommended):**
- Multi-stage Dockerfile with `dev` and `prod` targets
- Development container runs Vite dev server on port 5173
- Volume mounting for live code reload and Hot Module Replacement
- Auto-installation of dependencies on container startup
- Environment variables configured for API integration
- Optimized for Docker with file polling enabled

**Development Environment Features:**
- **Hot Module Replacement**: Instant updates on file changes without page refresh
- **Volume Mounting**: Source code mounted as `/app` with live updates (excludes node_modules)
- **Dependency Management**: `pnpm install` runs automatically on startup
- **API Integration**: Pre-configured to connect to backend at localhost:9000
- **Environment Variables**: Development-specific configuration (NODE_ENV=development)
- **Multi-service Setup**: Frontend + Backend + MySQL in single environment

### UI System
- **shadcn/ui Integration**: Configured with New York style variant
- **Component Aliases**: 
  - `@/components` for React components
  - `@/components/ui` for shadcn UI components
  - `@/lib/utils` for utility functions
  - `@/hooks` for custom hooks
- **Tailwind CSS v4**: Using new @import syntax with CSS variables for theming
- **Dark Mode**: Built-in support with CSS custom properties

### Styling Architecture
- **Design System**: Uses CSS custom properties for consistent theming
- **Color Palette**: Comprehensive color scheme with light/dark mode variants
- **Utilities**: `cn()` utility function combining clsx and tailwind-merge for conditional styling

## Key Features

### Component System
- Modern React 19 with TypeScript
- shadcn/ui components for consistent UI
- Lucide React icons integrated
- CSS-in-JS with Tailwind v4

### Development Experience
- Fast development with Vite HMR
- TypeScript for type safety
- ESLint with React-specific rules
- Path aliases for clean imports

## File Structure Patterns

```
src/
├── components/        # React components
│   └── ui/           # shadcn/ui components
├── lib/              # Utility functions
│   └── utils.ts      # Common utilities (cn function)
├── hooks/            # Custom React hooks
└── assets/           # Static assets
```

## Backend Integration

This frontend is designed to work with the Heimdallr FastAPI backend located in `../backend/`. The backend provides:
- JWT authentication endpoints
- CRUD APIs for channels, groups, and users
- WebSocket support for real-time notifications
- Multi-user system with role-based access

## Development Guidelines

### Component Development
- Use TypeScript for all components
- Follow shadcn/ui patterns for UI components
- Use the `cn()` utility for conditional styling
- Leverage path aliases (`@/*`) for clean imports

### Styling Approach
- Use Tailwind CSS utility classes
- Leverage CSS custom properties for theming
- Support both light and dark modes
- Follow the established design system
- DO NOT use indigo color

### Code Quality
- Run `pnpm lint` before committing
- Use TypeScript strict mode
- Follow React hooks best practices
- Maintain consistent file naming conventions

### Internationalization (i18n)
- **Technology**: i18next + react-i18next
- **Languages**: Chinese (zh) and English (en)
- **Translation Files**: `src/i18n/zh.json` and `src/i18n/en.json`
- **Usage**: Use `t('key')` function from `useTranslation()` hook
- **Always update i18n resources when adding new text**

#### i18n Management Scripts
```bash
# Complete workflow (recommended)
pnpm i18n:workflow   # Scan → Clean → Check

# Individual commands
pnpm i18n:scan       # Scan code for translation keys
pnpm i18n:check      # Check translation completeness

# Clean commands (flexible cleaning options)
pnpm i18n:clean              # Clean all (unused + empty keys, default)
pnpm i18n:clean:unused       # Only remove unused translation keys
pnpm i18n:clean:empty        # Only remove empty/untranslated keys
pnpm i18n:clean:all          # Explicitly clean both types

# Direct script usage with parameters
node scripts/clean-i18n.js --unused    # Only unused keys
node scripts/clean-i18n.js --empty     # Only empty keys  
node scripts/clean-i18n.js --all       # Both types
node scripts/clean-i18n.js --help      # Show help
```

#### i18n Development Workflow
1. **Write code with translation keys**:
   ```tsx
   const { t } = useTranslation();
   return <h1>{t('myFeature.title')}</h1>;
   ```

2. **Scan for new keys**: `pnpm i18n:scan`

3. **Add translations to both files**:
   ```json
   // zh.json
   { "myFeature": { "title": "我的功能" } }
   // en.json  
   { "myFeature": { "title": "My Feature" } }
   ```

4. **Verify completeness**: `pnpm i18n:check`

#### Translation Key Naming Convention
Use modular structure: `module.function.content`
- `auth.login` - Authentication module login
- `dashboard.welcome` - Dashboard welcome message
- `channels.createTitle` - Channel creation title
- `common.save` - Common save button

### Misc
- Use modal dialogs for confirmation
- Run `pnpm i18n:workflow` before committing code
- Follow translation key naming conventions

## Common Development Tasks

### Adding New UI Components
1. Use shadcn/ui CLI to add components, `pnpm dlx shadcn@latest add`
2. Import using `@/components/ui/*` alias
3. Style with Tailwind CSS utilities and design tokens

### API Integration
1. Create service functions for backend communication
2. Handle JWT authentication for protected routes
3. Implement error handling for API responses
4. Use React hooks for state management

### Theming and Styling
1. Extend CSS custom properties in `src/index.css`
2. Use the established color palette and design tokens
3. Test both light and dark mode variants
4. Maintain responsive design patterns

### i18n Management

#### Complete Development Workflow
```bash
# 1. Write code with translation keys, then run:
pnpm i18n:workflow    # Automatically: scan → clean → check

# 2. Manual step-by-step approach:
pnpm i18n:scan                    # Scan for new translation keys
# Manually add translations to zh.json and en.json files
pnpm i18n:clean:unused            # Remove unused keys (optional)
pnpm i18n:check                   # Verify all translations are complete
```

#### Selective Cleaning
```bash
# During development - clean up specific issues:
pnpm i18n:clean:unused      # Remove keys not used in code (after refactoring)
pnpm i18n:clean:empty       # Remove __STRING_NOT_TRANSLATED__ placeholders
pnpm i18n:clean:all         # Clean everything (default behavior)

# Before committing - complete check:
pnpm i18n:workflow          # Ensures everything is clean and complete
```

#### Troubleshooting
```bash
# Show detailed cleaning options:
node scripts/clean-i18n.js --help

# Debug translation issues:
pnpm i18n:check             # Shows missing translations and unused keys
```