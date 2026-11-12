import { useCallback, useEffect, useState } from 'react';
import { Button, Table, PageHeader, Notice } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getPendingUsers, approveUser, rejectUser } from '../../services/authService';
import styles from './admin.module.css';

export default function ApproveUsers() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getPendingUsers(accessToken);
      setRows(Array.isArray(data) ? data : data?.users || []);
    } catch (e) { setError(e.message || 'Error'); }
    finally { setLoading(false); }
  }, [accessToken]);
  useEffect(() => { load(); }, [load]);

  const act = async (id, fn) => {
    try { await fn(id, accessToken); setRows((prev) => prev.filter((u) => u.id !== id)); }
    catch (e) { setError(e.message || 'Error'); }
  };

  return <>
    <PageHeader title="Aprobar usuarios" actions={<Button variant="secondary" onClick={load}>Actualizar</Button>} />
    {error && <Notice tone="danger">{error}</Notice>}
    <Table loading={loading} rows={rows} empty="Sin pendientes."
      columns={[
        { key: 'name', label: 'Nombre', render: (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—' },
        { key: 'email', label: 'Correo' },
        { key: 'role', label: 'Rol' },
        { key: 'actions', label: 'Acciones', render: (u) => <div className={styles.row}>
          <Button onClick={() => act(u.id, approveUser)}>Aprobar</Button>
          <Button variant="danger" onClick={() => act(u.id, rejectUser)}>Rechazar</Button>
        </div> },
      ]} />
  </>;
}