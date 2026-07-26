'use client';

/**
 * @file src/components/Modal.js
 * @description Komponen Dialog Modal reusable dengan listener tombol Escape & Enter.
 * @author Arnevin Renata Ahmad Barkah
 */

import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, onSubmit, onEnter, title, children, maxWidth = 'max-w-md' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) {
          onClose();
        }
      } else if (e.key === 'Enter') {
        const targetTagName = e.target?.tagName?.toLowerCase();
        if (targetTagName === 'textarea' || targetTagName === 'button') return;

        if (onSubmit) {
          e.preventDefault();
          onSubmit(e);
        } else if (onEnter) {
          e.preventDefault();
          onEnter(e);
        } else if (targetTagName !== 'input' && modalRef.current) {
          const form = modalRef.current.querySelector('form');
          if (form) {
            e.preventDefault();
            if (typeof form.requestSubmit === 'function') {
              form.requestSubmit();
            } else {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          } else {
            const submitBtn = modalRef.current.querySelector('button[type="submit"]');
            if (submitBtn) {
              e.preventDefault();
              submitBtn.click();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onSubmit, onEnter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition"
              aria-label="Tutup modal"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
