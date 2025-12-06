/**
 * Example file demonstrating how to use error handling and loading utilities
 * This file shows best practices for implementing error handling and loading states
 */

import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { handleError, retryWithBackoff } from './errorHandler.jsx';
import useLoading from '../hooks/useLoading.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import LoadingButton from '../components/shared/LoadingButton.jsx';
import SkeletonCard from '../components/shared/SkeletonCard.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';

/**
 * Example 1: Using toast notifications for errors
 */
export const ExampleWithToast = () => {
  const toast = useToast();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
      toast.success('Data loaded successfully!');
    } catch (error) {
      const handledError = handleError(error, 'Fetching data');
      toast.error(handledError.message);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Load Data</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
};

/**
 * Example 2: Using useLoading hook
 */
export const ExampleWithLoadingHook = () => {
  const { isLoading, error, withLoading } = useLoading();
  const [posts, setPosts] = useState([]);

  const loadPosts = withLoading(async () => {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to load posts');
    const data = await response.json();
    setPosts(data);
  });

  useEffect(() => {
    loadPosts();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading posts..." />;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
};

/**
 * Example 3: Using LoadingButton for form submission
 */
export const ExampleFormWithLoadingButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ data: 'example' }),
      });

      if (!response.ok) throw new Error('Submission failed');

      toast.success('Form submitted successfully!');
    } catch (error) {
      const handledError = handleError(error, 'Submitting form');
      toast.error(handledError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Enter data" />
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit
      </LoadingButton>
    </form>
  );
};

/**
 * Example 4: Using skeleton loaders while fetching data
 */
export const ExampleWithSkeletonLoader = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard variant="post" />
        <SkeletonCard variant="post" />
        <SkeletonCard variant="post" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Be the first to create a post!"
        actionLabel="Create Post"
        onAction={() => console.log('Create post')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-white p-4 rounded shadow">
          {post.title}
        </div>
      ))}
    </div>
  );
};

/**
 * Example 5: Using retry logic for network errors
 */
export const ExampleWithRetry = () => {
  const toast = useToast();
  const [data, setData] = useState(null);

  const fetchWithRetry = async () => {
    try {
      const result = await retryWithBackoff(
        async () => {
          const response = await fetch('/api/data');
          if (!response.ok) throw new Error('Network error');
          return response.json();
        },
        3, // max retries
        1000 // initial delay
      );

      setData(result);
      toast.success('Data loaded successfully!');
    } catch (error) {
      const handledError = handleError(error, 'Loading data');
      toast.error(handledError.message);
    }
  };

  return (
    <div>
      <button onClick={fetchWithRetry}>Load Data with Retry</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
};

/**
 * Example 6: Complete page with all features
 */
export const CompleteExample = () => {
  const toast = useToast();
  const { isLoading, error, withLoading } = useLoading();
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Load items on mount
  useEffect(() => {
    const loadItems = withLoading(async () => {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to load items');
      const data = await response.json();
      setItems(data);
    });

    loadItems().catch(err => {
      toast.error(handleError(err, 'Loading items').message);
    });
  }, []);

  // Create new item
  const createItem = async (itemData) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const newItem = await response.json();
      setItems(prev => [...prev, newItem]);
      toast.success('Item created successfully!');
    } catch (error) {
      toast.error(handleError(error, 'Creating item').message);
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard variant="list" />
        <SkeletonCard variant="list" />
        <SkeletonCard variant="list" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        title="No items found"
        description="Get started by creating your first item"
        actionLabel="Create Item"
        onAction={() => createItem({ name: 'New Item' })}
      />
    );
  }

  // Success state with data
  return (
    <div>
      <div className="mb-4">
        <LoadingButton
          loading={isCreating}
          loadingText="Creating..."
          onClick={() => createItem({ name: 'New Item' })}
        >
          Create Item
        </LoadingButton>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded shadow">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  ExampleWithToast,
  ExampleWithLoadingHook,
  ExampleFormWithLoadingButton,
  ExampleWithSkeletonLoader,
  ExampleWithRetry,
  CompleteExample,
};
