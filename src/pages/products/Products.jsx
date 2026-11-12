import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Field, Notice, PageHeader, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { listCatalog, searchProducts } from '../../services/productsService';

const isForbidden = (error) => error?.status === 403 || error?.status === 404;

// Consulta del catálogo existente. La web no crea productos: eso se hace en la app móvil.
export default function Products() {
  const { accessToken } = useAuth();
  const { branchId, branches } = useDevices();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!branchId) { setRows([]); return; }
    setLoading(true); setError('');
    try {
      let products;
      try { products = await listCatalog(branchId, '', accessToken); }
      catch (e) {
        if (!isForbidden(e)) throw e;
        // El endpoint del catálogo exige encargado/gerencia. Los demás roles
        // consultan el mismo catálogo desde el endpoint de lectura del POS.
        products = await searchProducts(branchId, '', accessToken, 100);
      }
      setRows(products);
    } catch (e) {
      setError(e.message || 'No se pudieron consultar los productos.');
    } finally { setLoading(false); }
  }, [branchId, accessToken]);

  useEffect(() => { load(); }, [load]);

  // Igual que el móvil: se filtra en memoria por nombre o SKU, sin recargar.
  const query = search.trim().toLowerCase();
  const products = useMemo(() => rows.filter((product) => {
    if (!query) return true;
    const name = String(product.name || '').toLowerCase();
    const sku = String(product.sku || '').toLowerCase();
    return name.includes(query) || sku.includes(query);
  }), [rows, query]);

  const branch = branches.find((item) => item.id === branchId);

  return <>
    <PageHeader title="Productos" subtitle={branch ? `Catálogo de ${branch.name}` : 'Catálogo disponible para asignar a las zonas.'} />

    <Field label="Buscar por nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar por nombre o SKU" autoCapitalize="none" />

    {!branchId && <Notice tone="danger">Selecciona una sucursal en la barra superior.</Notice>}
    {error && <Notice tone="danger">{error}</Notice>}

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
      <strong>Catálogo ({products.length})</strong>
      <Button variant="secondary" onClick={load} disabled={loading || !branchId}>
        {loading ? 'Actualizando…' : 'Actualizar catálogo'}
      </Button>
    </div>

    <Table loading={loading} rows={products}
      empty={query ? 'Ningún producto coincide con la búsqueda.' : 'Todavía no hay productos en esta sucursal.'}
      columns={[
        { key: 'name', label: 'Producto', render: (r) => <>
          <strong>{r.name}</strong>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>SKU · {r.sku}</div>
        </> },
        { key: 'active', label: 'Estado', render: (r) => {
          const active = r.active ?? r.is_active;
          return <Badge tone={active ? 'success' : 'neutral'} dot>{active ? 'Activo' : 'Inactivo'}</Badge>;
        } },
      ]} />

    <Notice tone="info">
      El catálogo se administra desde la app móvil. Aquí solo puedes consultar los productos de la sucursal.
    </Notice>
  </>;
}
