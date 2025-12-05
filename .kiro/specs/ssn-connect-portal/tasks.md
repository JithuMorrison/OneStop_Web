# Implementation Plan

## Architecture Note

This implementation uses MongoDB as the primary database with Express.js backend (backend.cjs), and Supabase Storage only for image/file uploads. Image URLs from Supabase Storage are stored in MongoDB documents.

- [ ] 1. Set up testing infrastructure

  - Install Vitest and related dependencies: `npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom`
  - Install fast-check for property-based testing: `npm install -D fast-check`
  - Create vitest.config.js with React and jsdom configuration
  - Add test scripts to package.json: "test", "test:ui", "test:coverage"
  - Create test setup file for React Testing Library
  - _Requirements: Testing Strategy from design document_

- [x] 2. Set up project foundation and integrations

  - Initialize Vite React project with Tailwind CSS ✓
  - Install dependencies: @supabase/supabase-js (storage only), react-router-dom, fast-check, vitest, react-testing-library
  - Create Supabase client configuration for Storage only
  - Set up project directory structure (components, pages, services, context, hooks, utils) ✓
  - Configure Vitest for unit and property-based testing
  - _Requirements: 25.1_

- [x] 3. Set up MongoDB schemas and backend API

  - Extend existing User schema in backend.cjs to include SSN Connect fields: roll_number, digital_id, department, join_year, section, followers (array), following (array), liked (array), registered_events (array), badges (array), streak (number), achievements (array), posts (array), announcements (array), materials (array), chats (array), contacts (array), ods (array), last_login (date)
  - Create new schemas in backend.cjs for: Clubs, Announcements, Posts, Materials, ODClaims, Events, ExamSchedules, Notifications, Queries, Portals, Tools, Registrations
  - Set up Supabase Storage buckets for image/file uploads (announcements, posts, materials, clubs)
  - All image/file fields in MongoDB schemas should store Supabase Storage URLs as strings
  - _Requirements: 25.4, 25.5_

- [x] 4. Implement authentication system

- [x] 4.1 Create email validation utilities

  - Write email validation functions for student, teacher, and admin roles ✓
  - Implement pattern matching for each role's email format ✓
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]\* 4.2 Write property test for email validation

  - **Property 1: Student email validation**
  - **Property 2: Teacher email validation**
  - **Validates: Requirements 1.1, 1.2**

- [x] 4.3 Update authentication service for MongoDB

  - Refactor authService.jsx to use Express backend API instead of Supabase Auth
  - Update register function to call /api/register endpoint with role-based email validation
  - Update login function to call /api/login endpoint and handle JWT tokens
  - Implement logout function (clear localStorage and token)
  - Update getCurrentUser function to validate JWT and fetch user from backend
  - Update backend /api/register to include all SSN Connect fields (roll_number, digital_id, streak, badges, achievements, etc.)
  - Update backend /api/login to award "Welcome Achievement" on first login
  - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [ ]\* 4.4 Write property tests for authentication

  - **Property 3: User registration completeness**
  - **Property 4: Student roll number requirement**
  - **Property 6: First login achievement**
  - **Validates: Requirements 1.4, 1.5, 1.7**

- [x] 4.5 Create Login and Register pages

  - Build Login page with email and password inputs ✓
  - Build Register page with role selection and all required fields ✓
  - Add form validation and error display ✓
  - Implement role-based dashboard routing after login ✓
  - _Requirements: 1.6_

- [ ]\* 4.6 Write property test for dashboard routing

  - **Property 5: Role-based dashboard routing**
  - **Validates: Requirements 1.6**

- [x] 5. Implement user context and streak tracking

