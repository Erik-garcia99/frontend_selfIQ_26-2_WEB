import { Button, Icon, useToast } from '../../components';
import styles from './admin.module.css';

// Muestra un token recién generado con botón de copiar.
export default function TokenBox({ token }) {
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(token); toast.success('Token copiado.'); }
    catch { toast.error('No se pudo copiar. Selecciona el texto y cópialo manualmente.'); }
  };
  return <div className={styles.tokenBox}>
    <code className={styles.tokenValue}>{token}</code>
    <Button size="sm" variant="secondary" onClick={copy} aria-label="Copiar token"><Icon name="copy" size={16} />Copiar</Button>
  </div>;
}
