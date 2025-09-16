# StreamLens

A modern, interactive YouTube analytics and viewing platform built with Next.js and TypeScript. StreamLens lets you watch YouTube videos, analyze viewing metrics, and explore trending content—all in a sleek, animated, and responsive interface.

## Features

- **Watch YouTube Videos:** Paste any YouTube URL and watch directly in the app.
- **Animated Auth Pages:** Modern sign-in and sign-up with glassmorphic cards, animated transitions (Framer Motion), and micro-interactions.
- **Social Sign-In:** Google and Apple sign-in buttons (UI-ready, logic can be added).
- **Password Strength & Validation:** Real-time password strength meter and validation feedback.
- **Show/Hide Password:** Toggle password visibility with animation.
- **Metrics Dashboard:** View detailed metrics and analytics for each video session.
- **Trending Videos:** Explore a curated table of top or trending videos.
- **Time Bucket Selector:** Analyze metrics over custom time intervals.
- **Theme Support:** Light and dark mode toggle with system preference detection.
- **Event Management:** Create, read, update, and delete video events with full CRUD operations.
- **Responsive & Accessible UI:** Clean, modern design that works on all devices and is keyboard accessible.
- **Type Safety:** Full TypeScript support for enhanced developer experience and runtime safety.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript with enhanced IDE support
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible, headless UI components
- **SWR** - Data fetching with caching and revalidation
- **React Context** - State management for auth and theme
- **Sonner** - Toast notifications

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```bash
├── public/                # Static assets (SVGs, favicon)
├── src/
│   ├── app/               # Next.js app directory (pages, layouts)
│   │   ├── all-events/    # All events listing page
│   │   ├── sign-in/       # Authentication pages
│   │   ├── sign-up/       
│   │   ├── top/           # Trending videos page
│   │   ├── watch/         # Watch page & metrics
│   │   └── *-event-by-id/ # CRUD operations for events
│   ├── components/        # Reusable UI components
│   │   ├── events/        # Event-related components
│   │   └── ui/            # Base UI components (buttons, cards, etc.)
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useWatchSession.tsx
│   │   └── useYouTubePlayer.tsx
│   ├── lib/               # Utility functions
│   │   ├── apiClient.ts   # API client with authentication
│   │   ├── utils.ts       # General utilities
│   │   └── extractYouTubeInfo.ts
│   └── types/             # TypeScript type definitions
├── components.json        # Shadcn/ui configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.mjs        # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Project documentation
```

## Main Components & Pages

### Pages

- **HomePage:** Main landing page with YouTube URL input and navigation
- **SignInPage & SignUpPage:** Animated authentication forms with social sign-in and validation
- **AllEventsPage:** Browse and search all video events
- **WatchPage:** Watch YouTube videos with real-time metrics tracking
- **TopVideosPage:** View trending videos and analytics

### Components

- **NavBar:** Navigation with theme toggle and user menu
- **YouTubeUrlForm:** Enter and submit YouTube URLs to watch videos
- **AllEventsTable:** Sortable, searchable table of all video events
- **MetricsTable:** Real-time analytics for current video session
- **TopVideoTable:** Trending videos with viewership statistics
- **TimeBucketSelector:** Select time intervals for analytics

### Hooks

- **useAuth:** Authentication state management
- **useTheme:** Theme switching (light/dark mode)
- **useWatchSession:** Video watch session management
- **useYouTubePlayer:** YouTube player integration and control

### Utilities

- **apiClient:** HTTP client with authentication and error handling
- **extractYouTubeInfo:** Parse YouTube URLs and extract video IDs and timestamps

## API Integration

The app integrates with a backend API for:

- User authentication (JWT-based)
- Video event CRUD operations
- Watch session tracking
- Analytics and metrics
- Top videos aggregation

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

## Type Safety

The project uses TypeScript throughout with:

- Strict type checking enabled
- Comprehensive interface definitions
- Type-safe API responses
- Enhanced IDE support with IntelliSense

## Accessibility & Responsiveness

- All pages and components are fully responsive and look great on mobile, tablet, and desktop
- Keyboard navigation and focus states are supported throughout the app
- High-contrast color palette and accessible form validation
- ARIA labels and semantic HTML structure

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Customization

- Update the color palette and themes in `src/app/globals.css`
- Modify component styles using Tailwind CSS utilities
- Add new API endpoints in `src/lib/apiClient.ts`
- Extend type definitions in `src/types/index.ts`
- Configure UI components in `components.json`
