'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <button
          type="button"
          aria-label="Close modal"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative max-h-[90vh] w-full max-w-xl transform overflow-y-auto rounded-3xl border border-slate-200 bg-white text-left shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900/95 sm:my-8">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight dark:text-slate-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 shadow-sm transition-all duration-200 hover:bg-white hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-6 text-sm text-slate-600 dark:text-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
