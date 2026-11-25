import { useCallback, useEffect, useState } from 'react';
import { Button, Field, Modal, Notice, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { getSale, listSales, returnSale, voidSale } from '../../services/salesService';
import { canManage } from '../../utils/validation';
import { formatDateTime } from '../../utils/format';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function Historial() {
  const { user, accessToken } = useAuth();
  const { branchId } = useDevices();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState('');
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState('');

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true); setError('');
    try {
      const data = await listSales(branchId, accessToken);
      setRows(data.items || []);
    } catch (e) { setError(e.message || 'No se pudo cargar el historial.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken]);

  useEffect(() => { load(); }, [load]);

  const confirmVoid = async () => {
    if (!voidTarget || !voidReason.trim()) return;
    setVoiding(true); setVoidError('');
    try {
      await voidSale(branchId, voidTarget.id, voidReason.trim(), uuid(), accessToken);
      setVoidTarget(null); setVoidReason(''); setDetail(null);
      await load();
    } catch (e) { setVoidError(e.message || 'No se pudo anular la venta.'); }
    finally { setVoiding(false); }
  };

  const openReturn = (sale) => {
    setReturnTarget(sale);
    setReturnItems((sale.items || []).map((item) => ({
      product_id: item.product_id, name: item.name, sku: item.sku,
      sold: item.quantity, quantity: '',
    })));
    setReturnReason(''); setReturnError(''); setDetail(null);
  };

  const confirmReturn = async () => {
    const items = returnItems
      .filter((item) => Number(item.quantity) > 0)
      .map((item) => ({ product_id: item.product_id, quantity: Number(item.quantity) }));
    if (!returnTarget || !returnReason.trim() || items.length === 0) return;
    setReturning(true); setReturnError('');
    try {
      await returnSale(branchId, returnTarget.id, items, returnReason.trim(), uuid(), accessToken);
      setReturnTarget(null); setReturnItems([]); setReturnReason('');
      await load();
    } catch (e) { setReturnError(e.message || 'No se pudo registrar la devolución.'); }
    finally { setReturning(false); }
  };

  const open = async (row) => {
    setDetailError(''); setDetail(row);
    try { setDetail(await getSale(branchId, row.id, accessToken)); }
    catch (e) { setDetailError(e.message || 'No se pudo cargar la venta.'); }
  };

  return <>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <Button variant="secondary" onClick={load} disabled={loading}>Actualizar</Button>
    </div>
    {error && <Notice tone="danger">{error}</Notice>}
    {!branchId && <Notice tone="danger">Selecciona una sucursal.</Notice>}
    <Table loading={loading} rows={rows} empty="Aún no hay ventas." onRowClick={open}
      columns={[
        { key: 'sale_number', label: 'Folio' },
        { key: 'created_at', label: 'Fecha', render: (r) => formatDateTime(r.created_at) || '—' },
        { key: 'payment_method', label: 'Pago' },
        { key: 'status', label: 'Estado' },
        { key: 'total', label: 'Total', render: (r) => money.format(Number(r.total)) },
      ]} />

    <Modal open={!!detail} title={detail ? `Venta ${detail.sale_number}` : 'Venta'} onClose={() => setDetail(null)}
      footer={<>
        {detail && detail.status !== 'voided' && canManage(user) && <>
          <Button onClick={() => openReturn(detail)}>Devolver</Button>
          <Button variant="danger" onClick={() => { setVoidTarget(detail); setVoidReason(''); setVoidError(''); }}>Anular venta</Button>
        </>}
        <Button variant="secondary" onClick={() => setDetail(null)}>Cerrar</Button>
      </>}>
      {detailError && <Notice tone="danger">{detailError}</Notice>}
      {detail && <>
        <p><strong>Total:</strong> {money.format(Number(detail.total))} · <strong>Estado:</strong> {detail.status}</p>
        <p><strong>Fecha:</strong> {formatDateTime(detail.created_at) || '—'} · <strong>Pago:</strong> {detail.payment_method}</p>
        <Table rows={detail.items || []} empty="Sin partidas."
          columns={[
            { key: 'name', label: 'Producto' },
            { key: 'quantity', label: 'Cantidad' },
            { key: 'unit_price', label: 'Precio', render: (r) => money.format(Number(r.unit_price)) },
            { key: 'subtotal', label: 'Importe', render: (r) => money.format(Number(r.subtotal)) },
          ]} />
      </>}
    </Modal>

    <Modal open={!!voidTarget} title={voidTarget ? `Anular ${voidTarget.sale_number}` : 'Anular venta'}
      onClose={() => setVoidTarget(null)}
      footer={<><Button variant="secondary" onClick={() => setVoidTarget(null)}>Cancelar</Button>
        <Button variant="danger" onClick={confirmVoid} disabled={!voidReason.trim() || voiding}>{voiding ? 'Anulando…' : 'Anular'}</Button></>}>
      <p>Se devolverán las existencias y la venta quedará marcada como anulada.</p>
      <Field label="Motivo de la anulación" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
      {voidError && <Notice tone="danger">{voidError}</Notice>}
    </Modal>

    <Modal open={!!returnTarget} title={returnTarget ? `Devolver ${returnTarget.sale_number}` : 'Devolver venta'}
      onClose={() => setReturnTarget(null)}
      footer={<><Button variant="secondary" onClick={() => setReturnTarget(null)}>Cancelar</Button>
        <Button onClick={confirmReturn} disabled={!returnReason.trim() || returning || !returnItems.some((i) => Number(i.quantity) > 0)}>
          {returning ? 'Registrando…' : 'Registrar devolución'}
        </Button></>}>
      <p>Indica cuántas unidades se devuelven. No se puede exceder lo vendido.</p>
      {returnItems.map((item) => (
        <div key={item.product_id} style={{ marginBottom: '0.75rem' }}>
          <strong>{item.name}</strong> · {item.sku} · vendidas {item.sold}
          <Field label="Unidades a devolver" type="number" min="0" max={item.sold} value={item.quantity}
            onChange={(e) => setReturnItems((prev) => prev.map((x) => x.product_id === item.product_id ? { ...x, quantity: e.target.value } : x))} />
        </div>
      ))}
      <Field label="Motivo de la devolución" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} />
      {returnError && <Notice tone="danger">{returnError}</Notice>}
    </Modal>
  </>;
}