/**
 * @description Hook menyatukan state + transition + handler untuk operasi CRUD (create, update, delete).
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { useState, useTransition } from 'react';

export function useCrudActions({ create, update, remove, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const [createState, setCreateState] = useState(null);
  const [isCreatePending, startCreateTransition] = useTransition();
  const [updateState, setUpdateState] = useState(null);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [deleteState, setDeleteState] = useState(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleCreate = (formData) => {
    startCreateTransition(async () => {
      const res = await create(null, formData);
      setCreateState(res);
      if (res?.success && onCreateSuccess) onCreateSuccess(formData);
    });
  };

  const handleUpdate = (formData) => {
    startUpdateTransition(async () => {
      const res = await update(null, formData);
      setUpdateState(res);
      if (res?.success && onUpdateSuccess) onUpdateSuccess(formData);
    });
  };

  const handleDelete = (formData) => {
    startDeleteTransition(async () => {
      const res = await remove(null, formData);
      setDeleteState(res);
      if (res?.success && onDeleteSuccess) onDeleteSuccess(formData);
    });
  };

  return {
    create: { state: createState, pending: isCreatePending, action: handleCreate, reset: () => setCreateState(null) },
    update: { state: updateState, pending: isUpdatePending, action: handleUpdate, reset: () => setUpdateState(null) },
    delete: { state: deleteState, pending: isDeletePending, action: handleDelete, reset: () => setDeleteState(null) },
  };
}
