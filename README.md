# Prompt Portal

A modern, dark-themed AI dashboard for browsing and managing AI prompts. Built with React, TypeScript, and Supabase, featuring a clean, structured interface optimized for productivity and ease of discovery.

## Features

### Dashboard Overview
- **Modern Dark UI**: Charcoal and near-black backgrounds with teal/cyan accent colors
- **Responsive Design**: Clean, minimal SaaS-style interface
- **Premium Aesthetics**: Subtle shadows, rounded corners, and high-contrast typography

### Header & Navigation
- Application logo and branding
- Integrated search bar for prompt discovery
- Prominent "Create" button for new prompts
- User avatar/profile indicator
- Minimal design with soft shadows

### Hero Section
- Large headline: "Find the Perfect Prompt"
- Supporting subtext explaining the platform's purpose
- Establishes primary action: discovery and browsing

### Filters & Categories
- Horizontal pill-shaped filter buttons
- Categories: All, Abstract, Ads, Architecture, Cyberpunk, Fantasy, Nature, Portrait, Products, Public, UI
- Visual highlighting for selected categories
- Lightweight, interactive design

### Content Grid
- Responsive card-based layout
- Each card features:
  - Large thumbnail image
  - Title and description
  - Metadata tags (App/source, Content type)
  - Rounded corners and soft shadows
- Hover-ready design for interactivity
- Optimized for scanning and comparison

### Content Controls
- Status indicator showing current prompt count
- Dropdown filters for sorting and refining results
- Context-aware controls without visual distraction

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Custom component library with shadcn/ui
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **Image Management**: ImageKit integration
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Linting**: ESLint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/johndoetechguy/promptportal.git
cd promptportal
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase and ImageKit credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

4. Start the development server:
```bash
bun run dev
```

## Usage

### Development
```bash
bun run dev
```

### Build for Production
```bash
bun run build
```

### Preview Production Build
```bash
bun run preview
```

### Linting
```bash
bun run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── CategoryFilter.tsx
│   ├── PromptCard.tsx
│   └── ...
├── contexts/           # React contexts (Auth, etc.)
├── data/               # Static data and constants
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Page components
└── types/              # TypeScript type definitions

supabase/
├── config.toml         # Supabase configuration
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) for the component library
- Powered by [Supabase](https://supabase.com/) for backend services
- Image management by [ImageKit](https://imagekit.io/)
