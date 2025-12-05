# Requirements Document

## Introduction

SSN Connect is a unified campus portal system that serves as a central hub for students, teachers, and administrators at SSN College. The system provides role-based access to various campus activities including clubs, announcements, materials sharing, event management, OD claims, and inter-user communication. The platform uses Supabase as the backend database and React for the frontend, with Tailwind CSS for styling.

## Glossary

- **SSN Connect**: The unified campus portal system
- **User**: Any authenticated person using the system (student, teacher, or administrator)
- **Student**: A user with student role and 13-digit roll number
- **Teacher**: A user with teacher role and faculty privileges
- **Admin**: A user with administrative privileges (jithu@ssn.edu.in)
- **Supabase**: The backend database and authentication service
- **OD Claim**: On-Duty claim request submitted by students for event participation
- **Streak**: Consecutive daily login count for gamification
- **Badge**: Achievement award given for completing activities
- **Club**: Student organization with assigned moderators
- **Announcement**: Public notice about events, hackathons, workshops, or courses
- **Post**: User-generated content visible to selected audiences
- **Material**: Educational resource (PDF, link, or file) shared by users
- **Digital ID**: 7-digit unique identifier for all users
- **Roll Number**: 13-digit unique identifier for students only
- **Hashtag**: Metadata tag for categorization and calendar extraction

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register and login with role-based email validation, so that I can access the system with appropriate permissions.

#### Acceptance Criteria

1. WHEN a student registers THEN the system SHALL validate the email format matches `{name}{number}@ssn.edu.in` pattern
2. WHEN a teacher registers THEN the system SHALL validate the email format matches `{name}@ssn.edu.in` pattern
3. WHEN an admin registers THEN the system SHALL validate the email matches exactly `jithu@ssn.edu.in`
4. WHEN a user completes registration THEN the system SHALL create a user record in Supabase with name, role, email, digital_id, department, join_year, and section
5. WHEN a student registers THEN the system SHALL require and store a 13-digit roll_number
6. WHEN a user successfully logs in THEN the system SHALL redirect to the appropriate role-based dashboard
7. WHEN a user logs in for the first time THEN the system SHALL award a "Welcome Achievement" badge

### Requirement 2

**User Story:** As a user, I want my daily login streak tracked and rewarded, so that I am motivated to engage with the platform regularly.

#### Acceptance Criteria

1. WHEN a user logs in on consecutive days THEN the system SHALL increment the streak counter by one
2. WHEN a user misses a day THEN the system SHALL reset the streak counter to zero
3. WHEN a user achieves 50 consecutive login days THEN the system SHALL award a "Consistency Badge"
4. WHEN a user views their profile THEN the system SHALL display the current streak count
5. WHEN calculating streak THEN the system SHALL consider login timestamps in the user's timezone

### Requirement 3

**User Story:** As a student, I want to view a personalized dashboard with quick access to campus features, so that I can efficiently navigate the platform.

#### Acceptance Criteria

1. WHEN a student logs in THEN the system SHALL display the Student Dashboard with quick links to Clubs, Announcements, Posts, Materials, OD Claims, Events, and Tools
2. WHEN the Student Dashboard loads THEN the system SHALL display the user's current daily streak count
3. WHEN the Student Dashboard loads THEN the system SHALL display upcoming events from the calendar
4. WHEN the Student Dashboard loads THEN the system SHALL display followed announcements and posts
5. WHEN a student clicks a quick link THEN the system SHALL navigate to the corresponding page

### Requirement 4

**User Story:** As a teacher, I want to access a dashboard with administrative tools, so that I can manage academic activities and student requests.

#### Acceptance Criteria

1. WHEN a teacher logs in THEN the system SHALL display the Teacher Dashboard with options to create exam schedules, approve OD claims, create announcements, and manage events
2. WHEN a teacher views the dashboard THEN the system SHALL display pending OD claims count
3. WHEN a teacher views the dashboard THEN the system SHALL display upcoming events they created
4. WHEN a teacher clicks an administrative tool THEN the system SHALL navigate to the corresponding management page

### Requirement 5

**User Story:** As an admin, I want to access a comprehensive dashboard with system management tools, so that I can oversee and configure the entire platform.

#### Acceptance Criteria

1. WHEN an admin logs in THEN the system SHALL display the Admin Dashboard with options to create clubs, create portals, create tools, manage user roles, and view queries
2. WHEN the admin views the dashboard THEN the system SHALL display total user counts by role
3. WHEN the admin views the dashboard THEN the system SHALL display pending queries count
4. WHEN the admin clicks a management tool THEN the system SHALL navigate to the corresponding administration page

