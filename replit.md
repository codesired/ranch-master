# Ranch Management System

## Overview

This is a full-stack ranch management system built with React, Express, and PostgreSQL. The application provides comprehensive livestock management, financial tracking, and agricultural operations functionality for modern ranchers. The system uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components.

**Status**: ✅ Successfully migrated from Replit Agent to standard Replit environment with full functionality restored and enhanced.

## Recent Changes (July 29, 2025)

✅ **Complete Migration**: Successfully migrated Ranch Management System from Replit Agent to standard Replit environment
✅ **Authentication System**: Fixed and configured Replit OAuth authentication with proper session management and 302 redirects
✅ **Database Integration**: PostgreSQL database successfully connected with all schema migrations applied  
✅ **Route Configuration**: All API routes properly configured and tested with correct HTTP status codes
✅ **Error Handling**: Enhanced error handling and debugging for authentication flows
✅ **Frontend Integration**: React frontend properly connected to backend with authentication flow
✅ **Route Ordering Fix**: Fixed critical issue where Vite middleware was intercepting API routes - now authentication redirects work properly
✅ **Authentication Flow**: Login button now correctly redirects to Replit authentication (302 status) instead of serving HTML (200 status)
✅ **UI Improvements**: Enhanced styling with improved gradients, better card designs, enhanced navigation, and modern visual hierarchy
✅ **CSS Architecture**: Implemented custom component classes for consistent ranch-themed styling across the application

## Previous Changes (January 21, 2025)

✅ **Migration Completed**: Successfully migrated from Replit Agent environment to standard Replit
✅ **Database Setup**: PostgreSQL database created and migrations applied
✅ **Profile & Settings**: Fixed and enhanced user profile management with notification settings
✅ **Enhanced Finance Section**: Completely rebuilt with comprehensive features including:
  - Advanced transaction filtering and search
  - Budget management with visual indicators
  - Account management and balance tracking
  - Financial reports and category breakdowns
  - Improved UI/UX with proper loading states and error handling
✅ **Security Improvements**: Fixed session configuration and authentication flows
✅ **Schema Extensions**: Added user profile fields and notification settings tables

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Authentication with OpenID Connect
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **API Design**: RESTful API with proper error handling and logging middleware

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom ranch-themed variables
- **Build Tool**: Vite for fast development and optimized builds

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Comprehensive schema covering users, animals, health records, breeding, transactions, inventory, equipment, maintenance, and documents

## Key Components

### Authentication System
- Uses Replit's OpenID Connect authentication
- Session-based authentication with PostgreSQL session store
- User profile management with role-based access (user, admin, manager)
- Automatic session refresh and logout handling

### Livestock Management
- Animal registration with unique tag IDs
- Species, breed, and individual animal tracking
- Health record management and vaccination tracking
- Breeding record management
- Location and status tracking

### Financial Management
- Transaction tracking (income and expenses)
- Category-based expense management
- Monthly revenue and expense reporting
- Financial summary and dashboard analytics

### Inventory Management
- Feed and supply inventory tracking
- Low stock alerts and notifications
- Quantity and unit management
- Expiration date tracking

### Equipment Management
- Equipment registration and status tracking
- Maintenance record management
- Operational status monitoring
- Maintenance scheduling and alerts

### Document Management
- Document storage and categorization
- File type support for various ranch documents
- Document metadata and tagging
- Related entity linking (animals, equipment, etc.)

## Data Flow

1. **Authentication Flow**: User authenticates via Replit OAuth → Session created in PostgreSQL → User data stored/retrieved
2. **API Flow**: Frontend → TanStack Query → Express API → Drizzle ORM → PostgreSQL
3. **Real-time Updates**: Mutations trigger cache invalidation → Automatic UI updates
4. **Error Handling**: API errors propagate through React Query → Toast notifications → User feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication Dependencies
- **openid-client**: OpenID Connect client
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development
- Uses Vite dev server for frontend hot reload
- Express server with TypeScript execution via tsx
- Environment variables for database and authentication configuration
- Replit-specific plugins for development environment integration

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild for Node.js execution
- Single production server serving both API and static files
- Database migrations handled via Drizzle Kit

### Database Management
- Schema defined in TypeScript with Drizzle
- Migrations generated and applied via drizzle-kit
- Database URL configuration for different environments
- Session table management for authentication

### Environment Configuration
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Session encryption key
- REPL_ID: Replit environment identifier
- ISSUER_URL: OpenID Connect issuer URL
- REPLIT_DOMAINS: Allowed authentication domains

The application follows a modern full-stack architecture with proper separation of concerns, type safety throughout, and a focus on developer experience and maintainability.