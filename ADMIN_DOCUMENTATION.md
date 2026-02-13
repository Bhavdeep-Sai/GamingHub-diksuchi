# Admin System Documentation

## Overview
The GamingHub admin system provides comprehensive administrative control over the platform, including game management, avatar management, and user management.

## Features

### 1. **Dashboard** (`/admin`)
- Real-time statistics overview
- Total users, games, avatars
- Active games and sessions
- Recent user registrations
- System health status
- Quick action shortcuts

### 2. **Game Management** (`/admin/games`)
Control all aspects of games displayed on the platform:

#### Features:
- **Show/Hide in Dashboard**: Control which games appear on the main dashboard
- **Featured Games**: Mark games as featured for prominent display
- **Coming Soon**: Tag games that are in development
- **Newly Launched**: Highlight recently released games
- **Display Order**: Control the order games appear in lists
- **Active/Inactive**: Enable or disable games entirely
- **Media Management**: Set thumbnail and banner images
- **Game Details**: Edit descriptions and metadata

#### Fields:
- `isActive`: Whether the game is available
- `showInDashboard`: Display on main dashboard
- `isFeatured`: Featured game badge
- `isComingSoon`: Coming soon badge
- `isNewlyLaunched`: New launch badge
- `displayOrder`: Sort order (lower = higher priority)
- `thumbnailUrl`: Game thumbnail image
- `bannerUrl`: Game banner image
- `description`: Game description

### 3. **Avatar Management** (`/admin/avatars`)
Manage user avatars available for selection:

#### Features:
- Create new avatars
- Edit existing avatars
- Delete avatars
- Set premium avatars
- Organize by categories
- Control display order
- Activate/deactivate avatars

#### Fields:
- `name`: Avatar name
- `url`: Avatar image URL
- `category`: Avatar category (animals, fantasy, space, etc.)
- `isActive`: Whether avatar is available for selection
- `isPremium`: Premium avatar (future use)
- `displayOrder`: Sort order

### 4. **User Management** (`/admin/users`)
Comprehensive user administration:

#### Features:
- View all users with pagination
- Search by email, username, or name
- Filter by role (admin/user)
- Edit user details
- Change user roles
- Modify user stats (level, rank)
- Delete user accounts
- View user activity

#### Editable Fields:
- `name`: User's display name
- `username`: User's username
- `role`: User role (user/admin)
- `rank`: User rank (Beginner, Intermediate, Advanced, Expert, Master)
- `level`: User level

## API Routes

All admin routes require authentication and admin role.

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Games
- `GET /api/admin/games` - List all games
- `POST /api/admin/games` - Create new game
- `GET /api/admin/games/[id]` - Get single game
- `PATCH /api/admin/games/[id]` - Update game
- `DELETE /api/admin/games/[id]` - Delete game

### Avatars
- `GET /api/admin/avatars` - List all avatars
- `POST /api/admin/avatars` - Create new avatar
- `GET /api/admin/avatars/[id]` - Get single avatar
- `PATCH /api/admin/avatars/[id]` - Update avatar
- `DELETE /api/admin/avatars/[id]` - Delete avatar

### Users
- `GET /api/admin/users` - List users (with pagination, search, filters)
- `GET /api/admin/users/[id]` - Get single user with details
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Database Schema Updates

### User Model
Added `role` field:
```prisma
role String @default("user") // user, admin
```

### Game Model
Added admin control fields:
```prisma
showInDashboard Boolean @default(true)
isFeatured      Boolean @default(false)
isComingSoon    Boolean @default(false)
isNewlyLaunched Boolean @default(false)
displayOrder    Int     @default(0)
thumbnailUrl    String?
bannerUrl       String?
```

### Avatar Model (New)
```prisma
model Avatar {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String   @unique
  url          String
  category     String?
  isActive     Boolean  @default(true)
  isPremium    Boolean  @default(false)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Setup Instructions

### 1. Push Database Changes
```bash
npm run db:push
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Create Admin User
To promote a user to admin:
```bash
npm run make-admin <user-email>
```

Example:
```bash
npm run make-admin admin@example.com
```

### 4. Access Admin Panel
1. Sign in with your admin account
2. Click the "Admin" link in the navigation bar
3. Navigate to `/admin` directly

## Security

### Authentication
- All admin routes check for valid session
- Admin role verification on every request
- 403 Forbidden for non-admin users

### Authorization Middleware
Located in `lib/admin.ts`:
- `isAdmin()`: Check if user is admin
- `requireAdmin()`: Middleware to protect admin routes

### Session Management
- Admin role stored in JWT token
- Role checked on every page load
- Fresh role data fetched from database

## UI Components

### Admin Layout (`app/admin/layout.tsx`)
- Sidebar navigation
- Active page highlighting
- Quick access to all admin sections
- Return to main site link

### Page Components
- **Dashboard**: Real-time stats with cards
- **Games**: Table view with inline editing
- **Avatars**: Grid view with image previews
- **Users**: Table with pagination and filters

### Modals
- Edit game modal
- Edit/Create avatar modal
- Edit user modal

## Best Practices

1. **Regular Backups**: Always backup before bulk operations
2. **Test Changes**: Use staging environment for major changes
3. **Monitor Stats**: Check dashboard regularly for anomalies
4. **User Communication**: Notify users before making games unavailable
5. **Audit Trail**: Consider implementing logging for admin actions

## Future Enhancements

- [ ] Activity logs for admin actions
- [ ] Bulk operations (e.g., bulk avatar upload)
- [ ] Analytics dashboard with charts
- [ ] Email notifications for admin events
- [ ] Role-based permissions (super admin, moderator, etc.)
- [ ] Game analytics per game
- [ ] User behavior insights
- [ ] Automated reports

## Troubleshooting

### Issue: Can't access admin panel
**Solution**: Check if user has admin role using Prisma Studio or make-admin script

### Issue: Changes not reflecting
**Solution**: Clear browser cache and refresh. Check if database was updated.

### Issue: 403 Forbidden
**Solution**: Ensure user is logged in and has admin role. Check auth middleware.

### Issue: Images not loading
**Solution**: Verify image URLs are accessible and properly formatted (https://)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check database schema matches expectations
4. Verify all migrations are applied

---

**Last Updated**: February 2026
**Version**: 1.0.0
