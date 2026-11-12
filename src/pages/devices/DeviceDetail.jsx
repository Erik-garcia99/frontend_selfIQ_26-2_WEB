import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Icon, Modal, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { deviceLabel, statusLabel } from '../../services/deviceService';
import { deviceAdapter } from '../../services/deviceAdapter';
import { formatDateTime } from '../../utils/format';
import styles from './DeviceDetail.module.css';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // camera
  const [snapshot, setSnapshot] = useState(null);
  const [snapLoading, setSnapLoading] = useState(false);
  const [snapError, setSnapError] = useState('');

  // lights (guide)
  const [lights, setLights] = useState([]);
  const [lightsLoading, setLightsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!branchId || !deviceId) return;
    setLoading(true); setError('');
    try {
      const d = await deviceAdapter.getDevice({ branchId, deviceId, accessToken });
      setDevice(d);
      setDraft({ name: d.name || '', location: d.location || '' });
      if (d.type === 'guide') {
        setLightsLoading(true);
        try {
          const g = await deviceAdapter.getGuide({ branchId, deviceId, accessToken });
          setLights(g.lights || []);
        } catch { setLights([]); }
        finally { setLightsLoading(false); }
      }
    } catch (e) { setError(e.message || 'No se pudo cargar el dispositivo.'); }
    finally { setLoading(false); }
  }, [branchId, deviceId, accessToken]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await deviceAdapter.updateDevice({ branchId, deviceId, name: draft.name.trim(), location: draft.location.trim() || null, accessToken });
      setDevice((prev) => ({ ...prev, ...updated }));
      setEditing(false);
    } catch (e) { setError(e.message || 'No se pudo guardar.'); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deviceAdapter.deleteDevice({ branchId, deviceId, accessToken });
      navigate('/dispositivos');
    } catch (e) { setError(e.message || 'No se pudo eliminar.'); setConfirmDelete(false); }
    finally { setDeleting(false); }
  };

  const takeSnapshot = async () => {
    setSnapLoading(true); setSnapError('');
    try {
      await deviceAdapter.requestSnapshot({ branchId, deviceId, accessToken });
      // pequeño retraso para que el backend genere la foto
      await new Promise((r) => setTimeout(r, 1500));
      const result = await deviceAdapter.fetchSnapshot({ branchId, deviceId, accessToken });
      setSnapshot(result);
    } catch (e) { setSnapError(e.message || 'No se pudo obtener la foto.'); }
    finally { setSnapLoading(false); }
  };

  if (loading) return <PageHeader title="Cargando…" />;
  if (error && !device) return <><PageHeader title="Dispositivo" /><div className={styles.error}>{error}</div></>;

  return <>
    <PageHeader title={device ? deviceLabel(device) : 'Dispositivo'} subtitle={device?.type}
      actions={<>
        <Button variant="secondary" onClick={() => setEditing(true)}>Editar</Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>Eliminar</Button>
      </>} />

    {error && <div className={styles.error}>{error}</div>}

    {device && <Card>
      <div className={styles.grid}>
        <div><span className={styles.label}>Nombre</span><div>{device.name || '—'}</div></div>
        <div><span className={styles.label}>Tipo</span><div>{device.type || '—'}</div></div>
        <div><span className={styles.label}>Ubicación</span><div>{device.location || '—'}</div></div>
        <div><span className={styles.label}>MAC</span><div>{device.macAddress || '—'}</div></div>
        <div><span className={styles.label}>Estado</span><div><Badge tone={device.online ? 'success' : device.online === false ? 'danger' : 'neutral'} dot>{statusLabel(device)}</Badge></div></div>
        <div><span className={styles.label}>Gateway</span><div>{device.gatewayId || '—'}</div></div>
      </div>
    </Card>}

    {device?.type === 'camera' && <Card title="Foto">
      <div className={styles.snapshot}>
        {snapshot?.uri && <img src={snapshot.uri} alt="Snapshot" className={styles.photo} />}
        {snapshot?.capturedAt && <p className={styles.muted}>Capturada: {formatDateTime(snapshot.capturedAt)}</p>}
        {snapError && <div className={styles.error}>{snapError}</div>}
        <Button onClick={takeSnapshot} disabled={snapLoading}>{snapLoading ? 'Tomando foto…' : 'Tomar foto'}</Button>
      </div>
    </Card>}

    {device?.type === 'guide' && <Card title="Luces / estantes">
      {lightsLoading && <p className={styles.muted}>Cargando luces…</p>}
      {!lightsLoading && lights.length === 0 && <p className={styles.muted}>Sin luces registradas.</p>}
      {lights.map((l) => (
        <div key={l.id} className={styles.lightRow}>
          <div><strong>{l.name}</strong> · canal {l.channel} · {l.shelfName || 'sin estante'}</div>
        </div>
      ))}
    </Card>}

    {device?.readings && <Card title="Lecturas">
      <pre className={styles.pre}>{JSON.stringify(device.readings, null, 2)}</pre>
    </Card>}

    <Modal open={editing} title="Editar dispositivo" onClose={() => setEditing(false)}
      footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button></>}>
      <div className={styles.form}>
        <label className={styles.label}>Nombre
          <input className={styles.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label className={styles.label}>Ubicación
          <input className={styles.input} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        </label>
      </div>
    </Modal>

    <Modal open={confirmDelete} title="¿Eliminar dispositivo?" onClose={() => setConfirmDelete(false)}
      footer={<><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
        <Button variant="danger" onClick={remove} disabled={deleting}>{deleting ? 'Eliminando…' : 'Eliminar'}</Button></>}>
      Esta acción no se puede deshacer.
    </Modal>
  </>;
}