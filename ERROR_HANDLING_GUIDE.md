# Error Handling and Loading States Guide

This guide explains how to use the error handling and loading state utilities in the SSN Connect Portal.

## Table of Contents

1. [Error Handling](#error-handling)
2. [Toast Notifications](#toast-notifications)
3. [Loading States](#loading-states)
4. [Error Boundaries](#error-boundaries)
5. [Best Practices](#best-practices)

## Error Handling

### Error Handler Utility

The `errorHandler.jsx` utility provides centralized error handling with user-friendly messages.

```javascript
import { handleError, retryWithBackoff } from "./utils/errorHandler.jsx";

// Handle an error
try {
  await someAsyncOperation();
} catch (error) {
  const handledError = handleError(error, "Operation context");
  console.log(handledError.message); // User-friendly message
}

// Retry with exponential backoff
const result = await retryWithBackoff(
  async () => await fetchData(),
  3, // max retries
  1000 // initial delay in ms
);
```

### Error Types

The error handler automatically categorizes errors:

- `AUTH` - Authentication errors
- `VALIDATION` - Input validation errors
- `AUTHORIZATION` - Permission errors
- `DATABASE` - Database operation errors
- `NETWORK` - Network/connection errors
- `FILE_UPLOAD` - File upload errors
- `GENERIC` - General errors

## Toast Notifications

### Using Toast Context

Wrap your app with `ToastProvider` (already done in App.jsx):

```javascript
import { ToastProvider } from "./context/ToastContext.jsx";

<ToastProvider>
  <YourApp />
</ToastProvider>;
```

### Displaying Toasts

```javascript
import { useToast } from "./context/ToastContext.jsx";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong!");
  };

  const handleWarning = () => {
    toast.warning("Please review your input");
  };

  const handleInfo = () => {
    toast.info("New feature available!");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### Toast Options

```javascript
// Custom duration (in milliseconds)
toast.success("Message", 3000);

// Persistent toast (duration = 0)
toast.error("Critical error", 0);

// Clear all toasts
toast.clearAll();
```

## Loading States

### Loading Spinner

Simple spinner component for inline loading indicators:

```javascript
import LoadingSpinner from "./components/shared/LoadingSpinner.jsx";

<LoadingSpinner size="md" text="Loading..." />;
```

Sizes: `sm`, `md`, `lg`, `xl`

### Loading Page

Full-page loading component:

```javascript
import LoadingPage from "./components/shared/LoadingPage.jsx";

if (isLoading) {
  return <LoadingPage message="Loading data..." />;
}
```

### Loading Button

Button with built-in loading state:

```javascript
import LoadingButton from "./components/shared/LoadingButton.jsx";

<LoadingButton
  loading={isSubmitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
  variant="primary"
  size="md"
>
  Submit Form
</LoadingButton>;
```

Variants: `primary`, `secondary`, `danger`, `success`, `outline`

### useLoading Hook

Custom hook for managing loading states:

```javascript
import useLoading from "./hooks/useLoading.jsx";

function MyComponent() {
  const { isLoading, error, withLoading } = useLoading();

  const fetchData = withLoading(async () => {
    const response = await fetch("/api/data");
    return response.json();
  });

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Data loaded!</div>;
}
```

### Skeleton Loaders

Animated placeholders while content loads:

```javascript
import SkeletonCard from "./components/shared/SkeletonCard.jsx";

if (isLoading) {
  return (
    <div className="space-y-4">
      <SkeletonCard variant="post" />
      <SkeletonCard variant="announcement" />
      <SkeletonCard variant="material" />
    </div>
  );
}
```

Variants: `post`, `announcement`, `material`, `club`, `list`

### Empty State

Display when there's no data:

```javascript
import EmptyState from "./components/shared/EmptyState.jsx";
import { FiInbox } from "react-icons/fi";

if (items.length === 0) {
  return (
    <EmptyState
      icon={FiInbox}
      title="No items found"
      description="Get started by creating your first item"
      actionLabel="Create Item"
      onAction={handleCreate}
    />
  );
}
```

## Error Boundaries

Error boundaries catch React errors and display fallback UI:

```javascript
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error("Error caught:", error, errorInfo);
  }}
  onReset={() => {
    // Reset component state
  }}
>
  <YourComponent />
</ErrorBoundary>;
```

The app is already wrapped with an ErrorBoundary at the root level.

## Best Practices

### 1. Always Handle Errors

```javascript
// ❌ Bad
const fetchData = async () => {
  const response = await fetch("/api/data");
  return response.json();
};

// ✅ Good
const fetchData = async () => {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  } catch (error) {
    const handledError = handleError(error, "Fetching data");
    toast.error(handledError.message);
    throw error;
  }
};
```

### 2. Show Loading States

```javascript
// ❌ Bad
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(setData);
}, []);

return <div>{data?.title}</div>;

// ✅ Good
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData()
    .then(setData)
    .finally(() => setIsLoading(false));
}, []);

