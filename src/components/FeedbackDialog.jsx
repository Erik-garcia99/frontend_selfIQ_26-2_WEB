import { Modal } from './Modal';
import { Button } from './Button';
import styles from './Modal.module.css';

// Equivalente web del FeedbackDialog del móvil: resultado de una operación con
// código corto para soporte y una pista en lenguaje normal.
// variant: 'success' | 'error'
export function FeedbackDialog({ open, variant = 'success', title, message, code, hint, actionLabel = 'Entendido', onClose }) {
  const error = variant === 'error';
  const color = error ? 'var(--danger)' : 'var(--success-text)';
  return <Modal open={open} title={title} onClose={onClose} hideClose center
    footer={<Button full variant={error ? 'primary' : 'primary'} onClick={onClose}>{actionLabel}</Button>}>
    <div className={styles.glyph} style={{ color, borderColor: color }} aria-hidden="true">{error ? '!' : '✓'}</div>
    {error && code && <div className={styles.code}>Código de error: {code}</div>}
    <p>{message}</p>
    {hint && <p className={styles.hint}>{hint}</p>}
  </Modal>;
}
