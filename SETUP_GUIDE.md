# Setup & Running Guide - Events App Dashboard

## 📋 Prerequisites

Before running this project, ensure you have:
- **Node.js** 18.x or higher installed
- **npm** or **yarn** package manager
- Access to the backend API (currently hosted at `https://events-app-backend-stage.up.railway.app`)

## 🚀 Quick Start

### 1. Install Dependencies

If you haven't already installed the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Backend API Base URL (Required)
NEXT_PUBLIC_BASE_URL=https://events-app-backend-stage.up.railway.app

# Google Maps API Key (Optional - needed for maps to display)
NEXT_PUBLIC_MAP_API=your_google_maps_api_key_here
```

**Note:** 
- Replace `your_google_maps_api_key_here` with your actual Google Maps API key if you want maps to work
- If you don't have a Google Maps API key, the app will still run but maps won't display (you'll see a message instead)
- The `.env.local` file is already in `.gitignore`, so it won't be committed to git

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The development server will start with **Turbopack** (Next.js's fast bundler) and be available at:

**http://localhost:3000**

### 4. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You will be automatically redirected to the login page (`/login`)
3. Enter your admin credentials to log in
4. After successful login, you'll be redirected to the dashboard (`/dashboard`)

## 📝 Available Scripts

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 Environment Variables Explained

### `NEXT_PUBLIC_BASE_URL` (Required)
- **Purpose**: Backend API base URL
- **Format**: Full URL without trailing slash (e.g., `https://events-app-backend-stage.up.railway.app`)
- **Usage**: Used by hooks to make API calls to the backend
- **Example**: `NEXT_PUBLIC_BASE_URL=https://events-app-backend-stage.up.railway.app`

### `NEXT_PUBLIC_MAP_API` (Optional)
- **Purpose**: Google Maps API key for displaying maps
- **Format**: Your Google Maps API key string
- **Usage**: Used by Google Maps components to load maps
- **Note**: If not provided, maps won't display but the app will still function
- **How to get**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a project or select existing one
  3. Enable Maps JavaScript API
  4. Create credentials (API key)
  5. Copy the API key to `.env.local`

## 🌐 Backend API

The application connects to a backend API. Currently configured to use:
- **Production Backend**: `https://events-app-backend-stage.up.railway.app`

If you're using a different backend URL, update `NEXT_PUBLIC_BASE_URL` in `.env.local`.

### API Routes Structure

Some API routes (like `/api/login`) are proxied through Next.js API routes and hardcoded to the backend. These are located in:
- `src/app/api/login/route.ts`
- `src/app/api/events/route.ts`
- `src/app/api/events/[id]/route.ts`
- etc.

## 🔐 Authentication

- The app uses **cookie-based authentication**
- Login credentials are stored in cookies (token)
- Middleware protects all `/dashboard/*` routes
- If you're not logged in and try to access protected routes, you'll be redirected to `/login`

## 🐛 Troubleshooting

### Port 3000 is already in use

If port 3000 is already in use, you can change it:

```bash
# Edit package.json scripts
"dev": "next dev --turbopack -p 3001"

# Or use environment variable
PORT=3001 npm run dev
```

### Cannot connect to backend API

1. Check that `NEXT_PUBLIC_BASE_URL` is set correctly in `.env.local`
2. Verify the backend API is accessible (try accessing the URL in a browser)
3. Check network connectivity
4. Look at browser console for specific error messages

### Google Maps not displaying

1. Ensure `NEXT_PUBLIC_MAP_API` is set in `.env.local`
2. Verify your Google Maps API key is valid
3. Check that Maps JavaScript API is enabled in Google Cloud Console
4. Check browser console for API errors
5. **Note**: Maps will show a placeholder message if the API key is missing (this is expected)

### Module not found errors

If you see module errors:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## 📁 Project Structure

```
.
├── .env.local              # Environment variables (create this file)
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js configuration
├── middleware.ts           # Authentication middleware
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page (redirects to /login)
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard pages (protected)
│   │   └── api/            # API routes (proxies to backend)
│   ├── components/         # React components and hooks
│   ├── lib/                # Utilities and API endpoints
│   └── types/              # TypeScript types
└── public/                 # Static files
```

## 🎯 Next Steps

1. ✅ Set up `.env.local` with required environment variables
2. ✅ Run `npm install` (if dependencies not installed)
3. ✅ Run `npm run dev` to start development server
4. ✅ Open `http://localhost:3000` in your browser
5. ✅ Log in with admin credentials
6. ✅ Explore the dashboard!

## 💡 Development Tips

- **Hot Reload**: Changes to files will automatically reload in the browser
- **Turbopack**: Faster bundling for better development experience
- **TypeScript**: The project uses TypeScript, so you'll get type checking
- **Dark Mode**: The app supports dark mode (system preference + manual toggle)
- **Console Logs**: Check browser console for API calls and debugging info

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Need Help?** Check the console logs for specific error messages, or refer to the project documentation files in the repository.

