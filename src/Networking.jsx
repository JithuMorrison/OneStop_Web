import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Networking = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <Link to="/networking/feed" className="flex items-center px-2 py-4 text-gray-500 hover:text-gray-700">
                Feed
              </Link>
              <Link to="/networking/profile" className="flex items-center px-2 py-4 text-gray-500 hover:text-gray-700">
                Profile
              </Link>
              <Link to="/networking/search" className="flex items-center px-2 py-4 text-gray-500 hover:text-gray-700">
                Search & Chat
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default Networking;