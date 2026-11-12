import { useCallback, useEffect, useState } from 'react';
import { Button, Field, Notice, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { listInventory } from '../../services/inventoryService';
import { formatDateTime } from '../../utils/format';

export default function Inventario() {
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (q = search) => {
    if (!branchId) return;
    setLoading(true); setError('');
    try { setRows(await listInventory(branchId, accessToken, q)); }
    catch (e) { setError(e.message || 'No se pudo cargar el inventario.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken, search]);

  useEffect(() => { load(''); }, [branchId, accessToken]);

  return <>
    <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}
      onSubmit={(e) => { e.preventDefault(); load(search); }}>
      <Field label="Buscar producto" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button type="submit" variant="secondary">Buscar</Button>
      <Button type="button" onClick={() => load('')}>Actualizar</Button>
    </form>
    {error && <Notice tone="danger">{error}</Notice>}
    {!branchId && <Notice tone="danger">Selecciona una sucursal.</Notice>}
    <Table loading={loading} rows={rows} empty="Sin inventario registrado."
      columns={[
        { key: 'name', label: 'Producto', render: (r) => <><strong>{r.name}</strong><div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{r.sku}</div></> },
        { key: 'barcode', label: 'Código', render: (r) => r.barcode || '—' },
        { key: 'quantity_on_hand', label: 'Existencias', render: (r) => r.quantity_on_hand },
        { key: 'updated_at', label: 'Última actualización', render: (r) => formatDateTime(r.updated_at) || '—' },
      ]} />
  </>;
}