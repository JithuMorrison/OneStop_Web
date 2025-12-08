// src/components/shared/ClubCard.jsx
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * ClubCard component displays club information
 * @param {Object} props
 * @param {Object} props.club - Club data
 * @param {boolean} props.canEdit - Whether user can edit this club
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 */
const ClubCard = ({ club, canEdit = false, onEdit, onDelete }) => {
  const [moderatorsWithDetails, setModeratorsWithDetails] = useState([]);
  const [loadingModerators, setLoadingModerators] = useState(false);

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

  // Fetch moderator details when component mounts or moderators change
  useEffect(() => {
    const fetchModeratorDetails = async () => {
      if (moderators.length === 0) return;

      setLoadingModerators(true);
      try {
        const token = localStorage.getItem('token');
        const moderatorPromises = moderators.map(async (mod) => {
          // If moderator already has name, use it
          if (mod.name || mod.userId?.name) {
            return mod;
          }

          // Otherwise fetch user details
          const userId = mod.userId?._id || mod.userId;
          if (!userId) return mod;

          try {
            const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const userData = await response.json();
              return {
                ...mod,
                name: userData.name,
                email: userData.email,
                userId: userData._id
              };
            }
          } catch (error) {
            console.error('Error fetching moderator details:', error);
          }

          return mod;
        });

        const detailedModerators = await Promise.all(moderatorPromises);
        setModeratorsWithDetails(detailedModerators);
      } catch (error) {
        console.error('Error fetching moderators:', error);
        setModeratorsWithDetails(moderators);
      } finally {
        setLoadingModerators(false);
      }
    };

    fetchModeratorDetails();
  }, [moderators.length]);

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

        {/* Edit and Delete buttons for authorized users */}
        {canEdit && (
          <div className="flex gap-2">
            {onEdit && (
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
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete "${club.name}"? This action cannot be undone.`)) {
                    onDelete(club._id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all flex-shrink-0 touch-manipulation"
                title="Delete club"
                aria-label="Delete club"
              >
                <FaTrash size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">{description}</p>

      {/* Members grouped by subdomain */}
      {members.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Members</h4>
          {(() => {
            // Group members by subdomain
            const grouped = members.reduce((acc, member) => {
              const subdomain = member.subdomain || member.role || 'General';
              if (!acc[subdomain]) {
                acc[subdomain] = [];
              }
              acc[subdomain].push(member);
              return acc;
            }, {});

            return Object.entries(grouped).map(([subdomain, subdomainMembers]) => (
              <div key={subdomain} className="mb-2">
                <p className="text-xs font-medium text-gray-600 mb-1">{subdomain}:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-2">
                  {subdomainMembers.map((member, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm bg-gray-100 text-gray-700 px-2.5 sm:px-3 py-1 rounded-full badge cursor-help"
                      title={member.email || member.userId?.email || 'No email provided'}
                    >
                      {member.name || member.userId?.name || 'Unknown'}
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Moderators */}
      {moderators.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Moderators</h4>
          {loadingModerators ? (
            <div className="text-xs text-gray-500">Loading moderators...</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {moderatorsWithDetails.map((moderator, index) => (
                <div
                  key={index}
                  className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-2.5 sm:px-3 py-1 rounded-full badge"
                  title={moderator.email || ''}
                >
                  {moderator.name || moderator.userId?.name || 'Unknown'} 
                  <span className="text-purple-500 ml-1">
                    ({moderator.type === 'teacher' ? 'Teacher' : 'Student'})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {club.links && club.links.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Links</h4>
          <div className="flex flex-wrap gap-2">
            {club.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                {link.name}
                <span className="text-blue-400">↗</span>
              </a>
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
