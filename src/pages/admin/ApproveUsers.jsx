import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Table, useToast } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { approveUser, getPendingUsers, rejectUser } from '../../services/authService';
import { formatDateTime } from '../../utils/format';
import { roleLabel } from '../../utils/validation';
import styles from './admin.module.css';

const toRows = (data) => (Array.isArray(data) ? data : data?.users || data?.items || []);
const rowId = (row) => row.id || row.user_id;
const fullName = (row) => [row.first_name, row.last_name].filter(Boolean).join(' ') || row.full_name || row.name || 'Sin nombre';

export default function ApproveUsers() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [toReject, setToReject] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setLoadError('');
    return getPendingUsers(accessToken).then((data) => setRows(toRows(data)))
      .catch((error) => setLoadError(error.message)).finally(() => setLoading(false));
  }, [accessToken]);
  useEffect(() => { load(); }, [load]);

  const act = async (row, operation, doneMessage) => {
    if (busyId) return;
    setBusyId(rowId(row));
    try {
      await operation(rowId(row), accessToken);
      setRows((list) => list.filter((item) => rowId(item) !== rowId(row)));
      toast.success(doneMessage);
    } catch (error) { toast.error(error.message); }
    finally { setBusyId(''); setToReject(null); }
  };

  const columns = [
    { key: 'person', label: 'Usuario', render: (row) => <div className={styles.person}><strong>{fullName(row)}</strong><span>{row.email}</span></div> },
    { key: 'role', label: 'Rol', render: (row) => row.role ? <Badge tone="info">{roleLabel(row)}</Badge> : '—' },
    { key: 'created', label: 'Solicitud', render: (row) => formatDateTime(row.created_at) || '—' },
    { key: 'actions', label: '', align: 'right', render: (row) => <div className={styles.rowActions}>
      <Button size="sm" variant="secondary" disabled={Boolean(busyId)} onClick={() => setToReject(row)}>Rechazar</Button>
      <Button size="sm" loading={busyId === rowId(row) && !toReject} loadingLabel="Aprobando…" disabled={Boolean(busyId)} onClick={() => act(row, approveUser, `Cuenta de ${fullName(row)} aprobada.`)}>Aprobar</Button>
    </div> },
  ];

  return <>
    <PageHeader title="Aprobar usuarios" subtitle="Cuentas que esperan aprobación para iniciar sesión."
      actions={<><Link to="/personal"><Button variant="ghost">Volver a Personal</Button></Link><Button variant="secondary" onClick={load} disabled={loading}>Actualizar</Button></>} />
    <Card>
      {loading ? <p className={styles.text}>Cargando…</p>
        : loadError ? <EmptyState title="No se pudo cargar la lista" action={<Button variant="secondary" onClick={load}>Reintentar</Button>}>{loadError}</EmptyState>
        : rows.length === 0 ? <EmptyState icon="check" title="No hay cuentas pendientes">Cuando alguien se registre con un token aparecerá aquí.</EmptyState>
        : <Table columns={columns} rows={rows} rowKey={rowId} />}
    </Card>
    <Modal open={Boolean(toReject)} title="¿Rechazar cuenta?" busy={Boolean(busyId)} onClose={() => setToReject(null)}
      footer={<><Button variant="secondary" disabled={Boolean(busyId)} onClick={() => setToReject(null)}>Cancelar</Button>
        <Button variant="danger" loading={Boolean(busyId)} loadingLabel="Rechazando…" onClick={() => act(toReject, rejectUser, 'Cuenta rechazada.')}>Rechazar</Button></>}>
      {toReject && <>Se rechazará la solicitud de <strong>{fullName(toReject)}</strong> ({toReject.email}).</>}
    </Modal>
  </>;
}
