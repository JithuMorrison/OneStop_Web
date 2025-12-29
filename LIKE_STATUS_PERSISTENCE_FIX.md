# Like Status Persistence Fix - Complete

## Problem

After page refresh, the like status (red heart) was not showing correctly even though the user had liked the content.

## Root Cause

The card components were trying to get `userId` from `localStorage.getItem('userId')`, but the actual user data is stored as a JSON object in `localStorage.getItem('user')`.

## Solution

Updated all card components to properly extract the user ID from the stored user object:

### PostCard.jsx

```javascript
const getCurrentUserId = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user._id || user.id;
  }
  return localStorage.getItem("userId"); // Fallback
};
const currentUserId = getCurrentUserId();
const isLiked = post.liked_by?.includes(currentUserId);
```

### MaterialCard.jsx

```javascript
const getCurrentUserId = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user._id || user.id;
  }
  return localStorage.getItem("userId"); // Fallback
};
const currentUserId = getCurrentUserId();
const isLiked = material.liked_by?.includes(currentUserId);
```

### AnnouncementCard.jsx

Already receives `currentUserId` as a prop from parent components, so no changes needed.

## How It Works Now

### On Page Load:

1. Backend returns posts/materials/announcements with their `liked_by` arrays
2. Each array contains user IDs of users who liked that content
3. Cards extract current user's ID from localStorage user object
4. Cards check if current user ID is in the `liked_by` array
5. If found → Show red filled heart (FaHeart)
6. If not found → Show gray outline heart (FaRegHeart)

### On Like/Unlike:

1. User clicks like button
2. API call updates the `liked_by` array in database
3. Frontend updates local state with new `liked_by` array
4. Card re-renders with correct heart icon

### After Refresh:

1. Fresh data fetched from backend with correct `liked_by` arrays
2. Cards check current user ID against `liked_by` arrays
3. Correct like status displayed (persisted!)

## Backend Data Flow

### Posts Endpoint (`GET /api/posts`)

```javascript
const posts = await Post.find(filter)
  .populate("created_by", "name email role username")
  .sort({ createdAt: -1 });
// Returns posts with liked_by arrays
```

### Materials Endpoint (`GET /api/materials`)

```javascript
const materials = await Material.find({})
  .populate("uploaded_by", "name email role username")
  .sort({ createdAt: -1 });
// Returns materials with liked_by arrays
```

### Announcements Endpoint (`GET /api/announcements`)

```javascript
const announcements = await Announcement.find(filter)
  .populate("created_by", "name email role username")
  .sort({ createdAt: -1 });
// Returns announcements with liked_by arrays
```

## Testing Checklist

✅ Like a post → See red heart
✅ Refresh page → Red heart still shows
✅ Unlike post → See gray outline heart
✅ Refresh page → Gray outline heart still shows
✅ Like a material → See red heart
✅ Refresh page → Red heart still shows
✅ Like an announcement → See red heart
✅ Refresh page → Red heart still shows
✅ View profile → Liked content shows red hearts
✅ View Posts page → Liked posts show red hearts
✅ View Materials page → Liked materials show red hearts
✅ View Announcements page → Liked announcements show red hearts

## Files Modified

1. `src/components/shared/PostCard.jsx` - Updated to get user ID from user object
2. `src/components/shared/MaterialCard.jsx` - Updated to get user ID from user object

## No Backend Changes Needed

The backend was already working correctly:

- Schemas have `liked_by` arrays
- Endpoints return full objects with `liked_by` arrays
- Like/unlike endpoints update the arrays correctly

The issue was purely on the frontend - getting the correct user ID to compare against the `liked_by` arrays.