- [x] 5.1 Create UserContext for global user state

  - Build UserContext with user data and authentication state
  - Implement useAuth hook for accessing user context
  - Add user data persistence across page refreshes using JWT tokens
  - Store JWT token in localStorage and validate on app load
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 5.2 Implement streak calculation logic in backend

  - Add backend API endpoint /api/user/streak to update streak
  - Write streak update function that checks consecutive logins based on last_login timestamp
  - Implement streak reset logic for missed days
  - Add timezone-aware date comparison
  - Award "Consistency Badge" at 50-day streak and update user's badges array
  - Call streak update on each login
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ]\* 5.3 Write property tests for streak system

  - **Property 7: Consecutive login streak increment**
  - **Property 8: Missed day streak reset**
  - **Property 9: Timezone-aware streak calculation**
  - **Validates: Requirements 2.1, 2.2, 2.5**

- [x] 6. Build layout components

- [x] 6.1 Create Navbar component

  - Build navbar with logo, search bar, notification bell, and profile menu
  - Implement responsive design that collapses on mobile
  - Add search functionality for users and content
  - _Requirements: 24.1, 24.4, 24.5_

- [x] 6.2 Create Sidebar component

  - Build sidebar with role-based navigation links
  - Implement collapsible behavior for mobile
  - Add active link highlighting
  - _Requirements: 24.2, 24.3_

- [ ]\* 6.3 Write property tests for navigation

  - **Property 77: Role-based sidebar links**
  - **Property 78: Client-side navigation**
  - **Property 79: Notification dropdown display**
  - **Validates: Requirements 24.2, 24.3, 24.4**

- [x] 6.4 Create RightPanel chat component

  - Build toggleable chat panel
  - Implement contact list display
  - Add chat thread selection
  - _Requirements: 13.6, 14.1_

- [x] 7. Implement dashboard pages

- [x] 7.1 Create StudentDashboard page

  - Display quick links to all sections
  - Show current streak count
  - Display upcoming events
  - Show followed announcements and posts
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]\* 7.2 Write property tests for student dashboard

  - **Property 10: Dashboard streak display**
  - **Property 11: Upcoming events display**
  - **Property 12: Followed content display**
  - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 7.3 Create TeacherDashboard page

  - Display administrative tools (exam schedules, OD approvals, announcements, events)
  - Show pending OD claims count
  - Display upcoming events created by teacher
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]\* 7.4 Write property tests for teacher dashboard

  - **Property 13: Teacher pending OD count accuracy**
  - **Property 14: Teacher created events filter**
  - **Validates: Requirements 4.2, 4.3**

- [x] 7.5 Create AdminDashboard page

  - Display system management tools (clubs, portals, tools, user roles, queries)
  - Show total user counts by role
  - Display pending queries count
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]\* 7.6 Write property tests for admin dashboard

  - **Property 15: Admin user count accuracy**
  - **Property 16: Admin pending queries count accuracy**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 8. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement club management system
- [ ] 9.1 Create club service and backend API

  - Add Club schema to backend.cjs with fields: name, logo (Supabase Storage URL), description, subdomains, members, moderators, works_done, created_by
  - Create backend API endpoints: POST /api/clubs (admin only), PUT /api/clubs/:id (moderators only), GET /api/clubs
  - Implement clubService.jsx to call backend APIs
  - Implement createClub function (admin only) - uploads logo to Supabase Storage, stores URL in MongoDB
  - Implement updateClub function (moderators only)
  - Implement getAllClubs function
  - Implement canEditClub function for access control
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]\* 9.2 Write property tests for club management

  - **Property 17: Club creation required fields**
  - **Property 18: Club moderator limits**
  - **Property 19: Moderator email existence validation**
  - **Property 20: Club member data persistence**
  - **Property 21: Club edit access control**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 9.3 Create ClubCard component

  - Display club logo, name, description
  - Show subdomains and members with roles
  - Display works done
  - Show edit button for authorized users
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9.4 Create Clubs page

  - Display all clubs using ClubCard components
  - Implement club detail view
  - Add club creation form (admin only)
  - Add club edit form (moderators only)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]\* 9.5 Write property test for club display

  - **Property 22: Club list completeness**
  - **Validates: Requirements 7.1, 7.2, 7.4**

