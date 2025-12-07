// src/components/shared/ClubCard.jsx
import React from 'react';
import { FaEdit } from 'react-icons/fa';

/**
 * ClubCard component displays club information
 * @param {Object} props
 * @param {Object} props.club - Club data
 * @param {boolean} props.canEdit - Whether user can edit this club
 * @param {Function} props.onEdit - Callback when edit button is clicked
 */
const ClubCard = ({ club, canEdit = false, onEdit }) => {
  if (!club) {
    return null;
  }

  const {
    name,
    logo,
    description,
    subdomains = [],
    members = [],
    works_done = [],
    moderators = []
  } = club;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all card-hover">
      {/* Header with logo and name */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {logo && (
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64?text=Club';
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{name}</h3>
            {subdomains.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                {subdomains.map((subdomain, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 sm:py-1 rounded badge badge-primary"
                  >
                    {subdomain}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit button for authorized users */}
        {canEdit && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(club);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all flex-shrink-0 touch-manipulation"
            title="Edit club"
            aria-label="Edit club"
          >
            <FaEdit size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">{description}</p>

      {/* Members with roles */}
      {members.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Members</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="text-xs sm:text-sm bg-gray-100 text-gray-700 px-2.5 sm:px-3 py-1 rounded-full badge"
              >
                {member.userId?.name || member.name || 'Unknown'} 
                {member.role && (
                  <span className="text-gray-500 ml-1">({member.role})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderators */}
      {moderators.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Moderators</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {moderators.map((moderator, index) => (
              <div
                key={index}
                className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-2.5 sm:px-3 py-1 rounded-full badge"
              >
                {moderator.userId?.name || moderator.name || 'Unknown'} 
                <span className="text-purple-500 ml-1">
                  ({moderator.type === 'teacher' ? 'Teacher' : 'Student'})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Works done */}
      {works_done.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Works Done</h4>
          <ul className="list-disc list-inside space-y-1">
            {works_done.map((work, index) => (
              <li key={index} className="text-sm text-gray-600">
                {work}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state for works done */}
      {works_done.length === 0 && (
        <p className="text-sm text-gray-400 italic">No works documented yet</p>
      )}
    </div>
  );
};

export default ClubCard;
