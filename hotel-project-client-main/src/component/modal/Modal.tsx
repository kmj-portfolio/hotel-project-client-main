import React, { useEffect, useRef } from 'react';

import { createPortal } from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  full?: boolean;
}

const Modal = ({ isOpen, onClose, children, full = false }: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const dialog = modalRef.current;

    if (!dialog) return;

    if (isOpen) {
      // 백버튼 모달 Close 로직
      window.history.pushState({ modal: true }, '');
      const handlePopState = () => {
        onClose();
        console.log('pop');
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <dialog
      className={`z-50 mx-auto min-h-svh w-full touch-none overflow-hidden bg-transparent backdrop:bg-black/40 ${full ? 'min-w-[100vw] md:min-w-0' : 'w-full'} flex items-center justify-center`}
      ref={modalRef}
      onClose={() => onClose()}
    >
      <div
        className={`relative w-full bg-white p-5 md:max-w-[500px] ${full ? 'h-svh md:h-auto md:rounded-2xl' : 'rounded-2xl'}`}
      >
        {children}
      </div>
    </dialog>,
    document.getElementById('modal') as HTMLDivElement,
  );
};

export default Modal;
