import { useEffect } from 'react';
import { useUiStore } from '@/store/ui-store';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useGlobalShortcuts() {
  const toggleCommand = useUiStore((s) => s.toggleCommand);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommand();
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === '/') {
        const search = document.querySelector<HTMLInputElement>('input[placeholder]');
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleCommand]);
}
