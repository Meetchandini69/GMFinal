import { useState } from 'react';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

let listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(toast: Toast) {
  memoryState = [...memoryState, toast];
  listeners.forEach((l) => l(memoryState));
  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== toast.id);
    listeners.forEach((l) => l(memoryState));
  }, 4000);
}

export function toast(props: Omit<Toast, 'id'>) {
  dispatch({ ...props, id: Math.random().toString(36).slice(2) });
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryState);

  const subscribe = (fn: (t: Toast[]) => void) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { const unsub = subscribe(setToasts); return unsub; });

  return { toasts, toast };
}
