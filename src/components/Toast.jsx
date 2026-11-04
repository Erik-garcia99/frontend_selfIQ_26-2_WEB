import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import styles from './Toast.module.css';

// const toast = useToast();  toast.success('Guardado');  toast.error('No se pudo guardar');
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);
  const dismiss = useCallback((id) => setItems((list) => list.filter((item) => item.id !== id)), []);
  const push = useCallback((tone, message, ms = 4500) => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-3), { id, tone, message }]);
    if (ms) setTimeout(() => dismiss(id), ms);
  }, [dismiss]);
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m, 7000) }), [push]);
  return <ToastContext.Provider value={api}>
    {children}
    <div className={styles.stack} aria-live="polite">
      {items.map((item) => <div key={item.id} className={`${styles.toast} ${styles[item.tone]}`} role={item.tone === 'error' ? 'alert' : 'status'}>
        <Icon name={item.tone === 'success' ? 'check' : 'alert'} size={18} />
        <span className={styles.msg}>{item.message}</span>
        <button type="button" className={styles.close} onClick={() => dismiss(item.id)} aria-label="Cerrar aviso"><Icon name="x" size={16} /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export function useToast() { return useContext(ToastContext); }
