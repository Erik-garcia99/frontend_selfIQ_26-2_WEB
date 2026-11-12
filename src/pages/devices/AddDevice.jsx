import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Field, Icon, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { deviceLabel } from '../../services/deviceService';
import { deviceAdapter } from '../../services/deviceAdapter';
import styles from './AddDevice.module.css';

const POLL_MS = 2000;

export default function AddDevice() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { branchId } = useDevices();

  const [gateways, setGateways] = useState([]);
  const [gatewayId, setGatewayId] = useState('');
  const [step, setStep] = useState('start'); // start | searching | found | registering | done | error | no-results
  const [message, setMessage] = useState('');
  const [discoveryId, setDiscoveryId] = useState(null);
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({ name: '', location: '' });
  const [shelves, setShelves] = useState([]);
  const [channels, setChannels] = useState([]);
  const [lightDraft, setLightDraft] = useState({ name: '', shelfId: '', channel: null });
  const [registered, setRegistered] = useState(null);
  const [lightAdded, setLightAdded] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!branchId) return;
    deviceAdapter.listGateways({ branchId, accessToken }).then((gws) => {
      setGateways(gws);
      if (gws.length) setGatewayId(gws[0].id);
    }).catch(() => {});
  }, [branchId, accessToken]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startSearch = async () => {
    if (!gatewayId) { setMessage('Selecciona un gateway.'); setStep('error'); return; }
    setStep('searching'); setMessage(''); setFound([]);
    try {
      const result = await deviceAdapter.startDiscovery({ branchId, gatewayId, accessToken });
      const id = result?.id || result?.discovery_id;
      setDiscoveryId(id);
      // poll
      pollRef.current = setInterval(async () => {
        try {
          const d = await deviceAdapter.getDiscovery({ branchId, discoveryId: id, accessToken });
          if (d.status === 'completed' || d.status === 'done' || d.status === 'finished') {
            stopPolling();
            const devs = d.devices || [];
            setFound(devs);
            setStep(devs.length ? 'found' : 'no-results');
          } else if (d.status === 'error' || d.status === 'failed') {
            stopPolling();
            setMessage(d.message || 'Error en la búsqueda.');
            setStep('error');
          }
        } catch (e) {
          stopPolling();
          setMessage(e.message || 'No se pudo consultar la búsqueda.');
          setStep('error');
        }
      }, POLL_MS);
      // also fetch once after a delay fallback
    } catch (e) {
      setMessage(e.message || 'No se pudo iniciar la búsqueda.');
      setStep('error');
    }
  };

  const cancelSearch = async () => {
    stopPolling();
    if (discoveryId) {
      try { await deviceAdapter.stopDiscovery({ branchId, discoveryId, accessToken }); } catch {}
    }
    setStep('start');
  };

  const confirmDevice = async () => {
    if (!selected) return;
    setStep('registering');
    try {
      const dev = await deviceAdapter.registerDevice({
        branchId, discoveryId, gatewayId, deviceId: selected.id,
        name: draft.name.trim() || deviceLabel(selected), location: draft.location.trim() || null, accessToken,
      });
      setRegistered(dev);
      if (dev.type === 'guide') {
        // load shelves/channels
        try {
          const [sh, ch] = await Promise.all([
            deviceAdapter.listShelves({ branchId, accessToken }),
            deviceAdapter.listLightChannels({ branchId, deviceId: dev.id, accessToken }),
          ]);
          setShelves(sh); setChannels(ch);
          setStep('add-light');
        } catch {
          setStep('done');
        }
      } else {
        setStep('done');
      }
    } catch (e) {
      setMessage(e.message || 'No se pudo registrar el dispositivo.');
      setStep('error');
    }
  };

  const addLight = async () => {
    if (!registered) return;
    try {
      await deviceAdapter.addLight({
        branchId, deviceId: registered.id,
        name: lightDraft.name.trim(), shelfId: lightDraft.shelfId, channel: lightDraft.channel, accessToken,
      });
      setLightAdded(true);
    } catch (e) {
      setMessage(e.message || 'No se pudo agregar la luz.');
      setStep('error');
    }
  };

  return <>
    <PageHeader title="Agregar dispositivo" subtitle="Asistente de registro"
      actions={<Button variant="secondary" onClick={() => navigate('/dispositivos')}>Volver</Button>} />

    {step === 'start' && <Card>
      <div className={styles.form}>
        <label className={styles.label}>Gateway
          <select className={styles.input} value={gatewayId} onChange={(e) => setGatewayId(e.target.value)}>
            {gateways.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <Button onClick={startSearch}><Icon name="refresh" size={16} /> Buscar dispositivos</Button>
      </div>
    </Card>}

    {step === 'searching' && <Card>
      <p>Buscando dispositivos…</p>
      <Button variant="secondary" onClick={cancelSearch}>Cancelar</Button>
    </Card>}

    {step === 'no-results' && <Card>
      <p>No se encontraron dispositivos.</p>
      <Button onClick={() => setStep('start')}>Reintentar</Button>
    </Card>}

    {step === 'error' && <Card>
      <div className={styles.error}>{message || 'Ocurrió un error.'}</div>
      <Button onClick={() => setStep('start')}>Volver</Button>
    </Card>}

    {step === 'found' && <Card title="Dispositivos encontrados">
      <div className={styles.list}>
        {found.map((d) => (
          <button key={d.id} type="button" className={`${styles.item} ${selected?.id === d.id ? styles.selected : ''}`}
            onClick={() => { setSelected(d); setDraft({ name: deviceLabel(d), location: d.location || '' }); }}>
            <strong>{deviceLabel(d)}</strong> <span className={styles.muted}>{d.type}</span>
            {d.macAddress && <div className={styles.muted}>MAC: {d.macAddress}</div>}
          </button>
        ))}
      </div>
      {selected && <div className={styles.form}>
        <label className={styles.label}>Nombre
          <input className={styles.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label className={styles.label}>Ubicación
          <input className={styles.input} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        </label>
        <Button onClick={confirmDevice}>Registrar</Button>
      </div>}
    </Card>}

    {step === 'registering' && <Card><p>Registrando dispositivo…</p></Card>}

    {step === 'add-light' && registered && <Card title="Agregar luz (opcional)">
      {!lightAdded ? <>
        <div className={styles.form}>
          <label className={styles.label}>Nombre de la luz
            <input className={styles.input} value={lightDraft.name} onChange={(e) => setLightDraft({ ...lightDraft, name: e.target.value })} />
          </label>
          <label className={styles.label}>Estante
            <select className={styles.input} value={lightDraft.shelfId} onChange={(e) => setLightDraft({ ...lightDraft, shelfId: e.target.value })}>
              <option value="">Seleccionar</option>
              {shelves.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className={styles.label}>Canal
            <select className={styles.input} value={lightDraft.channel ?? ''} onChange={(e) => setLightDraft({ ...lightDraft, channel: Number(e.target.value) })}>
              <option value="">Seleccionar</option>
              {channels.filter((c) => c.available).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <div className={styles.row}>
            <Button onClick={addLight}>Agregar luz</Button>
            <Button variant="secondary" onClick={() => setStep('done')}>Omitir</Button>
          </div>
        </div>
      </> : <p>Luz agregada.</p>}
      {lightAdded && <Button onClick={() => setStep('done')}>Continuar</Button>}
    </Card>}

    {step === 'done' && <Card>
      <p>Dispositivo registrado correctamente.</p>
      <Button onClick={() => navigate('/dispositivos')}>Ir a dispositivos</Button>
    </Card>}
  </>;
}