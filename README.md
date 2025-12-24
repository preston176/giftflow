# GiftFlow - Holiday Budget & Wishlist Tracker

A premium, scalable SaaS application for tracking holiday budgets and managing gift wishlists. Built with modern technologies for production-ready performance.

## Features

- **Budget Tracking**: Set and monitor your total holiday budget with real-time progress tracking
- **Gift Management**: Add, edit, and organize gifts with details like price, recipient, priority, and notes
- **Savings Alerts**: Automatically highlights gifts where current price is below target price
- **Shareable Wishlists**: Generate secure, shareable links for family and friends to view your wishlist
- **Priority System**: Organize gifts by low, medium, or high priority
- **Dark Mode UI**: Clean, premium dark-mode interface built with Tailwind CSS and Shadcn/UI
- **Secure Authentication**: Enterprise-grade authentication powered by Clerk
- **Real-time Updates**: Instant UI updates after any action using Next.js Server Actions

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Deployment Ready**: Optimized for Vercel deployment

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Clerk account ([clerk.com](https://clerk.com))
- A Neon database ([neon.tech](https://neon.tech))

## Getting Started

### 1. Clone and Install

```bash
cd holiday-budget-tracker
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Getting Clerk Keys:

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Navigate to **API Keys** in your Clerk dashboard
3. Copy the **Publishable Key** and **Secret Key**
4. Paste them into your `.env` file

#### Getting Neon Database URL:

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Navigate to your project dashboard
3. Copy the connection string (it should look like: `postgresql://user:password@host/dbname?sslmode=require`)
4. Paste it into your `.env` file as `DATABASE_URL`

### 3. Set Up Database

Generate and push the database schema:

```bash
npm run db:push
```

This will create all necessary tables (`profiles`, `gifts`, `share_tokens`) in your Neon database.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Available Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (recommended for development)
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (visual database browser)

### Database Schema

**profiles**
- Stores user profile information linked to Clerk user ID
- Fields: id, clerkUserId, email, name, imageUrl, totalBudget, timestamps

**gifts**
- Stores gift information for each user
- Fields: id, userId, name, url, imageUrl, targetPrice, currentPrice, recipientName, isPurchased, priority, notes, timestamps

**share_tokens**
- Stores shareable token links for wishlists
- Fields: id, userId, token, isActive, createdAt

## Project Structure

```
holiday-budget-tracker/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Main dashboard page
│   ├── share/[token]/       # Public shareable wishlist
│   ├── sign-in/             # Clerk sign-in page
│   ├── sign-up/             # Clerk sign-up page
│   └── layout.tsx           # Root layout with Clerk provider
├── actions/                 # Server Actions
│   ├── gift-actions.ts     # Gift CRUD operations
│   ├── profile-actions.ts  # User profile management
│   └── share-actions.ts    # Share token management
├── components/              # React components
│   ├── ui/                 # Shadcn/UI components
│   ├── header.tsx          # App header with navigation
│   ├── gift-card.tsx       # Gift display card
│   ├── add-gift-dialog.tsx # Add gift modal
│   └── ...
├── db/                      # Database configuration
│   ├── schema.ts           # Drizzle ORM schema
│   └── index.ts            # Database connection
└── lib/                     # Utility functions
    ├── utils.ts            # Helper functions
    └── auth.ts             # Authentication helpers
```

## Key Features Explained

### Budget Progress Tracking

The dashboard displays:
- Total budget vs. total spent
- Visual progress bar
- Remaining budget or overage alert
- Ability to update budget in real-time

### Savings Alerts

Automatically highlights gifts where:
- `currentPrice < targetPrice`
- Gift is not yet purchased
- Shows total savings opportunity

### Shareable Wishlists

- Generate a unique, secure token for sharing
- Share links show only unpurchased items
- Token regeneration invalidates old links
- No authentication required for viewers
- Includes CTA for viewers to create their own wishlist

### Priority System

Three levels:
- **High**: Red border, urgent/important gifts
- **Medium**: Yellow border, standard gifts
- **Low**: Blue border, nice-to-have items

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Update `NEXT_PUBLIC_APP_URL` to your production URL:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Security Considerations

- All routes except `/share/*`, `/sign-in`, and `/sign-up` require authentication
- Share tokens use cryptographically secure random generation
- User IDs are never exposed in public URLs
- Server Actions validate user ownership before mutations
- Database uses cascade deletes to maintain referential integrity

## Future Enhancements

Planned features for future releases:

1. **Automated Price Tracking**
   - Integration with price tracking APIs
   - Webhook support for price drop notifications
   - Email alerts for savings opportunities

2. **Multi-List Support**
   - Create multiple wishlists (Christmas, Birthday, etc.)
   - Different budgets per list

3. **Collaboration Features**
   - Mark gifts as "claimed" by family members
   - Private notes visible only to gifters

4. **Analytics**
   - Spending trends over time
   - Category-based budgeting
   - Year-over-year comparisons

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
