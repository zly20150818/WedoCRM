# Next.js Base Template with Supabase Authentication

This is a clean, production-ready base template for building web applications with Next.js 15, Supabase authentication, and a modern UI.

## Features

### Core Features
- ✅ **Supabase Authentication** - Complete auth flow with login, register, and session management
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Responsive Layout** - Collapsible sidebar and header with mobile support
- ✅ **Theme Support** - Light/Dark mode with system preference detection
- ✅ **English UI** - Clean English interface, no i18n complexity
- ✅ **User Profile Management** - Basic profile page with editable fields
- ✅ **Settings Page** - Comprehensive settings UI with multiple tabs
- ✅ **Modern UI Components** - Built with shadcn/ui and Radix UI

### Important Notes
- ⚠️ **No Internationalization** - This template uses English only for simplicity. If you need multi-language support, you'll need to add it yourself.
- ⚠️ **Clean & Simple** - Focused on core functionality without business logic.

### Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm
- Supabase account (free tier is fine)

### Installation

1. **Clone or download this template**

```bash
git clone <your-repo-url>
cd <your-project>
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up Supabase**

Create a new project in [Supabase Dashboard](https://app.supabase.com/).

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

5. **Set up the database**

Run the following SQL in your Supabase SQL editor to create the profiles table:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'User',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

6. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### First Steps After Installation

1. Go to `/register` to create a new account
2. Check your Supabase Auth dashboard to verify the user was created
3. Log in with your credentials
4. Explore the dashboard, profile, and settings pages

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── dashboard/           # Main dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── profile/            # User profile page
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page (redirects to login/dashboard)
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── layout/             
│   │   └── main-layout.tsx # Main layout with sidebar and header
│   ├── ui/                 # shadcn/ui components
│   ├── auth-provider.tsx   # Authentication context
│   ├── header.tsx          # Header component
│   ├── sidebar.tsx         # Sidebar navigation
│   ├── language-provider.tsx # Language/i18n context
│   └── theme-provider.tsx  # Theme context
├── lib/                     # Utility functions
│   ├── supabase/           
│   │   ├── client.ts       # Supabase client for client components
│   │   ├── server.ts       # Supabase client for server components
│   │   ├── middleware.ts   # Supabase middleware utilities
│   │   └── types.ts        # Database types
│   └── utils.ts            # Common utilities
├── middleware.ts            # Next.js middleware for auth
└── tailwind.config.ts      # Tailwind configuration
```

## Key Components

### Authentication Provider (`components/auth-provider.tsx`)

Manages authentication state and provides login/register/logout functions:

```tsx
const { user, login, register, logout, isLoading, isAuthenticated } = useAuth()
```

### Main Layout (`components/layout/main-layout.tsx`)

Wraps authenticated pages with sidebar and header:

```tsx
import { MainLayout } from "@/components/layout/main-layout"

export default function YourPage() {
  return (
    <MainLayout>
      <div>Your content here</div>
    </MainLayout>
  )
}
```

### Language Provider (`components/language-provider.tsx`)

Provides internationalization:

```tsx
const { language, setLanguage, t } = useLanguage()
// Use t() to translate keys
<h1>{t("dashboard.title")}</h1>
```

## Adding New Pages

1. Create a new directory in `app/` for your page
2. Add a `page.tsx` file
3. Wrap your content with `MainLayout` if it needs authentication
4. Add navigation link to `components/sidebar.tsx` if needed

Example:

```tsx
// app/my-page/page.tsx
"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function MyPage() {
  return (
    <MainLayout>
      <h1>My New Page</h1>
    </MainLayout>
  )
}
```

## Customization

### Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... other colors */
}
```

### Adding Translations

Edit `components/language-provider.tsx`:

```tsx
const translations = {
  en: {
    "your.key": "Your English text",
  },
  zh: {
    "your.key": "您的中文文本",
  },
}
```

### Sidebar Menu Items

Edit `components/sidebar.tsx`:

```tsx
const menuItems = [
  {
    title: "nav.yourPage",
    href: "/your-page",
    icon: YourIcon,
  },
]
```

## Database Schema

The template includes a basic `profiles` table. You can extend it or add new tables as needed.

### Extending the Profiles Table

```sql
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN address TEXT;
```

Don't forget to update the TypeScript types in `lib/supabase/types.ts`.

## Authentication Flow

1. User visits a protected route
2. Middleware checks for valid session
3. If no session, redirect to `/login`
4. After login, user is redirected to `/dashboard`
5. Session is maintained across page refreshes
6. Logout clears session and redirects to `/login`

## Security Considerations

- Row Level Security (RLS) is enabled on the profiles table
- Users can only read and update their own profile
- Authentication tokens are stored in HTTP-only cookies
- Middleware validates sessions on every request

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Make sure to:
- Set environment variables
- Configure build command: `npm run build`
- Configure start command: `npm run start`
- Set Node.js version to 18+

## Troubleshooting

### "Supabase configuration not found"
- Check that `.env.local` exists and has correct values
- Restart the development server after adding env variables

### Authentication not working
- Verify Supabase URL and anon key are correct
- Check Supabase dashboard for auth errors
- Ensure the profiles table and trigger are created

### Database errors
- Run the SQL setup script in Supabase SQL editor
- Check RLS policies are enabled
- Verify table permissions

## License

MIT License - feel free to use this template for any project.

## Support

For issues and questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the code comments for implementation details

---

Built with ❤️ using Next.js and Supabase

