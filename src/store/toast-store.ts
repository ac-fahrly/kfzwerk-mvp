import { create } from 'zustand';
import { newId } from '@/lib/id';

export type ToastKind = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = newId();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push({ kind: 'success', title, description }),
  error: (title: string, description?: string) => useToastStore.getState().push({ kind: 'error', title, description }),
  info: (title: string, description?: string) => useToastStore.getState().push({ kind: 'info', title, description }),
};
