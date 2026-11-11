import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, PageHeader } from '../../components';

// El backend todavía no tiene endpoint de alertas; los tipos salen de las
// preferencias de notificación que ya existen (settingsService).
const TYPES = [
  ['Stock bajo', 'Cuando un producto llegue a un nivel bajo.'],
  ['Aforo máximo', 'Cuando la sucursal alcance su capacidad.'],
  ['Temperatura fuera de rango', 'Cuando haga demasiado frío o calor.'],
  ['Dispositivos sin conexión', 'Cuando un gateway o nodo deje de reportar.'],
];

export default function Alerts() {
  return <>
    <PageHeader title="Alertas" subtitle="Avisos de tu sucursal." />
    <Card>
      <EmptyState icon="bell" title="Sin alertas por ahora"
        action={<Link to="/ajustes"><Button variant="secondary">Configurar notificaciones</Button></Link>}>
        Cuando haya algo que revisar en tu sucursal aparecerá aquí.
      </EmptyState>
    </Card>
    <Card title="Qué avisos puedes recibir" style={{ marginTop: 20 }}>
      <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'grid', gap: 12 }}>
        {TYPES.map(([name, text]) => <li key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Badge tone="info">{name}</Badge><span style={{ color: 'var(--muted)', fontSize: 14 }}>{text}</span></li>)}
      </ul>
    </Card>
  </>;
}
