import { useState } from "react";
import { X, Mail, Phone, MessageCircle, Send } from "lucide-react";
import { InviteMemberForm } from "../../types/votingBloc";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteMemberForm) => Promise<void>;
  loading?: boolean;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  loading = false
}: InviteMemberModalProps) {
  const [form, setForm] = useState<InviteMemberForm>({
    email: '',
    phone: '',
    inviteType: 'email',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<InviteMemberForm>>({});

  const validateForm = () => {
    const newErrors: Partial<InviteMemberForm> = {};

    if (form.inviteType === 'email' && !form.email) {
      newErrors.email = 'Email is required for email invitations';
    } else if (form.inviteType === 'email' && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if ((form.inviteType === 'whatsapp' || form.inviteType === 'sms') && !form.phone) {
      newErrors.phone = 'Phone number is required for WhatsApp/SMS invitations';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Please include a personal message with your invitation';
    } else if (form.message.length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onInvite(form);
      setForm({
        email: '',
        phone: '',
        inviteType: 'email',
        message: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleInputChange = (field: keyof InviteMemberForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const defaultMessages = {
    email: "I'd like to invite you to join our voting bloc! Together, we can make a real difference in our community. Your voice and participation would be incredibly valuable to our cause.",
    whatsapp: "Hi! I'm inviting you to join our voting bloc. Let's work together to create positive change in our community 🗳️ Your voice matters!",
    sms: "You're invited to join our voting bloc! Together we can make a meaningful difference in our community. Hope you'll join us!"
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invitation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Invitation Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'email', icon: Mail, label: 'Email' },
                { type: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
                { type: 'sms', icon: Phone, label: 'SMS' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    handleInputChange('inviteType', type as any);
                    if (!form.message) {
                      handleInputChange('message', defaultMessages[type as keyof typeof defaultMessages]);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${form.inviteType === type
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          {form.inviteType === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter recipient's email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          )}

          {/* Phone Input */}
          {(form.inviteType === 'whatsapp' || form.inviteType === 'sms') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter phone number (e.g., +2348012345678)"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${errors.message ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Write a personal message to encourage them to join your bloc..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {form.message.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
