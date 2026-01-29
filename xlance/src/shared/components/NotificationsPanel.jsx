import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';
import { useAuth } from '../../features/auth/context/AuthContext';

import { notificationService } from '../services/notificationService';

// For simplicity I'll use a custom formatter since date-fns is not installed

const formatTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notificationPermission, enableNotifications } = usePushNotifications(user?.uid);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleMarkAllRead = () => {
    // Optimistically UI update or wait for stream?
    // Stream will update automatically if we update DB.
    // Ideally we call service.markAllAsRead (stubbed) or iterate
    notifications.forEach(n => {
      if (!n.read) notificationService.markAsRead(n.id);
    });
  };

  const handleNotificationClick = async (notif) => {
    // 1. Determine Path
    let path = '/dashboard'; // default

    // Check metadata first
    if (notif.metadata?.type === 'chat') {
      path = `/messages`; // or /messages/${notif.relatedId} if implemented
    } else if (notif.metadata?.type === 'proposal' && notif.metadata?.jobId) {
      path = `/jobs/${notif.metadata.jobId}`; // Client views the job (and proposals drawer)
    } else if (notif.metadata?.type === 'project' && notif.metadata?.projectId) {
      path = `/projects`; // Simplify to projects list for now
    }

    // 2. Navigate (close panel first for smooth transition)
    onClose();
    navigate(path);

    // 3. Delete from list (as requested by user)
    // We do this AFTER navigation so it feels instant, but async
    await notificationService.deleteNotification(notif.id);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-16 right-0 w-80 md:w-96 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden z-[60]"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Bell size={16} className="text-primary-600" /> Notifications
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-white/60 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-primary-50/30'}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 p-1.5 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-blue-100 text-blue-600' :
                      notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {notif.type === 'success' ? <CheckCircle size={14} /> :
                        notif.type === 'warning' ? <AlertTriangle size={14} /> :
                          <Info size={14} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{notif.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatTime(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Bell size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center flex flex-col gap-2">
          {notificationPermission === 'default' && (
            <button
              onClick={() => enableNotifications()}
              className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 py-2 px-4 rounded-lg transition-colors w-full"
            >
              Enable Push Notifications
            </button>
          )}
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest"
          >
            Mark all as read
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationsPanel;