### Requirement 6

**User Story:** As an admin, I want to create and manage clubs with assigned moderators, so that student organizations can maintain their own content.

#### Acceptance Criteria

1. WHEN an admin creates a club THEN the system SHALL require club name, logo image link, description, and optional subdomains
2. WHEN an admin creates a club THEN the system SHALL allow assignment of editing access to exactly one teacher email and up to three student emails
3. WHEN an admin assigns editing access THEN the system SHALL verify the email accounts exist in the database
4. WHEN a club is created THEN the system SHALL store member details with their roles
5. WHEN a user with editing access views a club THEN the system SHALL display edit controls for club name, description, subdomains, members, and works done
6. WHEN a user without editing access views a club THEN the system SHALL display club information in read-only mode

### Requirement 7

**User Story:** As a user, I want to view all campus clubs with their details, so that I can learn about student organizations and their activities.

#### Acceptance Criteria

1. WHEN a user navigates to the Clubs page THEN the system SHALL display all clubs with logo, name, description, subdomains, members with roles, and works done
2. WHEN displaying clubs THEN the system SHALL render logos from provided image links
3. WHEN a user clicks a club THEN the system SHALL display detailed club information
4. WHEN displaying club members THEN the system SHALL show member names and their roles within the club

### Requirement 8

**User Story:** As a teacher or student, I want to create announcements with categorization and registration options, so that I can promote events and track participant interest.

#### Acceptance Criteria

1. WHEN a teacher or student creates an announcement THEN the system SHALL require title, description, category, and one image upload
2. WHEN creating an announcement THEN the system SHALL allow additional images as external links
3. WHEN creating an announcement THEN the system SHALL require a hashtag in format `#type_eventName_startDate_endDate` where dates are in dd-mm-yyyy format
4. WHEN creating an announcement THEN the system SHALL allow enabling registration with custom required fields
5. WHEN registration is enabled THEN the system SHALL collect registrant details and make them visible to the announcement creator
6. WHEN an announcement is posted THEN the system SHALL store the creator's user ID and display "who posted" information
7. WHEN an event completes THEN the system SHALL allow the creator to issue badges and achievements to registered participants

### Requirement 9

**User Story:** As a user, I want to view, filter, and interact with announcements, so that I can stay informed about campus events and opportunities.

#### Acceptance Criteria

1. WHEN a user navigates to the Announcements page THEN the system SHALL display all announcements with title, description, image, category, likes count, comments count, and creator information
2. WHEN viewing announcements THEN the system SHALL provide filters by category including events, hackathons, workshops, and value-added courses
3. WHEN a user likes an announcement THEN the system SHALL increment the like count and add the announcement ID to the user's liked array
4. WHEN a user comments on an announcement THEN the system SHALL store and display the comment with commenter information
5. WHEN registration is enabled for an announcement THEN the system SHALL display a registration button
6. WHEN a user clicks register THEN the system SHALL collect required details and add the user to registered participants

### Requirement 10

**User Story:** As a user, I want to create posts with visibility controls, so that I can share content with specific audiences.

#### Acceptance Criteria

1. WHEN a user creates a post THEN the system SHALL require title, description, and visibility setting (students only, teachers only, or everyone)
2. WHEN creating a post THEN the system SHALL allow uploading one image
3. WHEN creating a post THEN the system SHALL allow adding hashtags for filtering
4. WHEN a post is created THEN the system SHALL store the creator's user ID and add the post ID to the creator's posts array
5. WHEN a user views posts THEN the system SHALL display only posts matching their visibility permissions
6. WHEN a user likes a post THEN the system SHALL increment the like count and add the post ID to the user's liked array
7. WHEN a user comments on a post THEN the system SHALL store and display the comment with commenter information

### Requirement 11

**User Story:** As a user, I want to share posts with my contacts, so that I can recommend content to specific people.

#### Acceptance Criteria

1. WHEN a user clicks the share button on a post THEN the system SHALL display the user's contacts list
2. WHEN a user selects contacts to share with THEN the system SHALL send the post ID to those users
3. WHEN a user receives a shared post THEN the system SHALL create a notification
4. WHEN a user clicks a shared post notification THEN the system SHALL navigate directly to that specific post

### Requirement 12

**User Story:** As a user, I want to upload and share educational materials, so that I can contribute to the learning community.

#### Acceptance Criteria