- [ ] 10. Implement announcement system
- [ ] 10.1 Create hashtag parser utility

  - Write function to parse hashtag format #type_eventName_startDate_endDate
  - Implement date extraction and validation
  - Add event type extraction
  - _Requirements: 8.3, 17.2_

- [ ]\* 10.2 Write property test for hashtag parsing

  - **Property 24: Announcement hashtag format validation**
  - **Property 57: Hashtag event extraction**
  - **Validates: Requirements 8.3, 17.2**

- [ ] 10.3 Create announcement service and backend API

  - Add Announcement schema to backend.cjs with fields: title, description, category, image (Supabase Storage URL), additional_images (array of URLs), hashtag, created_by, likes, liked_by, comments, registration_enabled, registration_fields, registrations
  - Create backend API endpoints: POST /api/announcements, GET /api/announcements, POST /api/announcements/:id/register, GET /api/announcements/:id/registrations, POST /api/announcements/:id/badges
  - Implement announcementService.jsx to call backend APIs
  - Implement createAnnouncement function with hashtag parsing - uploads image to Supabase Storage, stores URL in MongoDB
  - Implement getAnnouncements function with category filtering
  - Implement registerForAnnouncement function
  - Implement getRegistrations function (creator only)
  - Implement issueBadges function
  - Automatically create Event document when announcement with hashtag is created
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.2_

- [ ]\* 10.4 Write property tests for announcements

  - **Property 23: Announcement required fields validation**
  - **Property 25: Registration data access control**
  - **Property 26: Announcement creator attribution**
  - **Property 27: Badge issuance to participants**
  - **Property 28: Announcement category filtering**
  - **Validates: Requirements 8.1, 8.5, 8.6, 8.7, 9.2**

- [ ] 10.5 Create AnnouncementCard component

  - Display title, description, image, category
  - Show likes count and comments
  - Display creator information
  - Add registration button if enabled
  - _Requirements: 9.1, 9.5_

- [ ] 10.6 Create AnnouncementForm component

  - Build form with title, description, category inputs
  - Add image upload and additional image links
  - Implement hashtag input with format validation
  - Add registration toggle and custom fields
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10.7 Create Announcements page

  - Display all announcements using AnnouncementCard
  - Implement category filters
  - Add announcement creation form
  - Implement registration flow
  - _Requirements: 9.1, 9.2, 9.5, 9.6_

- [ ]\* 10.8 Write property tests for announcement interactions

  - **Property 29: Registration button visibility**
  - **Property 30: Announcement registration enrollment**
  - **Validates: Requirements 9.5, 9.6**

- [ ] 11. Implement post system
- [ ] 11.1 Create post service and backend API

  - Add Post schema to backend.cjs with fields: title, description, image (Supabase Storage URL), visibility, hashtags, created_by, likes, liked_by, comments
  - Create backend API endpoints: POST /api/posts, GET /api/posts (with role-based filtering), POST /api/posts/:id/share
  - Implement postService.jsx to call backend APIs
  - Implement createPost function with visibility control - uploads image to Supabase Storage, stores URL in MongoDB
  - Implement getPosts function with role-based filtering (students see 'students' and 'everyone', teachers see 'teachers' and 'everyone')
  - Implement sharePost function
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]\* 11.2 Write property tests for posts

  - **Property 31: Post required fields validation**
  - **Property 32: Post creator data consistency**
  - **Property 33: Post visibility access control**
  - **Property 34: Post hashtag filtering**
  - **Validates: Requirements 10.1, 10.4, 10.5, 10.3**

- [ ] 11.3 Create PostCard component

  - Display title, description, image
  - Show likes count and comments
  - Display creator information
  - Add share button
  - _Requirements: 10.6, 10.7, 11.1_

- [ ] 11.4 Create PostForm component

  - Build form with title, description, visibility selector
  - Add image upload
  - Implement hashtag input
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11.5 Create Posts page

  - Display posts using PostCard components
  - Implement hashtag filters
  - Add post creation form
  - Implement share functionality with contact selection
  - _Requirements: 10.5, 10.6, 10.7, 11.1, 11.2_

