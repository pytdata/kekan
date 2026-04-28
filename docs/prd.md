# Requirements Document

## 1. Application Overview

**Application Name**: KENKAN BOOKS APP

**Description**: A digital storytelling platform for kids that combines reading experience with streaming experience. Users can read illustrated digital books (EPUB format) and watch animated story adaptations (MP4/WEBP format). The platform features kid-friendly UI/UX with playful design, colorful interface, large buttons, and easy navigation.

**Core Value**: Provide children with an engaging dual-mode content consumption experience — reading digital books and watching animated adaptations on a single platform.

---

## 2. Users and Usage Scenarios

**Target Users**: Children (primary users) and their parents/guardians (account managers)

**Core Usage Scenarios**:
- Children browse and discover books/videos by categories
- Children read digital books with progress tracking
- Children watch animated story videos with resume capability
- Parents manage subscriptions and payment via Paystack
- Administrators upload content and manage platform via web dashboard at `/admin`

---

## 3. Page Structure and Functionality

### 3.1 Page Hierarchy

```
KENKAN BOOKS APP
├── Authentication Flow
│   ├── Login Page
│   ├── Register Page
│   └── Password Reset Page
├── Main App (Bottom Navigation)
│   ├── Home Screen
│   ├── Browse/Discover Screen
│   ├── Search Screen
│   └── Profile Screen
├── Content Consumption
│   ├── Digital Reader
│   └── Video Player
├── Subscription/Premium
│   └── Subscription Plans Page
└── Admin Dashboard (Web Route: /admin)
    ├── Content Management
    │   ├── Upload Books
    │   ├── Upload Videos
    │   └── Manage Categories
    ├── User Management
    ├── Subscription Management
    ├── Payment/Transaction Management
    └── Analytics Dashboard
```

### 3.2 Authentication Flow

#### 3.2.1 Login Page
- Support three authentication methods:
  + Google OAuth
  + Apple ID OAuth
  + Email + Password with OTP email verification
- Display login form with large, kid-friendly buttons
- Link to Register Page and Password Reset Page

#### 3.2.2 Register Page
- Support three registration methods:
  + Google OAuth
  + Apple ID OAuth
  + Email + Password (send OTP to email for verification)
- Collect user information: email, name, password (if applicable)
- Allow avatar upload via camera or gallery
- OTP verification flow: user enters OTP received via email to complete registration

#### 3.2.3 Password Reset Page
- User enters registered email
- System sends OTP to email
- User enters OTP and sets new password

### 3.3 Main App (Bottom Navigation)

#### 3.3.1 Home Screen
- Display sections:
  + Featured books and videos (large cards with cover art/thumbnails)
  + Continue Reading/Watching (resume where left off with progress indicators)
  + New Releases
  + Personalized Recommendations
- Use bright colors, rounded corners, large touch targets
- Tap on book/video card navigates to Digital Reader or Video Player

#### 3.3.2 Browse/Discover Screen
- Display horizontal scrolling rows grouped by categories (e.g., Adventure, Fairy Tales, Educational)
- Category tabs at top for quick filtering
- Each row shows book covers or video thumbnails
- Tap on item navigates to Digital Reader or Video Player

#### 3.3.3 Search Screen
- Search input field with large, kid-friendly design
- Search books and videos by title or category
- Display search results as grid or list with cover art/thumbnails
- Tap on result navigates to Digital Reader or Video Player

#### 3.3.4 Profile Screen
- Display user avatar, name, email
- Show subscription status (Free or Premium)
- Link to Subscription Plans Page
- Logout button

### 3.4 Content Consumption

#### 3.4.1 Digital Reader
- Render EPUB files with pagination or chapter navigation
- Controls:
  + Font size adjustment
  + Day/Night mode toggle
  + Bookmark current position
  + Chapter navigation (previous/next)
- Automatically save reading progress (book ID, chapter index, scroll position, percent complete) to backend
- Resume reading from last saved position when reopening book

#### 3.4.2 Video Player
- Play MP4/WEBP animated story videos
- Full-screen player with controls:
  + Play/Pause
  + Seek bar
  + Volume control
  + Progress indicator
