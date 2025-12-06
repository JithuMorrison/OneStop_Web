# Layout Components

This directory contains the main layout components for SSN Connect Portal.

## Components

### Navbar

The top navigation bar with logo, search, notifications, and profile menu.

**Features:**

- Logo with link to dashboard
- Search bar for users and content
- Notification bell with dropdown
- Profile menu with logout
- Responsive design (collapses on mobile)

**Props:**

- `notifications` (Array): Array of notification objects
- `onNotificationClick` (Function): Callback when notification is clicked

**Usage:**

```jsx
import Navbar from "./components/layout/Navbar";

<Navbar
  notifications={notifications}
  onNotificationClick={handleNotificationClick}
/>;
```

### Sidebar

The side navigation with role-based links.

**Features:**

- Role-based navigation links (student, teacher, admin)
- Collapsible behavior
- Active link highlighting
- Mobile bottom navigation

**Props:**

- `isCollapsed` (Boolean, optional): Whether sidebar is collapsed
- `onToggle` (Function, optional): Callback when sidebar is toggled

**Usage:**

```jsx
import Sidebar from "./components/layout/Sidebar";

<Sidebar
  isCollapsed={isCollapsed}
  onToggle={() => setIsCollapsed(!isCollapsed)}
/>;
```

### RightPanel

The toggleable chat panel on the right side.

**Features:**

- Contact list display
- Chat thread selection
- Message history
- Real-time messaging (when integrated with backend)
- User search by email

**Props:**

- `isOpen` (Boolean): Whether the panel is open
- `onToggle` (Function): Callback to toggle panel visibility

**Usage:**

```jsx
import RightPanel from "./components/layout/RightPanel";

<RightPanel isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />;
```

## Complete Layout Example

Here's how to use all three components together in a page:

```jsx
import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import RightPanel from "./components/layout/RightPanel";

const MyPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleNotificationClick = (notification) => {
    // Handle notification click
    console.log("Notification clicked:", notification);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar at the top */}
      <Navbar
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      <div className="flex">
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-6">
          <h1>Page Content</h1>
          {/* Your page content here */}
        </main>

        {/* Chat panel on the right (toggleable) */}
        <RightPanel
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </div>
  );
};

export default MyPage;
```

## Notes

### Integration with Backend

The RightPanel component currently uses mock data. To integrate with the backend:

1. Create a `chatService.jsx` in `src/services/`
2. Implement the following methods:

   - `getChatThreads(userId)` - Get user's chat threads
   - `getMessages(threadId)` - Get messages for a thread
   - `sendMessage(threadId, userId, content)` - Send a message
   - `createChatThread(userId, otherUserId)` - Create a new chat thread

3. Update the `userService.jsx` to include:
   - `searchUserByEmail(email)` - Search users by email
   - `getContacts(userId)` - Get user's contacts

### Responsive Design

All components are fully responsive:

- **Navbar**: Collapses to hamburger menu on mobile
- **Sidebar**: Shows as bottom navigation on mobile
- **RightPanel**: Full-width overlay on mobile (when implemented)

### Accessibility

All components include:

- ARIA labels for buttons
- Keyboard navigation support
- Focus management
- Semantic HTML

### Styling

Components use Tailwind CSS for styling. Key classes:

- `sticky top-0 z-50` - Navbar stays at top
- `fixed bottom-0` - Mobile sidebar at bottom
- `fixed right-0` - Chat panel on right side
