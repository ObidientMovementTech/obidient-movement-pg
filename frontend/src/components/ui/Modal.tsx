import React, { useEffect, useRef } from 'react';
import ModalPortal from './ModalPortal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;

      // Check if click is outside modal
      if (modalRef.current && !modalRef.current.contains(target)) {
        // Don't close if clicking on dropdown elements or their children
        const isDropdownElement = target.closest('[data-modal-ignore="true"]') ||
          target.hasAttribute('data-modal-ignore');

        if (!isDropdownElement) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" aria-hidden="true" />
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={modalRef}
            className={`modal-content bg-white rounded-lg shadow-xl overflow-hidden ${maxWidth} w-full mx-auto`}
          >
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-medium">{title || 'Modal'}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Modal;
