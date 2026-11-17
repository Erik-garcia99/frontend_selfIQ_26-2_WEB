import { useCallback, useEffect, useState } from 'react';
import { Button, Field, Notice, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { listInventory } from '../../services/inventoryService';
import { getProductAvailability } from '../../services/productsService';
import { formatDateTime } from '../../utils/format';

export default function Inventario() {
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [availOpen, setAvailOpen] = useState(false);
  const [availProduct, setAvailProduct] = useState(null);
  const [availData, setAvailData] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState('');

  const load = useCallback(async (q = search) => {
    if (!branchId) return;
    setLoading(true); setError('');
    try { setRows(await listInventory(branchId, accessToken, q)); }
    catch (e) { setError(e.message || 'No se pudo cargar el inventario.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken, search]);

  useEffect(() => { load(''); }, [branchId, accessToken]);

  const openAvailability = async (row) => {
    if (!branchId) return;
    setAvailProduct(row); setAvailData(null); setAvailError(''); setAvailOpen(true); setAvailLoading(true);
    try { setAvailData(await getProductAvailability(branchId, row.product_id || row.id, accessToken)); }
    catch (e) { setAvailError(e.message || 'No se pudo consultar la disponibilidad.'); }
    finally { setAvailLoading(false); }
  };

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
        { key: 'actions', label: '', render: (r) => <Button variant="secondary" onClick={() => openAvailability(r)}>Disponibilidad</Button> },
      ]} />

    <Modal open={availOpen} title={availProduct ? `Disponibilidad: ${availProduct.name}` : 'Disponibilidad'}
      onClose={() => setAvailOpen(false)}>
      {availLoading && <Notice tone="info">Consultando…</Notice>}
      {availError && <Notice tone="danger">{availError}</Notice>}
      {availData && <>
        <p><strong>SKU:</strong> {availData.sku}</p>
        <h3 style={{ marginTop: '0.5rem' }}>Stock lógico</h3>
        {availData.logical
          ? <p>{availData.logical.quantity_on_hand} unidades · actualizado {formatDateTime(availData.logical.updated_at) || '—'}</p>
          : <p style={{ color: 'var(--muted)' }}>Sin permiso o sin registro.</p>}
        <h3 style={{ marginTop: '0.75rem' }}>Ocupación visual por zona</h3>
        {availData.visual?.length
          ? availData.visual.map((z) => (
            <div key={z.roi_id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{z.shelf_name}</strong> · {z.roi_name} {z.location ? `(${z.location})` : ''}
              <div>
                Ocupación: {z.occupancy_pct != null ? `${z.occupancy_pct}%` : '—'} · estado: {z.status || 'sin datos'}
                {z.last_reading_at && <> · lectura {formatDateTime(z.last_reading_at)}</>}
              </div>
            </div>
          ))
          : <p style={{ color: 'var(--muted)' }}>Sin zonas ROI vinculadas.</p>}
      </>}
    </Modal>
  </>;
}