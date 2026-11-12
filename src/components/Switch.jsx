import { useId } from 'react';
import styles from './Switch.module.css';

// <Switch label="Stock bajo" description="..." checked={v} onChange={(next) => ...} />
export function Switch({ label, description, checked, onChange, disabled = false }) {
  const id = useId();
  return <div className={styles.row}>
    <div className={styles.text}>
      <span id={`${id}-label`} className={styles.label}>{label}</span>
      {description && <span id={`${id}-desc`} className={styles.desc}>{description}</span>}
    </div>
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-label`} aria-describedby={description ? `${id}-desc` : undefined}
      disabled={disabled} onClick={() => onChange(!checked)} className={`${styles.track} ${checked ? styles.on : ''}`}>
      <span className={styles.thumb} />
    </button>
  </div>;
}
