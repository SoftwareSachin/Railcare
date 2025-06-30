# RailCare Unified Services Portal

## Overview

RailCare is a comprehensive railway station management system that provides a unified portal for passengers, volunteers, station staff, and administrators. The system integrates multiple modules including crowd monitoring (CrowdFlow), medical emergency response (MediLink), and various safety services to ensure efficient railway operations and passenger safety.

The application is built as a full-stack web application using modern technologies with a focus on real-time operations, secure authentication, and role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live data streaming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL storage
- **WebSocket**: Native WebSocket server for real-time communications
- **API Design**: RESTful endpoints with JSON responses

### Database Layer
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **Primary Method**: Aadhaar-based OTP authentication
- **Security**: AES-256 encryption for sensitive data
- **Session Storage**: PostgreSQL-backed sessions with express-session
- **Authorization**: Role-based access control (RBAC) with JWT tokens

### User Role Management
Four distinct user roles with specific permissions:
- **Passenger**: Access to crowd maps, emergency services, train information
- **Volunteer/NGO**: Platform dweller assistance, escort services, tele-health
- **Station Staff**: Station monitoring, alert triage, vendor management
- **Admin/Operator**: System configuration, global dashboards, audit logs

### Real-time Data Pipeline
- **WebSocket Server**: Handles live updates for alerts, crowd data, and system status
- **Event Broadcasting**: Real-time notifications for emergency alerts and status changes
- **Data Synchronization**: Automatic client-side cache invalidation and refetching

### Module System
Eight integrated service modules:
1. **CrowdFlow**: Real-time crowd density monitoring and management
2. **MediLink**: Medical emergency response and hospital coordination
3. **InfoReach**: Train information and passenger communication
4. **SafeHer**: Women safety features and escort services
5. **SafeServe**: Food and water quality control
6. **CCTV Integration**: Security monitoring and incident detection
7. **Platform Dweller Support**: Social services and assistance
8. **Analytics Dashboard**: Operational insights and reporting

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Aadhaar → OTP → Session establishment → Role assignment
2. **Data Fetching**: React Query manages API calls with automatic caching and background updates
3. **Real-time Updates**: WebSocket connection provides live data streams
4. **State Management**: Client-side state synchronized with server through queries and mutations

### Database Operations
1. **Connection Management**: Pooled connections through Neon serverless
2. **Query Optimization**: Drizzle ORM with prepared statements and type safety
3. **Session Storage**: PostgreSQL table for session persistence
4. **Data Validation**: Zod schemas for runtime type checking

### Alert Processing
1. **Alert Creation**: Multiple sources (sensors, manual reports, automated systems)
2. **Priority Assignment**: Severity-based routing and notification
3. **Real-time Distribution**: WebSocket broadcast to relevant users
4. **Status Tracking**: Complete lifecycle management from creation to resolution

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and query execution
- **drizzle-orm**: Database ORM with TypeScript support
- **@tanstack/react-query**: Server state management and caching
- **express & express-session**: Web server and session management
- **ws**: WebSocket server implementation

### Real-time Data Integration
- **Indian Railways API**: Live train status, station information, and PNR checking
- **API Endpoints**: `/api/live/train/:trainNumber/status`, `/api/live/station/:stationCode`, `/api/live/pnr/:pnrNumber`
- **Auto-refresh**: Train status updates every 30 seconds, station data every minute
- **Featured Trains**: Real-time tracking of Rajdhani, Shatabdi, and Vande Bharat trains

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class management
- **react-hook-form**: Form state management and validation

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite processes React application into static assets
2. **Backend Build**: esbuild bundles Node.js server with external dependencies
3. **Asset Organization**: Static files served from `/dist/public`
4. **Environment Configuration**: Separate configs for development and production

### Production Setup
- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL table with automatic cleanup
- **Static Assets**: Served directly by Express in production
- **Process Management**: Single Node.js process handling both API and static serving

### Development Environment
- **Hot Reload**: Vite HMR for instant frontend updates
- **API Proxy**: Development server proxies API requests to backend
- **Database Migrations**: Drizzle Kit handles schema changes
- **Error Handling**: Runtime error overlay for development debugging

## Changelog
- June 30, 2025. Initial setup
- June 30, 2025. Integrated Indian Railways API for real-time train and station data
- June 30, 2025. Added live train status tracking with automatic 30-second updates
- June 30, 2025. Implemented PNR status checking and station information modules
- June 30, 2025. Enhanced IRCTC-themed UI with official navy blue and orange colors

## User Preferences

Preferred communication style: Simple, everyday language.