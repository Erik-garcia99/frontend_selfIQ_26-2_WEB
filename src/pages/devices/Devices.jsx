import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Icon, Modal, PageHeader, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { deviceLabel, statusLabel } from '../../services/deviceService';
import { deviceAdapter } from '../../services/deviceAdapter';
import styles from './Devices.module.css';

export default function Devices() {
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const [gateways, setGateways] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true); setError('');
    try {
      const [gws, devs] = await Promise.all([
        deviceAdapter.listGateways({ branchId, accessToken }),
        deviceAdapter.listDevices({ branchId, accessToken }),
      ]);
      setGateways(gws); setDevices(devs);
    } catch (e) { setError(e.message || 'No se pudieron cargar los dispositivos.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (gw) => { setEditing(gw); setNameDraft(gw.name || ''); };
  const saveName = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await deviceAdapter.updateGateway({ gatewayId: editing.id, name: nameDraft.trim(), accessToken });
      setGateways((prev) => prev.map((g) => g.id === updated.id ? { ...g, name: updated.name } : g));
      setEditing(null);
    } catch (e) { setError(e.message || 'No se pudo guardar.'); }
    finally { setSaving(false); }
  };

  const gatewayName = (id) => gateways.find((g) => g.id === id)?.name || '—';

  return <>
    <PageHeader title="Dispositivos" subtitle="Gateways y nodos de la sucursal"
      actions={<><Button variant="secondary" onClick={load} disabled={loading}><Icon name="refresh" size={16} /> Actualizar</Button>
        <Link to="/dispositivos/agregar"><Button><Icon name="plus" size={16} /> Agregar</Button></Link></>} />

    {error && <div className={styles.error}>{error}</div>}

    <Card title="Gateways">
      <Table loading={loading} rows={gateways} empty="No hay gateways registrados."
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'id', label: 'ID' },
          { key: 'online', label: 'Estado', render: (g) => <Badge tone={g.online ? 'success' : 'danger'} dot>{g.online ? 'Conectado' : 'Sin conexión'}</Badge> },
          { key: 'actions', label: 'Acciones', render: (g) => <Button variant="secondary" onClick={() => openEdit(g)}>Editar</Button> },
        ]} />
    </Card>

    <Card title="Nodos">
      <Table loading={loading} rows={devices} empty="No hay nodos registrados."
        columns={[
          { key: 'name', label: 'Nombre', render: (d) => deviceLabel(d) },
          { key: 'type', label: 'Tipo' },
          { key: 'location', label: 'Ubicación', render: (d) => d.location || '—' },
          { key: 'macAddress', label: 'MAC', render: (d) => d.macAddress || '—' },
          { key: 'gatewayId', label: 'Gateway', render: (d) => gatewayName(d.gatewayId) },
          { key: 'online', label: 'Estado', render: (d) => <Badge tone={d.online ? 'success' : d.online === false ? 'danger' : 'neutral'} dot>{statusLabel(d)}</Badge> },
          { key: 'actions', label: 'Acciones', render: (d) => <Link to={`/dispositivos/${d.id}`}><Button variant="secondary">Detalle</Button></Link> },
        ]} />
    </Card>

    <Modal open={!!editing} title="Editar gateway" onClose={() => setEditing(null)}
      footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
        <Button onClick={saveName} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button></>}>
      <label className={styles.label}>Nombre
        <input className={styles.input} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
      </label>
    </Modal>
  </>;
}