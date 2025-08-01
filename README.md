# StreamLens

A modern, interactive YouTube analytics and viewing platform built with Next.js. StreamLens lets you watch YouTube videos, analyze viewing metrics, and explore trending content—all in a sleek, animated, and responsive interface.

## Features

- **Watch YouTube Videos:** Paste any YouTube URL and watch directly in the app.
- **Animated Auth Pages:** Modern sign-in and sign-up with glassmorphic cards, animated transitions (Framer Motion), and micro-interactions.
- **Social Sign-In:** Google and Apple sign-in buttons (UI-ready, logic can be added).
- **Password Strength & Validation:** Real-time password strength meter and validation feedback.
- **Show/Hide Password:** Toggle password visibility with animation.
- **Metrics Dashboard:** View detailed metrics and analytics for each video session.
- **Trending Videos:** Explore a curated table of top or trending videos.
- **Time Bucket Selector:** Analyze metrics over custom time intervals.
- **Responsive & Accessible UI:** Clean, modern design that works on all devices and is keyboard accessible.
- **Modern Color Palette:** Animated gradient backgrounds and glassmorphic UI.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.js`. The page auto-updates as you edit the file.

## Folder Structure

```bash
├── public/                # Static assets (SVGs, favicon)
├── src/
│   ├── app/               # Next.js app directory (pages, layouts)
│   │   ├── top/           # Trending videos page & table
│   │   └── watch/         # Watch page & metrics table
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions (e.g., YouTube info extraction)
├── package.json           # Project metadata & dependencies
├── next.config.mjs        # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
├── jsconfig.json          # JS project config
└── README.md              # Project documentation
```

## Main Components & Pages

- **SignInPage & SignUpPage:** Animated, glassmorphic authentication forms with social sign-in, validation, and micro-interactions.
- **YouTubeUrlForm:** Enter and submit YouTube URLs to watch videos.
- **TimeBucketSelector:** Select time intervals for analytics.
- **topVideoTable:** Displays a table of trending/top videos.
- **metricsTable:** Shows analytics and metrics for the current video session.
- **useWatchSession:** Custom hook for managing video watch sessions.
- **useYouTubePlayer:** Custom hook for embedding and controlling the YouTube player.
- **extractYouTubeInfo:** Utility for parsing YouTube URLs and extracting video IDs.

## Dependencies

- **framer-motion:** For smooth, declarative animations and transitions.
- **react-icons:** For modern, scalable iconography (Google, Apple, etc.).
- **Tailwind CSS:** Utility-first CSS framework for rapid, responsive styling.
- **Next.js:** React framework for server-side rendering and routing.

## Accessibility & Responsiveness

- All pages and components are fully responsive and look great on mobile, tablet, and desktop.
- Keyboard navigation and focus states are supported throughout the app.
- High-contrast color palette and accessible form validation.

## Customization

- You can easily update the color palette, gradients, and card styles in `src/app/globals.css`.
- To enable real social sign-in, connect the Google/Apple buttons to your authentication provider of choice.
