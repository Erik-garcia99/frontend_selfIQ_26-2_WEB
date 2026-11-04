import { Icon } from './Icon';
import styles from './Card.module.css';

export function Card({ title, children, className = '', ...rest }) {
  return <section className={`${styles.card} ${className}`} {...rest}>
    {title && <h2 className={styles.title}>{title}</h2>}{children}</section>;
}

// tone: neutral | success | danger | info
export function Badge({ tone = 'neutral', dot = false, children }) {
  return <span className={[styles.badge, styles[tone]].filter(Boolean).join(' ')}>{dot && <span className={styles.dot} />}{children}</span>;
}

// Mensaje en línea para formularios (reemplaza al <Message> del móvil).
export function Notice({ tone = 'danger', children }) {
  if (!children) return null;
  return <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
    <Icon name={tone === 'success' ? 'check' : 'alert'} size={18} /><div>{children}</div></div>;
}
