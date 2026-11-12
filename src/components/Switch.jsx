import styles from './Switch.module.css';
export function Switch({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} className={`${styles.switch} ${checked ? styles.on : ''}`} onClick={() => onChange(!checked)}>
    <span className={styles.knob} />{label && <span className={styles.label}>{label}</span>}
  </button>;
}