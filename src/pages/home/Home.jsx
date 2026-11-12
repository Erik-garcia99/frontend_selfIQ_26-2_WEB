import { Link } from 'react-router-dom';
import { Badge, Card, Icon, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { useTemperature } from '../../utils/useTemperature';
import { useOccupancy } from '../../utils/useOccupancy';
import { useApiStatus } from '../../utils/useApiStatus';
import { temperaturePresentation } from '../../utils/temperature';
import { occupancyPresentation } from '../../utils/occupancy';
import { canCreateBranch, canManage } from '../../utils/validation';
import ReadingCard from './ReadingCard';
import styles from './Home.module.css';

// Sin lecturas todavía: el backend no expone inventario, estantes ni alertas (igual que el móvil).
const KPIS = [
  { label: 'Estantes', icon: 'shelves' },
  { label: 'Inventario', icon: 'box' },
  { label: 'Alertas', icon: 'bell', to: '/alertas' },
];

function Kpi({ label, icon, to }) {
  const body = <>
    <span className={styles.kpiIcon}><Icon name={icon} size={22} /></span>
    <div><div className={styles.kpiName}>{label}</div><div className={styles.kpiValue}>Sin lecturas</div></div>
  </>;
  return to ? <Link to={to} className={`${styles.kpi} ${styles.kpiLink}`}>{body}</Link>
    : <Card className={styles.kpi}>{body}</Card>;
}

export default function Home() {
  const { user, accessToken } = useAuth();
  const { branches, branchId, loadingBranches } = useDevices();
  const online = useApiStatus();
  const temperature = useTemperature(accessToken, branchId, { waiting: loadingBranches });
  const occupancy = useOccupancy(accessToken, branchId, { waiting: loadingBranches });
  const temperatureReading = temperaturePresentation(temperature);
  const occupancyReading = occupancyPresentation(occupancy);
  const branch = branches.find((item) => item.id === branchId);
  const people = occupancy.data?.occupancy;
  const occupancyUnit = occupancyReading.tone === 'available' ? (people === 1 ? 'persona' : 'personas') : null;

  const actions = [
    canCreateBranch(user) && { to: '/sucursales/nueva', icon: 'plus', title: 'Crear sucursal', detail: 'Usar el token global de empresa' },
    canManage(user) && { to: '/dispositivos/agregar', icon: 'plus', title: 'Agregar dispositivo', detail: 'Buscar y registrar dispositivos' },
    canManage(user) && { to: '/dispositivos', icon: 'devices', title: 'Dispositivos', detail: 'Consulta los equipos de tu sucursal' },

    { to: '/ajustes', icon: 'user', title: 'Mi cuenta', detail: 'Consultar datos y sesión' },
  ].filter(Boolean);

  return <>
    <PageHeader title={`Hola, ${user?.first_name || 'usuario'}`}
      subtitle={branch?.name || (loadingBranches ? 'Cargando sucursal…' : 'Administración de empresa')}
      actions={<Badge tone={online === null ? 'neutral' : online ? 'success' : 'danger'} dot>{online === null ? 'Conectando…' : online ? 'Conectado' : 'Sin conexión'}</Badge>} />

    <div className={styles.readings}>
      <ReadingCard icon="users" title="Aforo actual" reading={occupancyReading} telemetry={occupancy}
        value={occupancyReading.label} unit={occupancyUnit} showBadge={occupancyReading.tone === 'unavailable'} />
      <ReadingCard icon="thermometer" title="Temperatura" reading={temperatureReading} telemetry={temperature} value={temperatureReading.label} />
    </div>

    <div className={styles.kpis}>{KPIS.map((kpi) => <Kpi key={kpi.label} {...kpi} />)}</div>

    <h2 className={styles.section}>Acciones rápidas</h2>
    <div className={styles.actions}>
      {actions.map((item) => <Link key={item.to + item.title} to={item.to} className={styles.action}>
        <span className={styles.actionIcon}><Icon name={item.icon} size={20} /></span>
        <span className={styles.actionText}><div className={styles.actionTitle}>{item.title}</div><div className={styles.actionDetail}>{item.detail}</div></span>
        <span className={styles.chev}><Icon name="chevron" size={18} /></span>
      </Link>)}
    </div>
  </>;
}