- Automatically save watch progress (video ID, current time, percent complete) to backend
- Resume video from last saved position when reopening video

### 3.5 Subscription/Premium

#### 3.5.1 Subscription Plans Page
- Display subscription tiers with pricing and features
- Use Paystack inline JS for payment processing
- After successful payment, update user subscription status in backend
- Gate premium content: show lock icon or prompt for non-premium users attempting to access premium books/videos

### 3.6 Admin Dashboard (Web Route: /admin)

**Important**: Admin dashboard is accessible only via web route `/admin`. No admin button or link is shown in the mobile app UI.

#### 3.6.1 Content Management

**Upload Books**:
- Form fields: title, description, cover image (upload), EPUB file (upload), category (dropdown), price, isPremium (checkbox), author, publishedAt (date picker)
- File upload restrictions: only EPUB format allowed for books
- Submit to create new book entry in database

**Upload Videos**:
- Form fields: title, description, thumbnail (upload), video file (upload), category (dropdown), price, isPremium (checkbox), duration, relatedBookId (optional, dropdown)
- File upload restrictions: only MP4/WEBP formats allowed for videos
- Submit to create new video entry in database

**Manage Categories**:
- Create new category: name, slug, description, icon, color
- Edit or delete existing categories
- Display categories list with edit/delete actions

#### 3.6.2 User Management
- Display all users in table format
- Columns: id, email, name, avatar, authProvider, role, createdAt
- Support search and filter by role or authProvider

#### 3.6.3 Subscription Management
- Display all subscriptions in table format
- Columns: id, userId, plan, status, amount, paystackReference, startDate, endDate, createdAt
- Support filter by status (active, expired, cancelled)

#### 3.6.4 Payment/Transaction Management
- Display all payments in table format
- Columns: id, userId, subscriptionId, amount, status, paystackReference, createdAt
- Support filter by status (success, pending, failed)

#### 3.6.5 Analytics Dashboard
- Summary Cards:
  + Total Users
  + Total Revenue
  + Active Subscriptions
  + Total Books
  + Total Videos
- Pie Charts: subscription plan distribution, content category distribution
- Bar Graphs: monthly revenue, new users per month
- Line Charts: user growth over time, revenue growth over time

---

## 4. Business Rules and Logic

### 4.1 Authentication and Authorization
- Users can register/login via Google OAuth, Apple ID OAuth, or Email+Password with OTP email verification
- OTP expires after a defined time period (e.g., 10 minutes)
- JWT tokens are used for session management
- Admin role users can access `/admin` route; regular users cannot

### 4.2 Content Access Control
- Free users can access non-premium books and videos
- Premium users (with active subscription) can access all content including premium books and videos
- When non-premium user attempts to access premium content, display subscription prompt

### 4.3 Progress Tracking and Resume
- Reading progress is saved automatically when user navigates away from Digital Reader or closes app
- Watch progress is saved automatically at regular intervals (e.g., every 5 seconds) and when user pauses or exits Video Player
- When user reopens a book or video, system retrieves last saved progress and resumes from that position

### 4.4 Subscription and Payment
- Subscription plans have defined tiers (e.g., Monthly, Yearly) with corresponding prices
- Payment is processed via Paystack inline JS
- Upon successful payment, subscription record is created with status \"active\", startDate (current date), and endDate (calculated based on plan duration)
- Subscription status is checked before granting access to premium content
- Expired subscriptions automatically change status to \"expired\"

### 4.5 Admin Content Management
- Admin can only upload EPUB files for books and MP4/WEBP files for videos
- Each book/video must be assigned to a category
- Admin can set individual prices for books/videos or mark them as premium (requiring subscription)
- Videos can optionally be linked to a related book via relatedBookId

### 4.6 Recommendations and Personalization
- Personalized recommendations are generated based on user's reading/watching history and category preferences
- Continue Reading/Watching section displays items with saved progress (percent complete > 0 and < 100)

---

## 5. Exception and Boundary Cases

