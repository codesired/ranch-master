# Ranch Management System

A comprehensive livestock management, financial tracking, and agricultural operations dashboard designed for modern ranchers.

## 🔥 New Authentication System

This application now uses **Firebase Authentication** instead of Replit Auth, providing:

- **Google Sign-In**: Quick authentication with Google accounts
- **Email/Password**: Traditional email and password authentication
- **Secure**: Firebase handles all authentication security
- **Scalable**: Works across different deployment environments

## 🚀 Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ranch-master
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and set up Google and Email/Password providers
4. Get your Firebase configuration from Project Settings

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your Firebase configuration:

```bash
cp .env.example .env
```

Update the following Firebase variables in your `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_actual_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_actual_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
FIREBASE_APP_ID=your_actual_app_id

# Firebase Admin SDK (for server-side)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your_project_id",...}
```

### 4. Database Setup

Choose your preferred database:

**PostgreSQL (Recommended):**
```env
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/ranch_manager
```

**MySQL:**
```env
DATABASE_TYPE=mysql
DATABASE_URL=mysql://user:password@localhost:3306/ranch_manager
```

**SQLite (Development):**
```env
DATABASE_TYPE=sqlite
SQLITE_FILE=ranch_manager.db
```

### 5. Run Database Migrations

```bash
npm run db:push
```

### 6. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 🔐 Authentication Features

### For Users:
- **Google Sign-In**: Click "Continue with Google" for instant access
- **Email Registration**: Create account with email and password
- **Secure Sessions**: Automatic token refresh and secure logout

### For Developers:
- **Firebase Admin SDK**: Server-side user verification
- **Token-based Auth**: JWT tokens for API authentication
- **User Sync**: Automatic user data synchronization with database
- **Role-based Access**: Admin and user role management

## 📱 Application Features

- **Livestock Management**: Track animals, health records, breeding history
- **Financial Tracking**: Monitor expenses, income, and profitability
- **Inventory Management**: Track feed, supplies, and equipment
- **Document Storage**: Secure cloud-based document management
- **Weather Integration**: Real-time weather data for operations
- **Mobile Responsive**: Works perfectly on all devices

## 🛠 Development

### Project Structure

```
ranch-master/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── ...
├── server/                # Express backend
│   ├── firebaseAuth.ts   # Firebase authentication middleware
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── ...
├── shared/               # Shared types and schemas
└── ...
```

### Key Files Updated:

- `server/firebaseAuth.ts` - New Firebase authentication middleware
- `server/routes.ts` - Updated to use Firebase auth
- `client/src/lib/firebase.ts` - Firebase client configuration
- `client/src/hooks/useAuth.ts` - Updated authentication hook
- `client/src/pages/login.tsx` - New login page with Google and email auth
- `client/src/components/layout/header.tsx` - Updated logout functionality

## 🔧 Configuration Options

### Firebase Authentication Providers

Enable these in your Firebase Console:

1. **Google Provider**:
   - Go to Authentication > Sign-in method
   - Enable Google
   - Add your domain to authorized domains

2. **Email/Password Provider**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password

### Database Configuration

The application supports multiple database types. Update your `.env` file:

```env
# For PostgreSQL
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/ranch_manager

# For MySQL  
DATABASE_TYPE=mysql
DATABASE_URL=mysql://user:password@localhost:3306/ranch_manager

# For SQLite (development only)
DATABASE_TYPE=sqlite
SQLITE_FILE=ranch_manager.db
```

## 🚨 Migration from Replit Auth

If you're migrating from the previous Replit Auth system:

1. **Backup your data** before proceeding
2. **Update environment variables** to use Firebase configuration
3. **Users will need to re-register** with the new authentication system
4. **Admin users** can be configured by updating the user role in the database

## 🔒 Security Features

- **Firebase Security Rules**: Configurable access control
- **Token Verification**: Server-side token validation
- **CORS Protection**: Configured for your domains
- **Rate Limiting**: Built-in API rate limiting
- **Secure Headers**: Security headers for all responses

## 📝 API Documentation

All API endpoints now require Firebase authentication tokens:

```javascript
// Example API call with authentication
const idToken = await firebaseUser.getIdToken();
const response = await fetch('/api/animals', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 🐛 Troubleshooting

### Common Issues:

1. **Firebase Configuration Error**:
   - Verify all Firebase environment variables are set correctly
   - Check that your Firebase project has authentication enabled

2. **Database Connection Error**:
   - Ensure your database is running
   - Verify database URL and credentials

3. **Authentication Not Working**:
   - Check Firebase Console for any configuration issues
   - Verify authorized domains include your development/production domains

### Getting Help:

- Check the browser console for detailed error messages
- Verify Firebase project settings match your configuration
- Ensure all required environment variables are set

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with Firebase Authentication for secure, scalable user management** 🔐