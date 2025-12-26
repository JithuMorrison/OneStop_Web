# Supabase Database Setup

This directory contains the database schema and setup instructions for the SSN Connect Portal.

## Files

- `migrations/001_initial_schema.sql` - Complete database schema with tables, indexes, RLS policies, and triggers
- `STORAGE_SETUP.md` - Instructions for setting up storage buckets

## Database Schema Overview

The migration creates the following tables:

### Core Tables

- **users** - User accounts with role-based access (student, teacher, admin)
- **clubs** - Student organizations with moderators
- **announcements** - Event announcements with registration support
- **posts** - User-generated content with visibility controls
- **materials** - Educational resources and files

### Activity Tables

- **od_claims** - On-duty claim requests and approvals
- **events** - Calendar events from announcements and exam schedules
- **exam_schedules** - Teacher-created exam schedules
- **registrations** - User registrations for announcements

### Communication Tables

- **chat_threads** - Chat conversations between users
- **messages** - Individual chat messages
- **notifications** - System notifications for users
- **queries** - User queries to admin

### Admin Tables

- **portals** - External portal links
- **tools** - External tool links

## Applying the Migration

### Option 1: Via Supabase Dashboard (Recommended for first-time setup)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify that all tables were created successfully in the **Table Editor**

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed and initialized:

```bash
# Make sure you're in the project root directory
cd /path/to/ssn-connect-portal

# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push

# Or apply migrations manually
supabase db reset
```

### Option 3: Via psql (Direct PostgreSQL connection)

If you have direct PostgreSQL access:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
```

## Post-Migration Steps

After applying the database migration:

1. **Set up Storage Buckets**: Follow instructions in `STORAGE_SETUP.md` to create the required storage buckets
2. **Verify RLS Policies**: Check that Row Level Security is enabled on all tables
3. **Test Authentication**: Create a test user to verify the authentication flow
4. **Check Indexes**: Verify that all indexes were created successfully
5. **Test Triggers**: Verify that the `updated_at` triggers are working

## Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- **Users**: Can read all profiles, update own profile, admin can update any
- **Clubs**: All can read, only admin can create, moderators can update their clubs
- **Announcements**: All can read, students/teachers can create, creators can update/delete
- **Posts**: Visibility-based read access, creators can update/delete
- **Materials**: All can read, authenticated users can upload, uploaders can update/delete
- **OD Claims**: Students see own claims, teachers see tagged claims, students create, teachers approve
- **Events**: All can read, teachers can create exam schedules
- **Chat/Messages**: Users can only access their own threads and messages
- **Notifications**: Users can only read/update their own notifications
- **Queries**: Users can read own queries, admin can read all and respond
- **Portals/Tools**: All can read, only admin can create/update/delete

## Database Indexes

The migration creates indexes on frequently queried fields:

- User email, role, digital_id, roll_number
- Foreign keys (created_by, uploaded_by, student_id, teacher_id, etc.)
- Date fields (created_at, start_date, end_date, date)
- Status fields (status, read)
- Array fields using GIN indexes (participants)

## Triggers

The migration includes triggers for automatic timestamp updates:

- `updated_at` is automatically updated on row modifications for:
  - users, clubs, announcements, posts, materials
  - od_claims, chat_threads

## Constraints

The schema includes several constraints to ensure data integrity:

- **users**: Student role requires 13-digit roll_number
- **materials**: Must have either file_url or external_link
- **registrations**: Unique constraint on (announcement_id, user_id)
- **Check constraints**: On role, visibility, status, and type fields

## Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### Issue: "relation already exists"

- The migration has already been applied
- Use `DROP TABLE IF EXISTS` or reset the database

### Issue: "permission denied"

- Ensure you're using a user with sufficient privileges
- Use the postgres user or service role key

### Issue: "RLS policies not working"

- Verify that `auth.uid()` returns the correct user ID
- Check that users are properly authenticated
- Test policies using the Supabase dashboard policy tester

### Issue: "Triggers not firing"

- Verify the trigger function was created successfully
- Check that triggers are attached to the correct tables
- Test by updating a row and checking the `updated_at` field

## Next Steps

After setting up the database:

1. Proceed to Task 3: Implement authentication system
2. Create test users for each role (student, teacher, admin)
3. Test RLS policies with different user roles
4. Set up storage buckets as per `STORAGE_SETUP.md`
5. Begin implementing the service layer functions

## Schema Modifications

If you need to modify the schema:

1. Create a new migration file: `002_your_change_description.sql`
2. Include both UP and DOWN migrations if possible
3. Test the migration on a development database first
4. Apply to production using the same method as the initial migration

## Backup

Before applying migrations to production:

```bash
# Backup via Supabase CLI
supabase db dump -f backup.sql

# Or via pg_dump
pg_dump -h your-db-host -U postgres -d postgres > backup.sql
```

## Support

For issues with:

- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **PostgreSQL**: Check [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **RLS Policies**: Check [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
