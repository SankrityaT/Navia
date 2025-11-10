'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    router.push(`/peers/chat/${notification.connectionId}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-[var(--stone)] rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-[var(--charcoal)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-[var(--sand)] rounded-2xl shadow-2xl border border-[var(--clay-300)]/30 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--clay-300)]/30 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--charcoal)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[var(--clay-600)] hover:text-[var(--clay-700)] font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--charcoal)]/60">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-[var(--clay-400)]" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-[var(--stone)]/50 transition-colors border-b border-[var(--clay-300)]/20 ${
                      !notification.read ? 'bg-[var(--sage-50)]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center text-[var(--cream)] font-bold text-sm flex-shrink-0">
                        {notification.peerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--charcoal)] text-sm">
                          {notification.peerName}
                        </p>
                        <p className="text-sm text-[var(--charcoal)]/70 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--charcoal)]/50 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[var(--sage-500)] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
