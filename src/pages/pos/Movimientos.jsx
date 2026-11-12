import { useCallback, useEffect, useState } from 'react';
import { Button, Field, Modal, Notice, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import {
  adjustInventory, confirmReceipt, listMovements, listReceipts,
} from '../../services/inventoryService';
import { searchProducts } from '../../services/productsService';
import { canManage } from '../../utils/validation';
import { formatDateTime } from '../../utils/format';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function Movimientos() {
  const { user, accessToken } = useAuth();
  const { branchId } = useDevices();
  const [movements, setMovements] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [product, setProduct] = useState(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true); setError('');
    try {
      const [m, r] = await Promise.all([
        listMovements(branchId, accessToken),
        listReceipts(branchId, accessToken),
      ]);
      setMovements(m); setReceipts(r);
    } catch (e) { setError(e.message || 'No se pudo cargar.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken]);

  useEffect(() => { load(); }, [load]);

  const findProduct = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    try { setResults(await searchProducts(branchId, search.trim(), accessToken)); }
    catch (err) { setError(err.message); }
  };

  const saveAdjustment = async () => {
    if (!product || !delta || !reason.trim()) return;
    setSaving(true); setError('');
    try {
      await adjustInventory(branchId, {
        product_id: product.id, quantity_delta: Number(delta), reason: reason.trim(),
      }, uuid(), accessToken);
      setNotice('Ajuste registrado.');
      setAdjustOpen(false); setProduct(null); setSearch(''); setResults([]); setDelta(''); setReason('');
      await load();
    } catch (e) { setError(e.message || 'No se pudo ajustar.'); }
    finally { setSaving(false); }
  };

  const confirm = async (receipt) => {
    setError('');
    try { await confirmReceipt(branchId, receipt.id, accessToken); setNotice('Recepción confirmada.'); await load(); }
    catch (e) { setError(e.message || 'No se pudo confirmar.'); }
  };

  return <>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <h2 style={{ margin: 0 }}>Movimientos</h2>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={load} disabled={loading}>Actualizar</Button>
        {canManage(user) && <Button onClick={() => setAdjustOpen(true)}>Ajustar inventario</Button>}
      </div>
    </div>
    {error && <Notice tone="danger">{error}</Notice>}
    {notice && <Notice tone="success">{notice}</Notice>}
    <Table loading={loading} rows={movements} empty="Sin movimientos."
      columns={[
        { key: 'occurred_at', label: 'Fecha', render: (r) => formatDateTime(r.occurred_at) || '—' },
        { key: 'name', label: 'Producto', render: (r) => <><strong>{r.name}</strong><div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{r.sku}</div></> },
        { key: 'movement_type', label: 'Tipo' },
        { key: 'quantity_delta', label: 'Cambio', render: (r) => r.quantity_delta > 0 ? `+${r.quantity_delta}` : r.quantity_delta },
        { key: 'quantity_after', label: 'Quedan' },
        { key: 'reason', label: 'Motivo', render: (r) => r.reason || '—' },
      ]} />

    <h2 style={{ marginTop: '1.5rem' }}>Recepciones</h2>
    <Table rows={receipts} empty="Sin recepciones."
      columns={[
        { key: 'id', label: 'ID', render: (r) => r.id.slice(0, 8) },
        { key: 'received_at', label: 'Fecha', render: (r) => formatDateTime(r.received_at) || '—' },
        { key: 'status', label: 'Estado' },
        { key: 'items', label: 'Partidas', render: (r) => r.items?.length || 0 },
        { key: 'actions', label: '', render: (r) => r.status !== 'confirmed'
          ? <Button onClick={() => confirm(r)}>Confirmar</Button>
          : <span style={{ color: 'var(--muted)' }}>Confirmada</span> },
      ]} />

    <Modal open={adjustOpen} title="Ajustar inventario" onClose={() => setAdjustOpen(false)}
      footer={<><Button variant="secondary" onClick={() => setAdjustOpen(false)}>Cancelar</Button>
        <Button onClick={saveAdjustment} disabled={!product || !delta || !reason.trim() || saving}>{saving ? 'Guardando…' : 'Guardar ajuste'}</Button></>}>
      <form onSubmit={findProduct} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
        <Field label="Buscar producto" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>
      {results.map((p) => <button key={p.id} type="button" onClick={() => { setProduct(p); setResults([]); }}
        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', marginBottom: '0.35rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--white)', cursor: 'pointer' }}>
        {p.name} · {p.sku}
      </button>)}
      {product && <p><strong>Producto:</strong> {product.name} ({product.sku})</p>}
      <Field label="Cambio (positivo entra, negativo sale)" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} />
      <Field label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
    </Modal>
  </>;
}