import { forwardRef, useId, useState } from 'react';
import { Icon } from './Icon';
import styles from './Field.module.css';

// <Field label="Correo" type="email" value={v} onChange={(e) => ...} />
// type="password" añade el botón de mostrar / ocultar.
export const Field = forwardRef(function Field({ label, hint, error, type = 'text', className = '', ...rest }, ref) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return <div className={`${styles.group} ${className}`}>
    {label && <label htmlFor={id} className={styles.label}>{label}</label>}
    <div className={styles.wrap}>
      <input ref={ref} id={id} type={isPassword && shown ? 'text' : type} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy}
        className={[styles.input, error && styles.invalid, isPassword && styles.withToggle].filter(Boolean).join(' ')} {...rest} />
      {isPassword && <button type="button" className={styles.toggle} onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}><Icon name={shown ? 'eyeOff' : 'eye'} size={18} /></button>}
    </div>
    {error ? <span id={`${id}-error`} className={styles.error} role="alert">{error}</span> : hint ? <span id={`${id}-hint`} className={styles.hint}>{hint}</span> : null}
  </div>;
});
