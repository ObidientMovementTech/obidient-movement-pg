import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Cog, Menu, X, User, LogOut, Settings, HelpCircle, CheckCheck, ExternalLink } from "lucide-react";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../../../services/notificationService";
import { logoutUser } from "../../../services/authService";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface DashboardHeaderProps {
  title: string;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  setActivePage?: (page: string) => void;
}

export default function DashboardHeader({ title, isSidebarOpen, toggleSidebar, setActivePage }: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Handle notifications dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }

      // Handle settings dropdown
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;
  const topNotifications = notifications.slice(0, 5);

  // Utility function to format time in a human-readable way
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      // Format date like "Jun 11" for older notifications
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Handle opening a specific notification
  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Mark the notification as read in the backend
      await markNotificationAsRead(notificationId);

      // Update the local state to reflect the notification as read
      setNotifications(
        notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );

      // Navigate to the notifications page using the same method as "View all"
      setDropdownOpen(false);
      handleViewAll();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleViewAll = () => {
    // Set the page in sessionStorage first
    sessionStorage.setItem("dashboardPage", "Notifications");

    // If we're already on dashboard, force a refresh to trigger the sessionStorage read
    if (window.location.pathname === '/dashboard') {
      window.location.reload();
    } else {
      // Otherwise, navigate to dashboard (sessionStorage will be read on load)
      navigate("/dashboard");
    }
  };

  return (
    <header className="w-full px-6 py-4 bg-white border-b border-gray-300 flex justify-between items-center font-poppins shadow-sm relative z-10">
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button
            className="md:hidden p-2 text-[#006837] rounded-md hover:bg-[#8cc63f]/20 transition-colors"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <h1 className="text-xl md:text-xl font-semibold capitalize">{title}</h1>
      </div>

      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Notification Button */}
        <div
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="relative p-2 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-all group"
          aria-label="Notifications"
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#006837]' : 'text-gray-600'} group-hover:text-[#006837]`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#8cc63f] text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>          {/* Notification Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-[340px] bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 z-40 animate-fadeIn">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#f8fcf9] to-white">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[#006837]" />
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#8cc63f] text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-[#006837] hover:text-[#00592e] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#006837]/5 transition-colors"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await markAllNotificationsAsRead();
                      // Update the local state to reflect all notifications as read
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                    } catch (error) {
                      console.error("Failed to mark all as read:", error);
                    }
                  }}
                >
                  <CheckCheck size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
            {topNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-14 h-14 bg-[#f8fcf9] rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-[#8cc63f]/20">
                  <Bell size={24} className="text-[#8cc63f]" />
                </div>
                <p className="text-sm text-gray-700 font-medium">No notifications</p>
                <p className="text-xs text-gray-500 mt-1.5 max-w-[80%] mx-auto">You're all caught up! We'll notify you when there's something new.</p>
              </div>
            ) : (
              <ul className="max-h-[320px] overflow-y-auto divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded scrollbar-track-gray-50 hover:scrollbar-thumb-gray-400">
                {topNotifications.map((n) => (
                  <li key={n._id} className={`relative ${!n.read ? 'bg-[#f8fcf9]' : ''} transition-all duration-200`}>
                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8cc63f]"></div>}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleNotificationClick(n._id)}>
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium text-sm ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                          {!n.read && (
                            <span className="inline-block ml-2 w-2 h-2 bg-[#8cc63f] rounded-full"></span>
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 mt-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full">
                          {formatTimeAgo(new Date(n.createdAt))}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 mt-1">
                        {n.message}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="py-2.5 px-4 border-t border-gray-100 bg-gradient-to-r from-[#f8fcf9] to-white">
              <button
                className="text-xs flex items-center justify-center w-full text-[#006837] hover:text-[#00592e] font-medium gap-1.5 py-1.5 hover:bg-[#006837]/5 rounded transition-colors"
                onClick={() => {
                  setDropdownOpen(false);
                  handleViewAll();
                }}
              >
                <span>View all notifications</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div ref={settingsRef} className="relative">
          <div
            onClick={() => setSettingsOpen(prev => !prev)}
            className="p-2 rounded-md bg-white shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all group"
          >
            <Cog className="w-5 h-5 text-gray-600 group-hover:text-[#006837]" />
          </div>

          {/* Settings Dropdown */}
          {settingsOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 z-50 animate-fadeIn">
              <div className="p-3 border-b border-gray-100 font-medium text-gray-800 flex items-center gap-2 bg-gradient-to-r from-[#f8fcf9] to-white">
                <Settings size={16} className="text-[#006837]" />
                Settings
              </div>

              <ul className="py-1 divide-y divide-gray-50">
                <li>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      // Navigate to profile within dashboard
                      if (typeof setActivePage === 'function') {
                        setActivePage('My Profile');
                      }
                      if (typeof toggleSidebar === 'function' && window.innerWidth < 768) {
                        toggleSidebar(); // Close sidebar if on mobile
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 w-full text-left transition"
                  >
                    <User size={16} className="text-[#006837]" />
                    <span>My Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      // Navigate to account settings
                      if (typeof setActivePage === 'function') {
                        setActivePage('Account Settings');
                      }
                      if (typeof toggleSidebar === 'function' && window.innerWidth < 768) {
                        toggleSidebar(); // Close sidebar if on mobile
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 w-full text-left transition"
                  >
                    <Settings size={16} className="text-[#8cc63f]" />
                    <span>Account Settings</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      // Navigate to help and support
                      if (typeof setActivePage === 'function') {
                        setActivePage('Help & Support');
                      }
                      if (typeof toggleSidebar === 'function' && window.innerWidth < 768) {
                        toggleSidebar(); // Close sidebar if on mobile
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 w-full text-left transition"
                  >
                    <HelpCircle size={16} className="text-blue-500" />
                    <span>Help & Support</span>
                  </button>
                </li>
                <li className="border-t">
                  <button
                    onClick={async () => {
                      try {
                        await logoutUser();
                        window.location.href = '/auth/login';
                      } catch (error) {
                        console.error('Logout failed:', error);
                        // Fallback to local logout if API call fails
                        localStorage.removeItem('token');
                        window.location.href = '/auth/login';
                      }
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
