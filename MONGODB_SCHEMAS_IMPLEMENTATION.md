# MongoDB Schemas Implementation Summary

## Overview

This document summarizes the MongoDB schemas and backend API setup for the SSN Connect Portal. All schemas have been implemented in `backend.cjs` with proper field definitions and relationships.

## Implemented Schemas

### 1. User Schema (Extended)

**Location**: `backend.cjs` - Line ~70

**New SSN Connect Fields Added**:

- `roll_number`: String (13 digits, required for students)
- `digital_id`: String (7 digits)
- `department`: String
- `join_year`: Number
- `followers`: Array (changed from Number to Array of user IDs)
- `following`: Array (user IDs)
- `liked`: Array (IDs of liked content)
- `registered_events`: Array (event IDs)
- `badges`: Array
- `streak`: Number (default: 0)
- `achievements`: Array
- `posts`: Array (post IDs)
- `announcements`: Array (announcement IDs)
- `materials`: Array (material IDs)
- `chats`: Array (chat thread IDs)
- `contacts`: Array (user IDs)
- `ods`: Array (OD claim IDs)
- `last_login`: Date
- `updatedAt`: Date

**Key Changes**:

- `role` field now uses enum: ['student', 'teacher', 'admin']
- `followers` changed from Number to Array for bidirectional relationships
- Added all SSN Connect specific fields for gamification and content tracking

### 2. Club Schema (New)

**Fields**:

- `name`: String (required)
- `logo`: String (required) - Supabase Storage URL
- `description`: String (required)
- `subdomains`: Array
- `members`: Array of { userId, role }
- `moderators`: Array of { userId, type: 'teacher' | 'student' }
- `works_done`: Array
- `created_by`: ObjectId (ref: User)
- `createdAt`, `updatedAt`: Date

### 3. Announcement Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `category`: String (required)
- `image`: String (required) - Supabase Storage URL
- `additional_images`: Array of URLs
- `hashtag`: String (required) - Format: #type_eventName_startDate_endDate
- `created_by`: ObjectId (ref: User, required)
- `likes`: Number (default: 0)
- `liked_by`: Array of user IDs
- `comments`: Array of { id, content, userId, userName, createdAt }
- `registration_enabled`: Boolean (default: false)
- `registration_fields`: Array
- `registrations`: Array of registration IDs
- `createdAt`, `updatedAt`: Date

### 4. Post Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `image`: String - Supabase Storage URL
- `visibility`: String (required) - enum: ['students', 'teachers', 'everyone']
- `hashtags`: Array
- `created_by`: ObjectId (ref: User, required)
- `likes`: Number (default: 0)
- `liked_by`: Array of user IDs
- `comments`: Array of { id, content, userId, userName, createdAt }
- `createdAt`, `updatedAt`: Date

### 5. Material Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `file_url`: String - Supabase Storage URL
- `external_link`: String
- `uploaded_by`: ObjectId (ref: User, required)
- `likes`: Number (default: 0)
- `liked_by`: Array of user IDs
- `comments`: Array of { id, content, userId, userName, createdAt }
- `createdAt`, `updatedAt`: Date

### 6. ODClaim Schema (New)

**Fields**:

- `student_id`: ObjectId (ref: User, required)
- `event_id`: ObjectId
- `event_name`: String (required)
- `teacher_id`: ObjectId (ref: User, required)
- `description`: String (required)
- `status`: String (default: 'pending') - enum: ['pending', 'accepted', 'rejected']
- `createdAt`, `updatedAt`: Date

### 7. Event Schema (New)

**Fields**:

- `name`: String (required)
- `type`: String (required)
- `start_date`: Date (required)
- `end_date`: Date (required)
- `source_type`: String (required) - enum: ['announcement', 'exam_schedule']
- `source_id`: ObjectId (required)
- `createdAt`: Date

### 8. ExamSchedule Schema (New)

**Fields**:

- `exam_name`: String (required)
- `date`: Date (required)
- `year`: Number (required)
- `semester`: Number (required)
- `number_of_exams`: Number (required)
- `created_by`: ObjectId (ref: User, required)
- `createdAt`: Date

### 9. Notification Schema (New)

**Fields**:

- `user_id`: ObjectId (ref: User, required)
- `type`: String (required) - enum: ['like', 'comment', 'announcement', 'od_status', 'event_reminder', 'message', 'query_response']
- `content`: String (required)
- `related_id`: ObjectId
- `read`: Boolean (default: false)
- `createdAt`: Date

### 10. Query Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `submitted_by`: ObjectId (ref: User, required)
- `submitter_role`: String (required) - enum: ['student', 'teacher']
- `status`: String (default: 'pending') - enum: ['pending', 'responded']
- `response`: String
- `responded_at`: Date
- `createdAt`: Date

### 11. Portal Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `external_link`: String (required)
- `created_by`: ObjectId (ref: User, required)
- `createdAt`: Date

### 12. Tool Schema (New)

**Fields**:

- `title`: String (required)
- `description`: String (required)
- `external_link`: String (required)
- `created_by`: ObjectId (ref: User, required)
- `createdAt`: Date

### 13. Registration Schema (New)

**Fields**:

- `announcement_id`: ObjectId (ref: Announcement, required)
- `user_id`: ObjectId (ref: User, required)
- `data`: Object (required) - Custom registration fields
- `badge_issued`: Boolean (default: false)
- `createdAt`: Date

## Existing Schemas (Preserved)

### File Schema

- Used for material file metadata
- Already existed in backend.cjs

### Chat Schema

- Used for chat threads and messages
- Already existed in backend.cjs
- Messages auto-expire after 10 hours

### Cgpa Schema

- Used for CGPA calculator data
- Already existed in backend.cjs

## Supabase Storage Integration

### Storage Buckets Required

The following Supabase Storage buckets need to be created manually:

1. **announcements** - For announcement images
2. **posts** - For post images
3. **materials** - For educational materials (PDFs, documents)
4. **clubs** - For club logos

### Setup Documentation

Detailed setup instructions are available in:

- `supabase/STORAGE_SETUP.md` - Original setup guide
- `supabase/STORAGE_BUCKETS_CONFIG.md` - Comprehensive configuration guide

### How It Works

1. Files are uploaded to Supabase Storage buckets
2. Supabase returns a public URL
3. The URL is stored as a string in MongoDB documents
4. Frontend retrieves the URL from MongoDB and displays the file

### Example Flow

```javascript
// 1. Upload file to Supabase
const publicUrl = await uploadFile("announcements", file, userId);
// Returns: "https://xxx.supabase.co/storage/v1/object/public/announcements/user123/1234567890.jpg"

// 2. Store URL in MongoDB
const announcement = new Announcement({
  title: "Tech Workshop",
  image: publicUrl, // Store the URL
  // ... other fields
});
await announcement.save();

// 3. Retrieve and display
const announcement = await Announcement.findById(id);
// announcement.image contains the Supabase URL
// Frontend can directly use this URL in <img src={announcement.image} />
```

## Data Relationships

### User Relationships

- User → Posts (one-to-many)
- User → Announcements (one-to-many)
- User → Materials (one-to-many)
- User → ODClaims (one-to-many)
- User → Queries (one-to-many)
- User ↔ User (followers/following - many-to-many)
- User ↔ ChatThreads (many-to-many)

### Content Relationships

- Announcement → Registrations (one-to-many)
- Announcement → Event (one-to-one via hashtag)
- ExamSchedule → Event (one-to-one)
- Club → Users (many-to-many via moderators/members)

### Interaction Relationships

- User → Content (likes - many-to-many)
- User → Content (comments - one-to-many)
- User → Notifications (one-to-many)

## Validation and Constraints

### Enum Validations

