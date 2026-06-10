import React from 'react';
import { useApp } from '@/lib/context';
import { Bell, UserPlus, Film, MessageCircle, Star, CheckCircle, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'crew_request_received': return <UserPlus className="w-4 h-4 text-cinema-red" />;
      case 'crew_request_accepted': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'recommendation_received': return <Film className="w-4 h-4 text-purple-400" />;
      case 'verdict_received': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-bone/60" />;
    }
  };

  const getLink = (notification: any) => {
    switch (notification.type) {
      case 'crew_request_received': 
      case 'crew_request_accepted': 
        return '/profile?tab=crew';
      case 'recommendation_received': 
      case 'verdict_received': 
        return `/title/${notification.resource_id || notification.resourceId}`; // Fallback for either snake_case or camelCase
      default: return '#';
    }
  };

  return (
    <>
      {/* Backdrop for mobile closing */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="
        fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#0a0a0a] rounded-t-2xl max-h-[85vh] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
        sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px] sm:max-h-none sm:rounded-lg sm:border sm:border-white/10 sm:shadow-[0_24px_70px_rgba(2,0,0,0.42)]
        origin-bottom sm:origin-top-right animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200
      ">
        <div className="flex items-center justify-between px-4 py-4 sm:py-3 border-b border-white/5 bg-[#111111]">
          <h3 className="text-sm font-medium text-bone tracking-wide">NOTIFICATIONS</h3>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllNotificationsAsRead()}
                className="text-xs text-bone/50 hover:text-bone transition-colors"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="sm:hidden text-bone/50 hover:text-bone p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar sm:max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center flex flex-col items-center">
              <Bell className="w-8 h-8 text-white/10 mb-2" />
              <p className="text-sm text-bone/40">You're all caught up.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <Link 
                  key={notif.id}
                  href={getLink(notif)}
                  className={`relative group flex gap-3 p-4 border-b border-white/5 transition-colors hover:bg-white/[0.02] ${!notif.read ? 'bg-white/[0.04]' : ''}`}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    onClose();
                  }}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cinema-red" />
                  )}

                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${!notif.read ? 'border-white/20 bg-white/5' : 'border-white/5 bg-transparent'}`}>
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="block focus:outline-none">
                      <p className={`text-sm ${!notif.read ? 'text-bone font-medium' : 'text-bone/70'}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-bone/50 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                      )}
                      <p className="text-[10px] text-bone/30 mt-1.5 uppercase tracking-wider">
                        {new Date(notif.createdAt || new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-bone/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-all absolute right-2 top-1/2 -translate-y-1/2"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
