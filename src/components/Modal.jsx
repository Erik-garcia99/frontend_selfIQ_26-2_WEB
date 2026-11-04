import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import styles from './Modal.module.css';

// Modal accesible: Esc para cerrar, clic fuera, foco al abrir y bloqueo del scroll.
// footer: nodos (botones) que se alinean a la derecha. busy impide cerrar.
export function Modal({ open, title, children, footer, onClose, busy = false, hideClose = false, center = false }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, busy, onClose]);
  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose?.(); }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`${styles.dialog} ${center ? styles.center : ''}`}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title} style={center ? { flex: 1 } : undefined}>{title}</h2>
          {!hideClose && <button type="button" className={styles.close} onClick={onClose} disabled={busy} aria-label="Cerrar"><Icon name="x" size={18} /></button>}
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>, document.body);
}