- [ ]\* 11.6 Write property tests for post sharing

  - **Property 35: Share contacts display**
  - **Property 36: Share notification creation**
  - **Property 37: Shared content navigation**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

- [ ] 12. Implement material system
- [ ] 12.1 Create material service and backend API

  - Add Material schema to backend.cjs with fields: title, description, file_url (Supabase Storage URL), external_link, uploaded_by, likes, liked_by, comments
  - Create backend API endpoints: POST /api/materials, GET /api/materials, POST /api/materials/:id/share
  - Implement materialService.jsx to call backend APIs
  - Implement uploadMaterial function - uploads file to Supabase Storage, stores URL in MongoDB
  - Implement getMaterials function
  - Implement shareMaterial function
  - _Requirements: 12.1, 12.2, 12.3, 12.6_

- [ ]\* 12.2 Write property tests for materials

  - **Property 38: Material required fields validation**
  - **Property 39: Material uploader data consistency**
  - **Validates: Requirements 12.1, 12.2**

- [ ] 12.3 Create MaterialCard component

  - Display title, description, file/link preview
  - Show likes count and comments
  - Display uploader information
  - Add share button
  - _Requirements: 12.3, 12.4, 12.5, 12.6_

- [ ] 12.4 Create MaterialForm component

  - Build form with title, description inputs
  - Add file upload or link input
  - _Requirements: 12.1_

- [ ] 12.5 Create Materials page

  - Display materials using MaterialCard components
  - Add material upload form
  - Implement share functionality
  - _Requirements: 12.3, 12.6_

- [ ] 13. Implement like and comment functionality
- [ ] 13.1 Create interaction service and backend API

  - Create backend API endpoints: POST /api/:contentType/:id/like, POST /api/:contentType/:id/comment
  - Implement interactionService.jsx to call backend APIs
  - Implement likeContent function (works for announcements, posts, materials) - increments like count and adds to user's liked array
  - Implement addComment function (works for all content types) - adds comment with user info to content's comments array
  - Ensure bidirectional updates (content like count + user liked array)
  - _Requirements: 9.3, 10.6, 12.4, 9.4, 10.7, 12.5_

- [ ]\* 13.2 Write property tests for interactions

  - **Property 40: Like action consistency**
  - **Property 41: Comment storage and display**
  - **Validates: Requirements 9.3, 10.6, 12.4, 9.4, 10.7, 12.5**

- [ ] 13.3 Add like and comment UI to all content cards

  - Update PostCard, AnnouncementCard, MaterialCard with like/comment components
  - Implement real-time like count updates
  - Display comments with commenter information
  - _Requirements: 9.3, 9.4, 10.6, 10.7, 12.4, 12.5_

- [ ] 14. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement profile and social features
- [ ] 15.1 Update user service for MongoDB backend

  - Update userService.jsx to call existing backend APIs (GET /api/user/:id, POST /api/follow/:userId, POST /api/unfollow/:userId, GET /api/search)
  - Implement getUserById function using existing endpoint
  - Implement updateProfile function - add backend endpoint PUT /api/user/:id
  - Implement followUser function using existing endpoint
  - Implement unfollowUser function using existing endpoint
  - Implement searchUserByEmail function using existing search endpoint
  - _Requirements: 13.1, 13.4, 13.5, 14.2_

- [ ]\* 15.2 Write property tests for profile features

  - **Property 42: Profile data completeness**
  - **Property 43: Profile content display**
  - **Property 44: Social metrics accuracy**
  - **Property 45: Follow action bidirectional update**
  - **Property 47: User search by email**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.5, 14.2**

