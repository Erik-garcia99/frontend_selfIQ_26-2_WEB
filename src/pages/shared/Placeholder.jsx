import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';

// Página temporal para las rutas que se construyen en fases posteriores.
export default function Placeholder({ title, phase, description }) {
  return <>
    <PageHeader title={title} />
    <Card title="Próximamente">
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{description || 'Esta vista se construye en una fase posterior.'} (Fase {phase})</p>
    </Card>
  </>;
}
