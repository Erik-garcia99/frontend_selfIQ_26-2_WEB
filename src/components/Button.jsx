import styles from './Button.module.css';

export function Button({ children, variant = 'primary', size, full = false, loading = false, loadingLabel = 'Procesando…', disabled = false, type = 'button', className = '', ...rest }) {
  const classes = [styles.btn, styles[variant], size === 'sm' && styles.sm, full && styles.full, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
    {loading && <span className={styles.spinner} aria-hidden="true" />}
    {loading ? loadingLabel : children}
  </button>;
}
