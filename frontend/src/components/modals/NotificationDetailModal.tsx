import { X, Clock, Megaphone } from "lucide-react";

interface NotificationDetailModalProps {
  notification: {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: string;
  } | null;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
}

export default function NotificationDetailModal({
  notification,
  onClose,
  formatDate,
  getTypeIcon,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getTypeIcon(notification.type)}
            </div>
            <h3 className="font-semibold text-lg text-gray-800">{notification.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {notification.type === 'adminBroadcast' && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-md flex items-center gap-2 text-orange-600">
              <Megaphone size={16} />
              <span className="text-sm font-medium">This is an official platform announcement from the administration.</span>
            </div>
          )}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap break-words">{notification.message}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-500" />
            <span className="text-sm text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