- [ ] 15.3 Create Profile page

  - Display all user information (name, role, email, department, etc.)
  - Show streak count, badges, achievements
  - Display followers and following counts
  - Show all user's posts, announcements, materials
  - Add follow button for other users' profiles
  - Integrate chat panel on right side
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 16. Implement chat system
- [ ] 16.1 Update chat service for MongoDB backend

  - Update chatService.jsx to call existing backend APIs (GET /api/chat/:userId, POST /api/chat/:chatId/message, GET /api/chats)
  - Implement createChatThread function using existing endpoint
  - Implement sendMessage function using existing endpoint
  - Implement getChatThreads function using existing endpoint
  - Implement polling or WebSocket for real-time message updates (existing backend has auto-expiring messages after 10 hours)
  - _Requirements: 14.1, 14.3, 14.4, 14.6_

- [ ]\* 16.2 Write property tests for chat

  - **Property 46: Chat thread display completeness**
  - **Property 48: Chat thread creation bidirectional**
  - **Property 49: Message sending side effects**
  - **Property 50: Real-time message updates**
  - **Validates: Requirements 14.1, 14.3, 14.4, 14.6**

- [ ] 16.3 Build ChatPanel component

  - Display all chat threads
  - Implement user search by email
  - Show message history for selected thread
  - Add message input and send functionality
  - Implement real-time message updates
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 17. Implement OD claim system
- [ ] 17.1 Create OD service and backend API

  - Add ODClaim schema to backend.cjs with fields: student_id, event_id, event_name, teacher_id, description, status (pending/accepted/rejected)
  - Create backend API endpoints: POST /api/od-claims, GET /api/od-claims/student/:studentId, GET /api/od-claims/teacher/:teacherId, PUT /api/od-claims/:id/status
  - Implement odService.jsx to call backend APIs
  - Implement createODClaim function (students) - sets status to "pending", adds to student's ods array
  - Implement getStudentODClaims function
  - Implement getTeacherODClaims function with status filter
  - Implement updateODStatus function (teachers) - creates notification for student
  - _Requirements: 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4_

- [ ]\* 17.2 Write property tests for OD claims

  - **Property 51: OD claim required fields validation**
  - **Property 52: OD claim initial state**
  - **Property 53: Student OD claims display**
  - **Property 54: Teacher OD claims filtering**
  - **Property 55: OD status filter accuracy**
  - **Property 56: OD approval side effects**
  - **Validates: Requirements 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4**

- [ ] 17.3 Create ODClaim page

  - Build student view with OD creation form and claim list
  - Build teacher view with OD approval interface and filters
  - Display event name, tagged teacher, status for each claim
  - Implement approve/reject actions for teachers
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 18. Implement calendar and event system
- [ ] 18.1 Create event service and backend API

  - Add Event schema to backend.cjs with fields: name, type, start_date, end_date, source_type (announcement/exam_schedule), source_id
  - Add ExamSchedule schema with fields: exam_name, date, year, semester, number_of_exams, created_by
  - Create backend API endpoints: POST /api/events (auto-created from announcements), POST /api/exam-schedules, GET /api/events, GET /api/events/date/:date
  - Implement eventService.jsx to call backend APIs
  - Implement automatic event creation from announcement hashtags (called when announcement is created)
  - Implement createExamSchedule function (teachers) - also creates Event document
  - Implement getEvents function with date range filtering
  - Implement getEventsForDate function
  - _Requirements: 17.2, 17.3, 17.4, 18.1, 18.2, 18.3_

- [ ]\* 18.2 Write property tests for events

  - **Property 58: Automatic event calendar addition**
  - **Property 59: Calendar date event filtering**
  - **Property 60: Exam schedule required fields validation**
  - **Property 61: Exam schedule calendar integration**
  - **Validates: Requirements 17.3, 17.4, 18.1, 18.2**

- [ ] 18.3 Create CalendarEvents page

  - Display monthly calendar view
  - Show events on calendar dates
  - Implement date click to show event details
  - Add exam schedule creation form (teachers only)
  - Visually distinguish exam schedules from other events
  - _Requirements: 17.1, 17.4, 17.5, 18.2, 18.3, 18.4_

