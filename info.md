# Doctor Appointment System

## Overview

This is a full-stack web application for managing doctor appointments built with React, Express, and Firebase. The system allows patients to book appointments with doctors and enables doctors to manage their availability and confirm appointments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom medical theme colors
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Currently using Firebase Firestore for user data and appointments
- **ORM**: Drizzle ORM configured for PostgreSQL (setup for future migration)
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Development**: Hot reload with Vite middleware in development

### Authentication System
- **Provider**: Firebase Authentication
- **User Types**: Patients and Doctors with role-based access control
- **Protected Routes**: Role-based route protection with automatic redirects

## Key Components

### User Management
- **Patient Registration**: Name, email, password, age, gender
- **Doctor Registration**: Name, email, password, specialty
- **Authentication**: Firebase Auth with custom user documents in Firestore
- **Role-based Access**: Separate dashboards and features for patients vs doctors

### Appointment System
- **Time Slot Management**: Doctors can create and delete available time slots
- **Booking Flow**: Patients can view available slots and book appointments
- **Status Management**: Appointments can be pending, confirmed, declined, or completed
- **Real-time Updates**: Firebase subscriptions for live appointment updates

### UI Components
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Notifications**: Custom notification system for user feedback
- **Loading States**: Skeleton loaders and loading indicators throughout the app

## Data Flow

### Authentication Flow
1. User registers/logs in through Firebase Auth
2. Custom user document created/retrieved from Firestore
3. Role-based routing to appropriate dashboard
4. Auth context provides user state throughout the app

### Appointment Booking Flow
1. Doctor creates available time slots
2. Patient browses available doctors and time slots
3. Patient selects slot and creates appointment
4. Doctor receives notification and can confirm/decline
5. Real-time updates notify both parties of status changes

### Data Persistence
- **User Data**: Stored in Firestore with role-specific fields
- **Appointments**: Firestore documents with doctor and patient references
- **Time Slots**: Firestore documents linked to doctor IDs

## External Dependencies

### Firebase Services
- **Authentication**: User registration, login, and session management
- **Firestore**: NoSQL database for user profiles, appointments, and time slots
- **Real-time Updates**: Firestore subscriptions for live data synchronization

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot reload
- **Backend**: Express server with TypeScript compilation via tsx
- **Database**: Firebase Firestore (no local setup required)

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild compiles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend files in production
- **Environment Variables**: Firebase configuration via environment variables

### Database Migration Path
- **Current**: Firebase Firestore for rapid development
- **Future**: Drizzle ORM with PostgreSQL for production scalability
- **Schema**: Already defined in `shared/schema.ts` for easy migration
- **Storage Interface**: Abstracted storage layer allows seamless database switching

The application is designed for easy deployment on platforms like Replit, with environment-based configuration and a single production command that builds and serves the entire application.
