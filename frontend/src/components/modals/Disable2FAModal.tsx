import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XCircle } from 'lucide-react';

interface Disable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  isLoading: boolean;
}

export default function Disable2FAModal({
  isOpen,
  onClose,
  onVerify,
  isLoading
}: Disable2FAModalProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      onVerify(code);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Disable Two-Factor Authentication
                  </Dialog.Title>
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
                  <p className="text-sm text-gray-500 mb-4">
                    Please enter the authentication code from your authenticator app to disable 2FA.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                        Authentication Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006837] focus:border-[#006837] sm:text-sm"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        autoComplete="off"
                        minLength={6}
                        maxLength={6}
                        pattern="[0-9]+"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006837]"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006837] ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                          }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Disabling...
                          </span>
                        ) : (
                          'Disable 2FA'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
