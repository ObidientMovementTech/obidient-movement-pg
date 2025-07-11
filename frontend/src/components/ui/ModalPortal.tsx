import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../context/ModalContext';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const { portalContainer } = useModal();
  const [mounted, setMounted] = useState<boolean>(false); // Explicitly define the type as boolean

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !portalContainer || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        isolation: 'isolate'
      }}
    >
      {children}
    </div>,
    portalContainer
  );
};

export default ModalPortal;