1. WHEN a user uploads material THEN the system SHALL require title, description, and either a file upload or external link
2. WHEN material is uploaded THEN the system SHALL store the uploader's user ID and add the material ID to the uploader's materials array
3. WHEN a user views materials THEN the system SHALL display title, description, file/link, likes count, comments count, and uploader information
4. WHEN a user likes material THEN the system SHALL increment the like count and add the material ID to the user's liked array
5. WHEN a user comments on material THEN the system SHALL store and display the comment with commenter information
6. WHEN a user clicks share on material THEN the system SHALL display contacts list and allow sharing the material ID

### Requirement 13

**User Story:** As a user, I want to view and manage my profile with social features, so that I can track my activity and connect with others.

#### Acceptance Criteria

1. WHEN a user navigates to their profile THEN the system SHALL display name, role, email, department, join year, section, digital ID, roll number (if student), streak count, badges, and achievements
2. WHEN viewing a profile THEN the system SHALL display all posts, announcements, and materials created by that user
3. WHEN viewing a profile THEN the system SHALL display followers count and following count
4. WHEN a user views another user's profile THEN the system SHALL display a follow button
5. WHEN a user follows another user THEN the system SHALL add the followed user's ID to the follower's following array and add the follower's ID to the followed user's followers array
6. WHEN viewing a profile THEN the system SHALL display a toggleable chat panel on the right side

### Requirement 14

**User Story:** As a user, I want to search for and chat with other users, so that I can communicate directly within the platform.

#### Acceptance Criteria

1. WHEN a user opens the chat panel THEN the system SHALL display all previous chat threads from the user's chats array
2. WHEN a user searches by email THEN the system SHALL find and display the matching user
3. WHEN a user initiates a chat THEN the system SHALL create a chat thread and add it to both users' chats arrays
4. WHEN a user sends a message THEN the system SHALL store the message in the chat thread and add the recipient to the sender's contacts array
5. WHEN a user receives a message THEN the system SHALL create a notification
6. WHEN the chat panel is open THEN the system SHALL display real-time message updates

### Requirement 15

**User Story:** As a student, I want to submit OD claims for events with teacher verification, so that I can get official recognition for my participation.

#### Acceptance Criteria

1. WHEN a student creates an OD claim THEN the system SHALL require selecting an event, workshop, or hackathon and tagging a responsible teacher
2. WHEN an OD claim is created THEN the system SHALL set status to "pending" and add the OD ID to the student's ods array
3. WHEN a student views the OD Claims page THEN the system SHALL display all their OD claims with status (pending or accepted)
4. WHEN displaying OD claims THEN the system SHALL show event name, tagged teacher, submission date, and current status

### Requirement 16

**User Story:** As a teacher, I want to review and approve student OD claims, so that I can verify participation and grant official leave.

#### Acceptance Criteria

1. WHEN a teacher navigates to the OD Claims page THEN the system SHALL display all OD claims where the teacher is tagged
2. WHEN viewing OD claims THEN the system SHALL provide filters for pending and accepted claims
3. WHEN a teacher approves an OD claim THEN the system SHALL update the status to "accepted" and create a notification for the student
4. WHEN a teacher rejects an OD claim THEN the system SHALL update the status to "rejected" and create a notification for the student
5. WHEN displaying OD claims THEN the system SHALL show student name, event name, submission date, and current status

### Requirement 17

**User Story:** As a user, I want to view a calendar with automatically populated events, so that I can track important dates and schedules.

#### Acceptance Criteria

1. WHEN a user navigates to the Calendar page THEN the system SHALL display a monthly calendar view
2. WHEN an announcement with a hashtag is created THEN the system SHALL extract event type, name, start date, and end date from the hashtag format `#type_eventName_startDate_endDate`
3. WHEN event dates are extracted THEN the system SHALL automatically add the event to the calendar
4. WHEN a user clicks a calendar date THEN the system SHALL display all events, exam schedules, and workshops scheduled for that date
5. WHEN displaying date details THEN the system SHALL show event name, type, and time information

### Requirement 18

**User Story:** As a teacher, I want to create exam schedules in the calendar, so that students can view upcoming assessments.

#### Acceptance Criteria

1. WHEN a teacher creates an exam schedule THEN the system SHALL require exam name, date, year, semester, and number of exams
2. WHEN an exam schedule is created THEN the system SHALL add it to the calendar on the specified date
3. WHEN a user clicks a date with exam schedules THEN the system SHALL display exam name, year, semester, and exam number
4. WHEN viewing the calendar THEN the system SHALL visually distinguish exam schedules from other events