- [ ] 19. Implement portal and tool management
- [ ] 19.1 Create portal and tool service and backend API

  - Add Portal schema to backend.cjs with fields: title, description, external_link, created_by
  - Add Tool schema with fields: title, description, external_link, created_by
  - Create backend API endpoints: POST /api/portals (admin only), POST /api/tools (admin only), GET /api/portals, GET /api/tools
  - Implement portalToolService.jsx to call backend APIs
  - Implement createPortal function (admin only)
  - Implement createTool function (admin only)
  - Implement getPortals function
  - Implement getTools function
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ]\* 19.2 Write property tests for portals and tools

  - **Property 62: Portal and tool required fields validation**
  - **Property 63: Portal and tool list completeness**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.4**

- [ ] 19.3 Create PortalsTools page

  - Display all portals with title, description, and links
  - Display all tools with title, description, and links
  - Add portal creation form (admin only)
  - Add tool creation form (admin only)
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 20. Implement query system
- [ ] 20.1 Create query service and backend API

  - Add Query schema to backend.cjs with fields: title, description, submitted_by, submitter_role, status (pending/responded), response, responded_at
  - Create backend API endpoints: POST /api/queries, GET /api/queries/user/:userId, GET /api/queries (admin only), PUT /api/queries/:id/respond (admin only)
  - Implement queryService.jsx to call backend APIs
  - Implement submitQuery function (students and teachers) - sets status to "pending", creates notification for admin
  - Implement getUserQueries function
  - Implement getAllQueries function (admin only)
  - Implement respondToQuery function (admin only) - updates status to "responded", creates notification for submitter
  - _Requirements: 20.1, 20.2, 20.3, 21.1, 21.2, 21.3, 21.4_

- [ ]\* 20.2 Write property tests for queries

  - **Property 64: Query required fields validation**
  - **Property 65: Query submission side effects**
  - **Property 66: User query display filtering**
  - **Property 67: Admin query list completeness**
  - **Property 68: Query status filter accuracy**
  - **Property 69: Query response side effects**
  - **Validates: Requirements 20.1, 20.2, 20.3, 21.1, 21.2, 21.3, 21.4**

- [ ] 20.3 Create Query page

  - Build student/teacher view with query submission form and query list
  - Build admin view with all queries and response interface
  - Implement status filters (pending, responded)
  - Display query details and admin responses
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 21.1, 21.2, 21.3, 21.4, 21.5_

- [ ] 21. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Implement notification system
- [ ] 22.1 Create notification service and backend API

  - Add Notification schema to backend.cjs with fields: user_id, type (like/comment/announcement/od_status/event_reminder/message), content, related_id, read
  - Create backend API endpoints: POST /api/notifications, GET /api/notifications/:userId, PUT /api/notifications/:id/read
  - Implement notificationService.jsx to call backend APIs
  - Implement createNotification function (called from various actions: likes, comments, announcements, OD status changes, messages, query responses)
  - Implement getNotifications function
  - Implement markAsRead function
  - Implement polling for real-time notification updates
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8_

- [ ]\* 22.2 Write property tests for notifications

  - **Property 70: Content interaction notifications**
  - **Property 71: Announcement broadcast notifications**
  - **Property 72: Message notification creation**
  - **Property 73: Notification read state update**
  - **Validates: Requirements 22.1, 22.2, 22.3, 14.5, 22.6, 22.8**

- [ ] 22.3 Create NotificationContext

  - Build context for managing notification state
  - Implement real-time notification updates
  - Add notification count badge
  - _Requirements: 22.7_

- [ ] 22.4 Create NotificationBell component

  - Display notification icon with unread count
  - Show dropdown with recent notifications
  - Implement mark as read on click
  - Navigate to related content on notification click
  - _Requirements: 22.7, 22.8_

