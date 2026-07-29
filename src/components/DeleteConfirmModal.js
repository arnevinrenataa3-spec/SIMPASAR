/**
 * @description Modal konfirmasi hapus standar — dipakai semua entitas.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import Modal from './Modal.js';
import AlertBanner from './AlertBanner.js';

export default function DeleteConfirmModal({ isOpen, onClose, itemName, onConfirm, isPending, itemId, state }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus" submitOnEnter={false}>
      <form action={onConfirm} className="space-y-6">
        {itemId != null && <input type="hidden" name="id" value={itemId} />}

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            Anda yakin ingin menghapus <strong className="text-slate-100">{itemName}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <AlertBanner state={state} />

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white border border-rose-500 hover:bg-rose-500 transition disabled:opacity-50"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