- User.role: ['student', 'teacher', 'admin']
- Post.visibility: ['students', 'teachers', 'everyone']
- ODClaim.status: ['pending', 'accepted', 'rejected']
- Event.source_type: ['announcement', 'exam_schedule']
- Notification.type: ['like', 'comment', 'announcement', 'od_status', 'event_reminder', 'message', 'query_response']
- Query.status: ['pending', 'responded']
- Query.submitter_role: ['student', 'teacher']

### Required Fields

All schemas have appropriate required fields marked to ensure data integrity.

### Default Values

- Numeric counters default to 0
- Arrays default to []
- Booleans default to false
- Dates default to Date.now

## Next Steps

### Immediate Actions Required

1. **Create Supabase Storage Buckets**:

   - Follow instructions in `supabase/STORAGE_BUCKETS_CONFIG.md`
   - Create: announcements, posts, materials, clubs buckets
   - Set up RLS policies for each bucket

2. **Test Schema Integration**:

   - Verify MongoDB connection
   - Test creating documents with new schemas
   - Verify relationships work correctly

3. **Implement Upload Service**:
   - Create `src/services/uploadService.jsx`
   - Implement file upload to Supabase Storage
   - Integrate with backend API endpoints

### Future API Endpoints to Implement

Based on these schemas, the following API endpoints need to be created:

**Clubs**:

- POST /api/clubs (admin only)
- PUT /api/clubs/:id (moderators only)
- GET /api/clubs

**Announcements**:

- POST /api/announcements
- GET /api/announcements
- POST /api/announcements/:id/register
- GET /api/announcements/:id/registrations
- POST /api/announcements/:id/badges

**Posts**:

- POST /api/posts
- GET /api/posts (with role-based filtering)
- POST /api/posts/:id/share

**Materials**:

- POST /api/materials
- GET /api/materials
- POST /api/materials/:id/share

**OD Claims**:

- POST /api/od-claims
- GET /api/od-claims/student/:studentId
- GET /api/od-claims/teacher/:teacherId
- PUT /api/od-claims/:id/status

**Events**:

- POST /api/events (auto-created from announcements)
- POST /api/exam-schedules
- GET /api/events
- GET /api/events/date/:date

**Notifications**:

- POST /api/notifications
- GET /api/notifications/:userId
- PUT /api/notifications/:id/read

**Queries**:

- POST /api/queries
- GET /api/queries/user/:userId
- GET /api/queries (admin only)
- PUT /api/queries/:id/respond (admin only)

**Portals & Tools**:

- POST /api/portals (admin only)
- POST /api/tools (admin only)
- GET /api/portals
- GET /api/tools

**Interactions**:

- POST /api/:contentType/:id/like
- POST /api/:contentType/:id/comment

## Verification

### Schema Verification Checklist

- [x] User schema extended with SSN Connect fields
- [x] Club schema created
- [x] Announcement schema created
- [x] Post schema created
- [x] Material schema created
- [x] ODClaim schema created
- [x] Event schema created
- [x] ExamSchedule schema created
- [x] Notification schema created
- [x] Query schema created
- [x] Portal schema created
- [x] Tool schema created
- [x] Registration schema created
- [x] All schemas have proper field types
- [x] All schemas have proper validations
- [x] All schemas have proper default values
- [x] All schemas have timestamps
- [x] All image/file fields store Supabase URLs as strings
- [x] No syntax errors in backend.cjs

### Storage Setup Checklist

- [ ] Supabase Storage buckets created (manual step)
- [ ] RLS policies configured (manual step)
- [ ] Upload service implemented (next task)
- [ ] Test file upload works (next task)
- [ ] Test URL storage in MongoDB (next task)

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- **Requirement 25.4**: All data operations use appropriate database (MongoDB for data, Supabase for storage)
- **Requirement 25.5**: File storage uses Supabase Storage with URLs stored in MongoDB

All schemas align with the data models defined in the design document (`design.md`).
