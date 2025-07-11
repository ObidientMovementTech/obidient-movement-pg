import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalContextProps {
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
  portalContainer: HTMLElement | null;  // Added this property
}

const ModalContext = createContext<ModalContextProps>({
  showModal: () => { },
  hideModal: () => { },
  portalContainer: null, // Initialize with null
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or find modal root element
    let element = document.getElementById('modal-root');

    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      Object.assign(element.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        pointerEvents: 'none', // Only the modal itself will catch events
      });
      document.body.appendChild(element);
    }

    setPortalContainer(element);

    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  const showModal = (content: React.ReactNode) => {
    setModalContent(content);
    if (portalContainer) {
      portalContainer.style.pointerEvents = 'auto';
    }
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  };

  const hideModal = () => {
    setModalContent(null);
    if (portalContainer) {
      portalContainer.style.pointerEvents = 'none';
    }
    document.body.style.overflow = ''; // Re-enable scrolling
  };

  return (
    <ModalContext.Provider value={{
      showModal,
      hideModal,
      portalContainer // Added to the value object
    }}>
      {children}
      {portalContainer && modalContent ? createPortal(
        <div
          onClick={hideModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>,
        portalContainer
      ) : null}
    </ModalContext.Provider>
  );
};
