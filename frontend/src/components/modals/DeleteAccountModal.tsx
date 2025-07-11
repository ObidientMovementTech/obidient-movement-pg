import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string, confirmationText: string) => void;
  email: string;
  isLoading: boolean;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  email,
  isLoading
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);

  const requiredConfirmation = `Delete account for ${email}`;

  useEffect(() => {
    // Check if form is valid (password entered and confirmation text matches)
    setIsValid(
      password.length > 0 &&
      confirmationText === requiredConfirmation
    );
  }, [password, confirmationText, requiredConfirmation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onConfirm(password, confirmationText);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setConfirmationText('');
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-red-600">
                    Delete Account
                  </DialogTitle>
                  {!isLoading && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Close"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <h4 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h4>
                    <p className="text-sm text-red-700 mt-1">
                      You're about to permanently delete your account and all associated data.
                      This includes your profile, cause memberships, and all other personal information.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Enter your password
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
                        To confirm, type "{requiredConfirmation}"
                      </label>
                      <input
                        type="text"
                        id="confirmation"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${!isValid || isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                          }`}
                        disabled={!isValid || isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          'Permanently Delete Account'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
