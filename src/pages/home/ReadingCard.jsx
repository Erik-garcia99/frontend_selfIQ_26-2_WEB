import { Badge, Button, Card, Icon } from '../../components';
import { formatTime } from '../../utils/format';
import styles from './Home.module.css';

const BADGE_TONE = { cold: 'info', comfortable: 'success', hot: 'danger', available: 'success', unavailable: 'neutral' };

// Tarjeta grande de una lectura en vivo (aforo / temperatura).
// reading = salida de temperaturePresentation / occupancyPresentation.
export default function ReadingCard({ icon, title, reading, telemetry, value, unit, showBadge = true }) {
  const measuredAt = formatTime(telemetry.data?.measured_at);
  return <Card className={styles.reading} data-tone={reading.tone} aria-label={title}>
    <div className={styles.head}>
      <span className={styles.icon}><Icon name={icon} size={22} /></span>
      <span className={styles.name}>{title}</span>
      {showBadge && <Badge tone={BADGE_TONE[reading.tone]}>{reading.status}</Badge>}
    </div>
    <div className={styles.value} aria-live="polite">{value}{unit && <> <span className={styles.unit}>{unit}</span></>}</div>
    <p className={styles.detail}>{reading.detail}</p>
    {telemetry.error && <p className={styles.reason}>Motivo: {telemetry.error}{telemetry.errorStatus ? ` (HTTP ${telemetry.errorStatus})` : ''}</p>}
    <div className={styles.foot}>
      <span>{measuredAt ? `Última lectura: ${measuredAt}` : 'Sin lectura reciente'}</span>
      {telemetry.error && <Button size="sm" variant="secondary" onClick={telemetry.refresh}><Icon name="refresh" size={16} />Reintentar</Button>}
    </div>
  </Card>;
}
