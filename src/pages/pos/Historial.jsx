import { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Notice, PageHeader, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { getSale, listSales } from '../../services/salesService';
import { formatDateTime } from '../../utils/format';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function Historial() {
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');

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
      footer={<Button variant="secondary" onClick={() => setDetail(null)}>Cerrar</Button>}>
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
  </>;
}