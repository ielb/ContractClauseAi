# ContractClauseAI Frontend

A modern, responsive web application built with Next.js 15, TypeScript, and shadcn/ui components for AI-powered contract analysis.

## Features

- **Modern Stack**: Next.js 15 with App Router, React 19, TypeScript 5
- **Beautiful UI**: shadcn/ui components with Tailwind CSS v4
- **Responsive Design**: Mobile-first approach with dark mode support
- **Performance**: Turbopack for fast development builds
- **Type Safety**: Full TypeScript integration

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint for code quality

## Project Structure

```
src/
├── app/                 # App Router pages
│   ├── dashboard/       # Dashboard page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/
│   └── ui/              # shadcn/ui components
├── config/
│   └── env.ts           # Environment configuration
└── lib/
    └── utils.ts         # Utility functions
```

## Key Pages

- **Homepage** (`/`) - Landing page with features and CTA
- **Dashboard** (`/dashboard`) - Contract management interface

## UI Components

The application uses shadcn/ui components including:

- Button, Card, Badge, Progress
- Table, Dialog, Sheet, Alert
- Input, Label, Textarea, Select
- Navigation Menu, Dropdown Menu

## Configuration

Environment variables are managed through:

- `.env.local` for local development
- `src/config/env.ts` for typed configuration

## Development

This project follows modern React and Next.js best practices:

- App Router for routing
- Server and Client Components
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality

## Backend Integration

The frontend is designed to work with the ContractClauseAI backend API:

- API base URL: `http://localhost:3001/api`
- File upload support for PDF, DOC, DOCX, and images
- Real-time contract analysis status updates

## Deployment

The application is configured for deployment on Vercel, Netlify, or any platform supporting Next.js applications.

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new code
3. Ensure responsive design across all screen sizes
4. Test components in both light and dark modes
