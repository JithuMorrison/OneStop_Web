import PropTypes from 'prop-types';

/**
 * Skeleton loader for card components
 * Displays animated placeholder while content is loading
 */
const SkeletonCard = ({ variant = 'post', className = '' }) => {
  const variants = {
    post: (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {/* Header with avatar and name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>

        {/* Image placeholder */}
        <div className="h-48 bg-gray-200 rounded mb-4 animate-pulse" />

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    ),

    announcement: (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {/* Category badge */}
        <div className="h-6 bg-gray-200 rounded-full w-24 mb-3 animate-pulse" />

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>

        {/* Image */}
        <div className="h-56 bg-gray-200 rounded mb-4 animate-pulse" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    ),

    material: (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="h-9 bg-gray-200 rounded w-28 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    ),

    club: (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {/* Logo and name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Members */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse" />
          </div>
        </div>
      </div>
    ),

    list: (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    ),
  };

  return variants[variant] || variants.post;
};

SkeletonCard.propTypes = {
  variant: PropTypes.oneOf(['post', 'announcement', 'material', 'club', 'list']),
  className: PropTypes.string,
};

export default SkeletonCard;