- [ ] 22.5 Integrate notifications across the app

  - Add notification creation to like actions
  - Add notification creation to comment actions
  - Add notification creation to new announcements
  - Add notification creation to OD status changes
  - Add notification creation to messages
  - Add notification creation to query responses
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.6_

- [ ] 23. Implement CGPA calculator
- [ ] 23.1 Create CGPA calculation utility

  - Write CGPA calculation function using standard formula
  - Implement reactive recalculation on course changes
  - _Requirements: 23.2, 23.3, 23.4_

- [ ]\* 23.2 Write property tests for CGPA calculator

  - **Property 74: CGPA calculation correctness**
  - **Property 75: CGPA reactive recalculation**
  - **Property 76: CGPA data persistence**
  - **Validates: Requirements 23.2, 23.3, 23.4, 23.5**

- [ ] 23.3 Create CGPACalculator page

  - Display input fields for course grades and credits
  - Show calculated CGPA in real-time
  - Implement add/remove course functionality
  - Add save functionality to store in user profile
  - _Requirements: 23.1, 23.2, 23.4, 23.5_

- [ ] 24. Implement routing and navigation
- [ ] 24.1 Set up React Router

  - Configure routes for all pages
  - Implement protected routes for authenticated users
  - Add role-based route guards
  - Set up 404 page
  - _Requirements: 1.6, 24.3_

- [ ] 24.2 Integrate layout components

  - Wrap authenticated routes with Navbar and Sidebar
  - Add RightPanel to pages that need chat
  - Ensure consistent layout across all pages
  - _Requirements: 24.1, 24.2_

- [ ] 25. Add error handling and loading states
- [ ] 25.1 Create error handling utilities

  - Implement centralized error handler
  - Create error display components (toast notifications)
  - Add error boundaries for React components
  - _Requirements: All error scenarios from design document_

- [ ] 25.2 Add loading states

  - Create loading spinner component
  - Add loading states to all data fetching operations
  - Implement skeleton loaders for content cards
  - _Requirements: All data fetching operations_

- [ ] 26. Implement file upload functionality
- [ ] 26.1 Create file upload utility for Supabase Storage

  - Create uploadService.jsx for Supabase Storage operations
  - Implement file validation (type, size)
  - Create upload function using Supabase Storage - returns public URL
  - Add progress tracking for uploads
  - Create separate buckets for: announcements, posts, materials, clubs
  - _Requirements: 8.1, 10.2, 12.1_

- [ ] 26.2 Integrate file uploads with MongoDB storage

  - Add file upload to AnnouncementForm - uploads to Supabase Storage, sends URL to backend API
  - Add file upload to PostForm - uploads to Supabase Storage, sends URL to backend API
  - Add file upload to MaterialForm - uploads to Supabase Storage, sends URL to backend API
  - Add file upload to ClubForm - uploads logo to Supabase Storage, sends URL to backend API
  - Display uploaded images from Supabase URLs in content cards
  - _Requirements: 8.1, 10.2, 12.1_

- [ ] 27. Add responsive design and styling
- [ ] 27.1 Implement responsive layouts

  - Make all pages mobile-responsive using Tailwind
  - Add mobile navigation menu
  - Optimize touch interactions for mobile
  - _Requirements: All UI requirements_

- [ ] 27.2 Apply consistent styling

  - Create Tailwind theme configuration
  - Apply consistent colors, fonts, and spacing
  - Add hover and focus states
  - Ensure accessibility (contrast, focus indicators)
  - _Requirements: All UI requirements_

- [ ] 28. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 29. Polish and optimization
- [ ] 29.1 Implement performance optimizations

  - Add lazy loading for routes
  - Implement pagination for lists
  - Optimize images with lazy loading
  - Add debouncing to search inputs
  - _Requirements: Performance considerations from design document_

- [ ] 29.2 Add final touches
  - Implement empty states for lists
  - Add confirmation dialogs for destructive actions
  - Improve error messages
  - Add success feedback for actions
  - _Requirements: All user experience requirements_
