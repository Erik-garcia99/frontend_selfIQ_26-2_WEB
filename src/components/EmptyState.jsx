import { Icon } from './Icon';
import styles from './EmptyState.module.css';

export function EmptyState({ icon = 'alert', title, children, action }) {
  return <div className={styles.empty}>
    <div className={styles.icon}><Icon name={icon} size={26} /></div>
    <p className={styles.title}>{title}</p>
    {children && <p className={styles.text}>{children}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>;
}
