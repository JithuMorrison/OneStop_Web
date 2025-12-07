# Chat System Implementation

## Overview

The chat system has been implemented with two components:

1. **RightPanel** - A toggleable side panel for chat (used in main layout)
2. **ChatPanel** - A standalone embeddable chat component (for use in pages like Profile)

## Components

### RightPanel (`src/components/layout/RightPanel.jsx`)

A fixed-position chat panel that slides in from the right side of the screen.

**Usage:**

```jsx
import RightPanel from "./components/layout/RightPanel.jsx";

<RightPanel
  isOpen={isPanelOpen}
  onToggle={() => setIsPanelOpen(!isPanelOpen)}
  userId={currentUser.id}
  targetUserId={optionalTargetUserId} // Optional: auto-start chat with this user
/>;
```

**Features:**

- Toggleable visibility
- User search by email
- Chat thread list
- Real-time message updates (polling every 3 seconds)
- Auto-scroll to latest message
- Contact list from previous chats

### ChatPanel (`src/components/shared/ChatPanel.jsx`)

A standalone chat component that can be embedded in any page.

**Usage:**

```jsx
import ChatPanel from "./components/shared/ChatPanel.jsx";

<ChatPanel
  targetUserId={userId} // Optional: auto-start chat with this user
  className="h-[600px]" // Optional: custom styling
/>;
```

**Features:**

- Same functionality as RightPanel
- Embeddable in any page layout
- Fixed height with scrollable content
- Ideal for Profile pages

## Chat Service (`src/services/chatService.jsx`)

Handles all chat-related API calls to the MongoDB backend.

**Available Functions:**

### `createChatThread(userId)`

Creates or retrieves an existing chat thread with a user.

```javascript
const chat = await chatService.createChatThread(targetUserId);
```

### `sendMessage(chatId, content)`

Sends a message in a chat thread.

```javascript
await chatService.sendMessage(chatId, "Hello!");
```

### `getChatMessages(chatId)`

Retrieves all messages for a chat thread.

```javascript
const chat = await chatService.getChatMessages(chatId);
```

### `getChatThreads()`

Gets all chat threads for the current user.

```javascript
const threads = await chatService.getChatThreads();
```

### `pollMessages(chatId, callback, interval)`

Sets up polling for real-time message updates.

```javascript
const cleanup = chatService.pollMessages(
  chatId,
  (messages) => {
    setMessages(messages);
  },
  3000
);

// Call cleanup() to stop polling
cleanup();
```

### `pollChatThreads(callback, interval)`

Sets up polling for real-time chat thread list updates.

```javascript
const cleanup = chatService.pollChatThreads((threads) => {
  setChatThreads(threads);
}, 5000);

// Call cleanup() to stop polling
cleanup();
```

## Backend API Endpoints

The chat service connects to these MongoDB backend endpoints:

- `GET /api/chat/:userId` - Create or get chat thread with user
- `POST /api/chat/:chatId/message` - Send message
- `GET /api/chat/:chatId/messages` - Get messages for thread
- `GET /api/chats` - Get all user's chat threads

## Real-time Updates

The chat system uses **polling** for real-time updates:

- **Messages**: Polls every 3 seconds when a chat is open
- **Chat Threads**: Polls every 5 seconds when panel is open
- Polling automatically stops when components unmount or panels close

## Message Auto-Expiration

Messages automatically expire after **10 hours** (configured in backend MongoDB schema).

## Integration Examples

### In Profile Page

```jsx
import ChatPanel from "../components/shared/ChatPanel.jsx";

function Profile({ userId }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">{/* Profile content */}</div>
      <div className="col-span-1">
        <ChatPanel targetUserId={userId} className="h-[600px]" />
      </div>
    </div>
  );
}
```

### In Main Layout

```jsx
import RightPanel from "./components/layout/RightPanel.jsx";

function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Navbar onChatToggle={() => setChatOpen(!chatOpen)} />
      <main>{children}</main>
      <RightPanel
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        userId={user.id}
      />
    </>
  );
}
```

## Requirements Validated

This implementation validates the following requirements:

- **14.1**: Display all chat threads from user's chats array ✓
- **14.2**: Search for users by email ✓
- **14.3**: Create chat threads and add to both users' chats arrays ✓
- **14.4**: Send messages and update contacts array ✓
- **14.5**: Create notifications for received messages (handled by backend)
- **14.6**: Real-time message updates via polling ✓

## Correctness Properties

The implementation supports these correctness properties:

- **Property 46**: Chat thread display completeness
- **Property 47**: User search by email
- **Property 48**: Chat thread creation bidirectional
- **Property 49**: Message sending side effects
- **Property 50**: Real-time message updates
