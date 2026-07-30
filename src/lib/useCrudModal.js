'use client';
/**
 * @description Hook bersama untuk mengatur state modal dan hasil Server Action CRUD.
 * @author Arnevin Renata Ahmad Barkah
 */


import { useActionState, useCallback, useState } from 'react';

let instanceCounter = 0;

export function useCrudModal({ action, onSuccess }) {
  // ID dan key membuat isi form di-reset setiap kali modal dibuka kembali.
  const [instanceId] = useState(() => instanceCounter++);
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const handleAction = useCallback(async (prevState, formData) => {
    const res = await action(prevState, formData);
    // Modal hanya ditutup jika server menyatakan operasi berhasil.
    // Saat gagal, modal tetap terbuka agar pesan validasi dapat dibaca pengguna.
    if (res?.success) {
      setIsOpen(false);
      setItem(null);
      onSuccess?.();
    }
    return res;
  }, [action, onSuccess]);

  const [state, formAction, pending] = useActionState(handleAction, null);

  const open = useCallback((item = null) => {
    // item berisi data lama untuk mode edit/hapus; mode tambah memakai null.
    setModalKey(k => k + 1);
    setItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItem(null);
  }, []);

  return { isOpen, item, state, pending, action: formAction, open, close, key: `${instanceId}-${modalKey}` };
}
