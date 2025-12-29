# Group Chat Feature - Implementation Plan

## ✅ Frontend Created

- `src/pages/shared/GroupChat.jsx` - Complete group chat interface

## 🔧 Backend Requirements (To Be Implemented)

### 1. Group Chat Schema

```javascript
const GroupChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["world", "custom", "club"], required: true },
  club_id: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});
```

### 2. Group Message Schema

```javascript
const GroupMessageSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupChat",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

### 3. Required Backend Endpoints

#### Get All Groups (User's Groups)

```
GET /api/group-chats
- Returns all groups user is a member of
- Includes World Chat automatically
```

#### Create Group

```
POST /api/group-chats
Body: { name, description, type, club_id?, members[] }
- Creates new group
- Adds creator and selected members
```

#### Get Group Messages

```
GET /api/group-chats/:groupId/messages
- Returns all messages for a group
- Populates sender info
```

#### Send Message

```
POST /api/group-chats/:groupId/messages
Body: { message }
- Sends message to group
- Validates user is member
```

#### Add Members

```
POST /api/group-chats/:groupId/members
Body: { members[] }
- Adds new members to group
```

#### Search Users

```
GET /api/users/search?q=query
- Searches users by name or email
- Returns user list
```

### 4. World Chat Setup

Create a default "World Chat" group on server startup:

```javascript
// In server initialization
const createWorldChat = async () => {
  const existing = await GroupChat.findOne({ type: "world" });
  if (!existing) {
    await GroupChat.create({
      name: "World Chat",
      description: "Public chat for everyone",
      type: "world",
      created_by: null,
      members: [], // Empty - everyone has access
    });
  }
};
```

## Features Implemented in Frontend

### 1. Group Types

- ✅ **World Chat**: Public chat for all users
- ✅ **Custom Groups**: User-created groups
- ✅ **Club Groups**: Groups linked to clubs

### 2. Group Management

- ✅ Create new groups
- ✅ Select group type
- ✅ Add description
- ✅ Search and add members
- ✅ Link to clubs (for club groups)

### 3. Messaging

- ✅ Send messages
- ✅ Real-time message display
- ✅ Message polling (every 3 seconds)
- ✅ Show sender name
- ✅ Show message time
- ✅ Date separators
- ✅ Own messages on right (blue)
- ✅ Others' messages on left (white)

### 4. UI Features

- ✅ Groups sidebar
- ✅ Selected group highlighting
- ✅ Group icons (World, Club, Custom)
- ✅ Member count display
- ✅ Auto-scroll to latest message
- ✅ Create group modal
- ✅ User search with results dropdown
- ✅ Selected members chips
- ✅ Responsive design

## Next Steps to Complete

1. **Add Backend Schemas** to `backend.cjs`
2. **Create Backend Endpoints** for group chats
3. **Add Route** to `App.jsx`
4. **Add Navigation Link** to Sidebar
5. **Test** all functionality

## Usage Flow

### Creating a Group

1. Click "+" button in sidebar
2. Select group type (Custom or Club)
3. If Club: Select which club
4. Enter group name and description
5. Search and add members
6. Click "Create Group"

### Sending Messages

1. Select group from sidebar
2. Type message in input
3. Click "Send" or press Enter
4. Message appears immediately

### World Chat

- Automatically available to all users
- No need to join or create
- Everyone can see and send messages

## File Structure

```
src/
  pages/
    shared/
      GroupChat.jsx          ✅ Created
  services/
    groupChatService.jsx     ⏳ To create (optional)
```

## Route Addition

```javascript
// In App.jsx
import GroupChat from "./pages/shared/GroupChat.jsx";

<Route
  path="/group-chat"
  element={
    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
      <GroupChat />
    </ProtectedRoute>
  }
/>;
```

## Sidebar Addition

```javascript
{
  path: '/group-chat',
  icon: FaUsers,
  label: 'Group Chat',
  roles: ['student', 'teacher']
}
```

## Benefits

1. **World Chat**: Campus-wide communication
2. **Custom Groups**: Study groups, project teams
3. **Club Groups**: Official club communication
4. **Real-time**: Messages update every 3 seconds
5. **User-friendly**: Easy to create and manage groups
6. **Searchable**: Find users by name or email
7. **Organized**: Clear message history with timestamps

## Future Enhancements (Optional)

- WebSocket for real-time updates (instead of polling)
- Message reactions
- File sharing in groups
- Group admin roles
- Leave group functionality
- Delete messages
- Edit group details
- Typing indicators
- Read receipts
- Message notifications
