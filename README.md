# Cricket Academy Management App

A comprehensive React Native application for managing cricket academy operations with role-based access for students, coaches, and administrators.

## Features

### 🏏 **Multi-Role Dashboard**
- **Students**: Track progress, view tutorials, mark attendance
- **Coaches**: Manage students, upload content, schedule sessions
- **Admins**: User management, batch creation, analytics

### 📱 **Core Functionality**
- User authentication with OTP
- Real-time data management with API integration
- Attendance tracking with check-in/out
- Content management (video tutorials, drills)
- Batch and session scheduling
- Push notifications
- Analytics and reporting

## API Structure

### **RESTful Endpoints**

#### Authentication
- `POST /api/auth/login` - User login with phone/OTP

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create new batch
- `DELETE /api/batches/:id` - Delete batch

#### Content
- `GET /api/content` - Get all content
- `POST /api/content` - Upload new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

#### Sessions
- `GET /api/sessions` - Get sessions (optional date filter)
- `POST /api/sessions` - Create new session

#### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

#### Attendance
- `GET /api/attendance/:userId` - Get user attendance
- `POST /api/attendance/checkin` - Check in
- `PUT /api/attendance/:id/checkout` - Check out

#### Analytics
- `GET /api/analytics/overview` - Get overview stats
- `GET /api/analytics/revenue` - Get revenue data
- `GET /api/analytics/performers` - Get top performers

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- React Native development environment
- Expo CLI: `npm install -g @expo/cli`

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd cricket-academy-app
   npm install
   ```

2. **Initialize mock data**:
   The app automatically initializes mock data on first run using AsyncStorage.

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   expo start
   ```

4. **Run on device/simulator**:
   - Press `w` for web
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

### Demo Accounts

| Role | Phone | OTP |
|------|-------|-----|
| Student | 9876543210 | 123456 |
| Coach | 9876543211 | 123456 |
| Admin | 9876543212 | 123456 |

## Architecture

### **Data Layer**
- **Mock API**: JSON-based mock data with AsyncStorage persistence
- **API Service**: Centralized service layer with TypeScript interfaces
- **Custom Hooks**: `useApi` and `useApiMutation` for data fetching

### **State Management**
- React Context for authentication
- Local component state with API integration
- AsyncStorage for data persistence

### **UI Components**
- Role-based navigation (drawer + bottom tabs)
- Reusable components with consistent styling
- Loading states and error handling
- Responsive design for all screen sizes

## File Structure

```
├── api/
│   └── mockData.json           # Mock API responses
├── services/
│   └── apiService.ts           # API service layer
├── hooks/
│   └── useApi.ts              # Custom API hooks
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── components/
│   ├── common/                # Reusable components
│   ├── forms/                 # Form components
│   └── dashboards/            # Role-specific dashboards
└── app/
    ├── auth/                  # Authentication screens
    └── (drawer)/              # Main app screens
```

## Key Features Implemented

### ✅ **User Management**
- Add/edit/delete students and coaches
- Role-based permissions
- Profile management with stats

### ✅ **Batch Management**
- Create batches with categories and schedules
- Assign coaches and manage capacity
- Track enrollment and performance

### ✅ **Content Management**
- Upload video tutorials and training drills
- Categorize by skill level and type
- Publish/draft workflow

### ✅ **Session Scheduling**
- Create and manage practice sessions
- Date/time scheduling with location
- Attendance tracking integration

### ✅ **Attendance System**
- Check-in/out functionality
- Calendar view of attendance history
- Real-time status updates

### ✅ **Notifications**
- Push notifications for sessions, feedback, achievements
- Mark as read functionality
- Notification preferences

### ✅ **Analytics Dashboard**
- Revenue tracking and growth metrics
- Student performance analytics
- Batch performance insights

## Error Handling

- **API Errors**: Comprehensive error handling with user-friendly messages
- **Loading States**: Loading indicators for all async operations
- **Retry Functionality**: Retry buttons for failed API calls
- **Form Validation**: Client-side validation with error messages

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Efficient Re-renders**: Optimized state updates
- **Image Optimization**: Compressed images from Pexels

## Future Enhancements

- Real backend API integration
- Push notifications with Firebase
- Offline support with data sync
- Payment integration for fees
- Video streaming capabilities
- Advanced analytics with charts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details