| Scenario | Handling |
|----------|----------|
| User enters invalid OTP during registration/password reset | Display error message \"Invalid or expired OTP. Please try again.\" |
| User attempts to access premium content without active subscription | Display subscription prompt with link to Subscription Plans Page |
| EPUB file fails to render in Digital Reader | Display error message \"Unable to load book. Please try again later.\" |
| Video file fails to play in Video Player | Display error message \"Unable to play video. Please check your connection.\" |
| Payment via Paystack fails | Display error message \"Payment failed. Please try again.\" and do not create subscription record |
| Admin uploads file in unsupported format | Display error message \"Invalid file format. Only EPUB allowed for books, MP4/WEBP for videos.\" |
| User loses internet connection while reading/watching | Progress is saved locally and synced to backend when connection is restored |
| Subscription expires while user is accessing premium content | User can continue current session but will be prompted to renew subscription on next access |
| Admin attempts to delete category with associated books/videos | Display warning \"Cannot delete category with existing content. Please reassign or delete content first.\" |
| Non-admin user attempts to access `/admin` route | Redirect to login page or display \"Access Denied\" message |

---

## 6. Acceptance Criteria

1. User registers via Email+Password, receives OTP via email, enters OTP to complete registration
2. User logs in and lands on Home Screen showing featured books, continue reading/watching, new releases, and recommendations
3. User taps on a book card, Digital Reader opens and renders EPUB file with pagination and controls (font size, day/night mode, bookmark)
4. User reads several pages, exits Digital Reader, reading progress is saved to backend
5. User reopens the same book, Digital Reader resumes from last saved position
6. User navigates to Browse/Discover Screen, selects a category, taps on a video thumbnail
7. Video Player opens and plays MP4/WEBP video with full-screen controls (play/pause, seek, volume)
8. User watches video for a few minutes, exits Video Player, watch progress is saved to backend
9. User reopens the same video, Video Player resumes from last saved position
10. User taps on Profile, views subscription status (Free), taps link to Subscription Plans Page
11. User selects a subscription plan, completes payment via Paystack inline JS, subscription status updates to Premium
12. User can now access premium books and videos without restriction
13. Admin logs in via web browser, navigates to `/admin`, uploads a new book (EPUB file, cover image, title, description, category, price, isPremium)
14. Admin uploads a new video (MP4 file, thumbnail, title, description, category, price, isPremium, relatedBookId)
15. Admin views Analytics Dashboard showing summary cards (total users, total revenue, active subscriptions, content count) and charts (pie charts, bar graphs, line charts)

---

## 7. Out of Scope for This Release

- Social features (comments, ratings, reviews, sharing)
- Offline download capability for books and videos
- Parental controls or content filtering by age group
- Multi-language support for UI and content
- Push notifications for new releases or recommendations
- In-app messaging or chat support
- Gamification features (badges, achievements, reading streaks)
- Audio narration or text-to-speech for books
- Closed captions or subtitles for videos
- Advanced analytics for user behavior tracking (heatmaps, session recordings)
- Integration with third-party services beyond Paystack, Google OAuth, Apple ID OAuth
- Admin role management (multiple admin levels, permissions)
- Bulk upload or import tools for content
- Content moderation or approval workflows
- Refund or cancellation management for subscriptions
- Email marketing or promotional campaigns
- A/B testing or feature flags
- Performance optimization beyond basic caching with Redis
- Advanced search filters (by author, publication date, duration, rating)
- Wishlist or favorites functionality
- Reading/watching history log
- Device synchronization across multiple devices (beyond progress tracking)
- Accessibility features (screen reader support, high contrast mode, font adjustments beyond basic size control)
- Content recommendations based on collaborative filtering or machine learning algorithms
- Integration with external libraries or educational platforms
- Parental dashboard for monitoring child's reading/watching activity
- Time limits or screen time controls
- Content preview or sample pages/clips before purchase
- Gift subscriptions or family plans
- Loyalty programs or referral rewards
- Integration with native device features beyond camera for avatar upload and sound controls
- Location-based content recommendations
- SMS-based OTP as alternative to email OTP
- Two-factor authentication (2FA) beyond OTP email verification
- Admin audit logs or activity tracking
- Automated content tagging or categorization
- Content versioning or update management
- User-generated content or community contributions
- Live streaming or interactive storytelling sessions
- Integration with smart home devices or voice assistants
- Blockchain-based content ownership or NFTs
- AR/VR experiences for immersive storytelling