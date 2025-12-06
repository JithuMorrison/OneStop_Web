import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import RightPanel from './RightPanel.jsx';
import { useAuth } from '../../context/UserContext.jsx';

/**
 * Layout component - Wraps authenticated pages with Navbar, Sidebar, and optional RightPanel
 * Provides consistent layout structure across all authenticated pages
 * @param {Object} props - Component props
 * @param {boolean} props.showChat - Whether to show the chat panel (default: false)
 */
const Layout = ({ showChat = false }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  /**
   * Toggle sidebar collapsed state
   */
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  /**
   * Toggle chat panel
   */
  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Fixed on left (Desktop) / Bottom (Mobile) */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={handleSidebarToggle} 
        />

        {/* Main Content - Scrollable */}
        <main 
          id="main-content"
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:ml-0' : 'md:ml-0'
          } ${isChatOpen && showChat ? 'lg:mr-80' : 'mr-0'} pb-20 md:pb-6`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>

        {/* Right Panel - Chat (Optional) - Desktop only */}
        {showChat && (
          <RightPanel 
            isOpen={isChatOpen}
            onToggle={handleChatToggle}
            userId={user?._id || user?.id}
          />
        )}
      </div>

      {/* Chat Toggle Button (Floating) - Mobile only */}
      {showChat && !isChatOpen && (
        <button
          onClick={handleChatToggle}
          className="fixed bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center z-30 lg:hidden touch-manipulation"
          aria-label="Open chat"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Mobile Chat Overlay */}
      {showChat && isChatOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={handleChatToggle}
          aria-label="Close chat overlay"
        />
      )}
    </div>
  );
};

export default Layout;
