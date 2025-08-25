import { useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { sendPrivateMessage } from '../../services/adminBroadcastService';
import Modal from '../Modal';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  onSuccess?: () => void;
}

const messageTypes = [
  { value: 'notice', label: 'Notice' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'alert', label: 'Alert' },
  { value: 'update', label: 'Update' }
];

export function SendMessageModal({ isOpen, onClose, user, onSuccess }: SendMessageModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('notice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!user) return;

    if (!title.trim() || !message.trim()) {
      setError('Please fill in both title and message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPrivateMessage(
        user.id,
        title,
        message,
        messageType as 'notice' | 'announcement' | 'alert' | 'update'
      );

      setTitle('');
      setMessage('');
      setMessageType('notice');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending private message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-content relative bg-white rounded-lg p-6 max-w-lg w-full">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Send Private Message</h2>

        {user && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient
              </label>
              <div className="text-sm text-gray-500">
                {user.name} ({user.email})
              </div>
            </div>

            <div>
              <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 mb-1">
                Message Type
              </label>
              <select
                id="messageType"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                {messageTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter message title"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