if (isLoading) return <LoadingSpinner />;
return <div>{data?.title}</div>;
```

### 3. Use Skeleton Loaders for Better UX

```javascript
// ❌ Acceptable
if (isLoading) return <LoadingSpinner />;

// ✅ Better
if (isLoading) {
  return (
    <div className="space-y-4">
      <SkeletonCard variant="post" />
      <SkeletonCard variant="post" />
    </div>
  );
}
```

### 4. Handle Empty States

```javascript
// ❌ Bad
return (
  <div>
    {items.map((item) => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
);

// ✅ Good
if (items.length === 0) {
  return <EmptyState title="No items found" />;
}

return (
  <div>
    {items.map((item) => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
);
```

### 5. Provide User Feedback

```javascript
// ❌ Bad
const handleSubmit = async () => {
  await submitForm();
};

// ✅ Good
const handleSubmit = async () => {
  try {
    await submitForm();
    toast.success("Form submitted successfully!");
  } catch (error) {
    toast.error(handleError(error, "Submitting form").message);
  }
};
```

### 6. Use Loading Buttons for Actions

```javascript
// ❌ Bad
<button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>

// ✅ Good
<LoadingButton
  loading={isSubmitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
>
  Submit
</LoadingButton>
```

### 7. Implement Retry Logic for Network Errors

```javascript
// ✅ Good
const fetchWithRetry = async () => {
  try {
    return await retryWithBackoff(
      async () => {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error("Network error");
        return response.json();
      },
      3, // max retries
      1000 // initial delay
    );
  } catch (error) {
    toast.error("Failed to load data after multiple attempts");
    throw error;
  }
};
```

## Complete Example

Here's a complete example combining all utilities:

```javascript
import { useState, useEffect } from "react";
import { useToast } from "./context/ToastContext.jsx";
import { handleError } from "./utils/errorHandler.jsx";
import useLoading from "./hooks/useLoading.jsx";
import LoadingButton from "./components/shared/LoadingButton.jsx";
import SkeletonCard from "./components/shared/SkeletonCard.jsx";
import EmptyState from "./components/shared/EmptyState.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

function PostsPage() {
  const toast = useToast();
  const { isLoading, error, withLoading } = useLoading();
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Load posts
  useEffect(() => {
    const loadPosts = withLoading(async () => {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to load posts");
      return response.json();
    });

    loadPosts()
      .then(setPosts)
      .catch((err) => {
        toast.error(handleError(err, "Loading posts").message);
      });
  }, []);

  // Create post
  const createPost = async (postData) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const newPost = await response.json();
      setPosts((prev) => [...prev, newPost]);
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(handleError(error, "Creating post").message);
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard variant="post" />
        <SkeletonCard variant="post" />
        <SkeletonCard variant="post" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error.message}</p>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Be the first to create a post!"
        actionLabel="Create Post"
        onAction={() => createPost({ title: "New Post" })}
      />
    );
  }

  // Success state
  return (
    <ErrorBoundary>
      <div>
        <LoadingButton
          loading={isCreating}
          loadingText="Creating..."
          onClick={() => createPost({ title: "New Post" })}
        >
          Create Post
        </LoadingButton>

        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded shadow">
              <h3>{post.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default PostsPage;
```

## Integration with Existing Code

The error handling and loading utilities are already integrated into the app:

1. **App.jsx** - Wrapped with `ErrorBoundary` and `ToastProvider`
2. **Loading Page** - Used for initial app loading
3. All components can now use these utilities

To integrate into existing pages:

1. Import the utilities you need
2. Replace existing loading indicators with the new components
3. Add error handling with toast notifications
4. Use skeleton loaders for better UX

## Testing

When testing components that use these utilities:

```javascript
import { render, screen } from "@testing-library/react";
import { ToastProvider } from "./context/ToastContext.jsx";

test("shows error toast on failure", async () => {
  render(
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  );

  // Trigger error
  // Assert toast is shown
});
```

## Additional Resources

- See `src/utils/errorHandlingExample.jsx` for more examples
- Check existing service files for error handling patterns
- Review component implementations for loading state examples
