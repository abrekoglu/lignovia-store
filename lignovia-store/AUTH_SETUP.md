# Authentication Setup Guide

This project uses NextAuth.js for authentication with Google OAuth and Credentials providers.

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Admin Access (Optional - comma-separated list of admin emails)
ADMIN_EMAILS=admin@example.com,another@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another@example.com
```

## Generating NEXTAUTH_SECRET

You can generate a secure random string for `NEXTAUTH_SECRET` using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

## Features

- **Google OAuth**: One-click sign-in with Google
- **Credentials Provider**: Email/password registration and login
- **Password Hashing**: Uses bcryptjs for secure password storage
- **Protected Routes**: Admin routes require authentication
- **Admin Access Control**: Optional email-based admin restriction

## User Model

The User model includes:
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password (null for OAuth users)
- `isAdmin`: Boolean flag for admin access

## Protected Routes

- `/admin/orders` - Requires authentication
- `/admin/products` - Requires authentication

If `ADMIN_EMAILS` is set, only those emails (or users with `isAdmin: true`) can access admin routes.


