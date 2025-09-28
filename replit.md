# StorageMap

## Overview

A mobile-first progressive web application that helps users take control of their storage. StorageMap lets users link their devices and cloud accounts to see all their files in one place, then optimize and cut their storage costs automatically across multiple providers (Google Drive, Dropbox, OneDrive, iCloud, and local storage). The app features an intelligent onboarding system that customizes the user experience based on technical familiarity and goals, providing tailored views for file management, cost optimization, and automated planning recommendations.

The application operates in simulation mode with mock data to demonstrate functionality without requiring real provider credentials or making actual changes to user files.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library following Material Design principles
- **State Management**: Context-based simulation state with React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Progressive Web App (PWA) with bottom navigation, safe-area insets, and touch-optimized interactions

### Component Structure
- **Onboarding System**: Two-question flow determining user familiarity (easy/standard/pro) and goals (view/suggest/plan)
- **Adaptive UI**: Dynamic navigation order and feature density based on onboarding responses
- **View Components**: Map overview, duplicates analysis, cost breakdown, optimization actions, and diagnostics panels
- **Simulation Components**: Mock data visualization with treemaps, cost tiles, and recommendation cards

### Data Architecture
- **Schema**: Normalized file records with provider, path, size, hash, and metadata fields
- **Mock Data Sources**: JSON files simulating realistic file inventories with duplicates and varied access patterns
- **Analysis Engine**: Client-side duplicate detection, cost calculation, and optimization recommendation generation
- **Pricing Model**: YAML configuration for provider cost structures with clear simulation labeling

### Backend Architecture
- **Server**: Express.js with TypeScript serving the React application
- **Database**: Drizzle ORM with PostgreSQL schema (configured but unused in simulation mode)
- **Storage Interface**: In-memory storage implementation for user session data
- **API Structure**: RESTful endpoints prepared for future provider integrations

### Simulation Features
- **Offline Operation**: Complete functionality without network calls using bundled mock data
- **Cost Optimization**: Duplicate removal, cold storage migration, and consolidation recommendations
- **Risk Assessment**: Friction scoring (low/medium/high) for proposed changes with simulation-only warnings
- **Export Capabilities**: CSV reports and JSON data export for analysis

### Accessibility & Performance
- **WCAG 2.2 AA Compliance**: Screen reader support, keyboard navigation, and color-blind safe palette
- **Mobile Optimization**: 44px minimum touch targets, system fonts, and haptic feedback simulation
- **Performance Budget**: Sub-2.5s TTI on mid-tier devices with lazy loading and optimized bundles
- **Progressive Enhancement**: Graceful degradation with table fallbacks for charts and visualizations

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Data fetching and caching layer for future API integrations
- **drizzle-orm & @neondatabase/serverless**: Database ORM and PostgreSQL connection (prepared for production)
- **wouter**: Lightweight routing library for single-page application navigation

### UI Component Libraries
- **@radix-ui/***: Accessible primitive components for modals, dropdowns, navigation, and form controls
- **class-variance-authority & clsx**: Utility-first styling with component variants
- **tailwindcss**: CSS framework for responsive design and design system implementation
- **lucide-react**: Icon library for consistent iconography

### Development & Build Tools
- **vite**: Build tool and development server with hot module replacement
- **typescript**: Type system for enhanced developer experience and code reliability
- **esbuild**: Fast JavaScript bundler for production builds

### Simulation Data Processing
- **yaml**: Configuration parsing for provider pricing and optimization rules
- **date-fns**: Date manipulation for file age analysis and cold storage recommendations

### Authentication (Prepared)
- **@microsoft/microsoft-graph-client**: Microsoft Graph API integration for OneDrive (configured for future use)
- **connect-pg-simple**: PostgreSQL session store for user authentication sessions

### Utility Libraries
- **nanoid**: Unique ID generation for simulation data and session management
- **@hookform/resolvers & react-hook-form**: Form validation and management
- **cmdk**: Command palette component for power user features