### Requirement 19

**User Story:** As an admin, I want to create portals and tools with external links, so that users can access important campus resources.

#### Acceptance Criteria

1. WHEN an admin creates a portal THEN the system SHALL require title, description, and external link
2. WHEN an admin creates a tool THEN the system SHALL require title, description, and external link
3. WHEN a user navigates to the Portals section THEN the system SHALL display all portals with title, description, and clickable link
4. WHEN a user navigates to the Tools section THEN the system SHALL display all tools with title, description, and clickable link
5. WHEN a user clicks a portal or tool link THEN the system SHALL open the external URL

### Requirement 20

**User Story:** As a student or teacher, I want to submit queries to the admin, so that I can get help with issues or questions.

#### Acceptance Criteria

1. WHEN a student or teacher submits a query THEN the system SHALL require query title and description
2. WHEN a query is submitted THEN the system SHALL set status to "pending" and create a notification for the admin
3. WHEN a user views the Query page THEN the system SHALL display all their submitted queries with status
4. WHEN displaying queries THEN the system SHALL show query title, description, submission date, status, and admin response if available

### Requirement 21

**User Story:** As an admin, I want to view and respond to user queries, so that I can provide support and resolve issues.

#### Acceptance Criteria

1. WHEN an admin navigates to the Query section THEN the system SHALL display all queries from students and teachers
2. WHEN viewing queries THEN the system SHALL provide filters for pending and responded queries
3. WHEN an admin responds to a query THEN the system SHALL update the status to "responded" and store the response text
4. WHEN a query is responded to THEN the system SHALL create a notification for the query submitter
5. WHEN displaying queries THEN the system SHALL show submitter name, query title, description, submission date, and status

### Requirement 22

**User Story:** As a user, I want to receive notifications for important activities, so that I stay informed about interactions and updates.

#### Acceptance Criteria

1. WHEN a user receives a like on their content THEN the system SHALL create a notification with type "like" and content details
2. WHEN a user receives a comment on their content THEN the system SHALL create a notification with type "comment" and commenter information
3. WHEN a new announcement is posted THEN the system SHALL create notifications for all users
4. WHEN an OD claim status changes THEN the system SHALL create a notification for the student
5. WHEN an event reminder is due THEN the system SHALL create a notification for registered users
6. WHEN a user receives a message THEN the system SHALL create a notification with type "message" and sender information
7. WHEN a user views notifications THEN the system SHALL display unread notifications prominently
8. WHEN a user clicks a notification THEN the system SHALL mark it as read and navigate to the relevant content

### Requirement 23

**User Story:** As a student, I want to use a CGPA calculator, so that I can track my academic performance.

#### Acceptance Criteria

1. WHEN a student navigates to the CGPA Calculator THEN the system SHALL display input fields for course grades and credits
2. WHEN a student enters grades and credits THEN the system SHALL calculate and display the CGPA in real-time
3. WHEN calculating CGPA THEN the system SHALL use the standard formula: sum(grade_points × credits) / sum(credits)
4. WHEN a student adds or removes courses THEN the system SHALL recalculate the CGPA automatically
5. WHEN a student saves CGPA data THEN the system SHALL store it in the user's profile for future reference

### Requirement 24

**User Story:** As a user, I want to navigate the platform using a consistent layout with navbar and sidebar, so that I can easily access different sections.

#### Acceptance Criteria

1. WHEN a user is logged in THEN the system SHALL display a navbar with logo, search, notifications bell, and profile menu
2. WHEN a user is logged in THEN the system SHALL display a sidebar with navigation links appropriate to their role
3. WHEN a user clicks a sidebar link THEN the system SHALL navigate to the corresponding page without full page reload
4. WHEN a user clicks the notifications bell THEN the system SHALL display a dropdown with recent notifications
5. WHEN a user clicks their profile menu THEN the system SHALL display options for profile, settings, and logout

### Requirement 25

**User Story:** As a developer, I want all data operations to use Supabase directly from the frontend, so that the system remains simple and maintainable.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL establish a connection to Supabase using environment variables
2. WHEN performing any data operation THEN the system SHALL use Supabase client methods directly from React components or services
3. WHEN a user authenticates THEN the system SHALL use Supabase Auth for login and registration
4. WHEN storing user data THEN the system SHALL use Supabase database tables with proper schema definitions
5. WHEN uploading files THEN the system SHALL use Supabase Storage for file management
