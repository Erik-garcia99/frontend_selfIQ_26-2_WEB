import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Field, Modal, Notice, PageHeader, Table } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { listCatalog } from '../../services/productsService';
import * as people from '../../services/peopleService';
import { isEmail } from '../../utils/validation';
import styles from './admin.module.css';

const SECTIONS = [
  ['employees', 'Empleados'],
  ['customers', 'Clientes'],
  ['suppliers', 'Proveedores'],
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phoneNumber: '', password: '',
  role: 'employee', name: '', contactEmail: '', whatsappNumber: '',
};

// `owner` y `sudo` no se crean aquí: owner inicia la plataforma y sudo es el
// administrador único. `staff` era un alias de `employee`: ya no se ofrece,
// pero los registros antiguos se listan. La etiqueta va en español; el valor,
// sin traducir, al backend.
const ROLE_OPTIONS = [
  ['manager', 'Gerente'],
  ['rh', 'RRHH'],
  ['gerencia', 'Gerencia'],
  ['employee', 'Empleado'],
];

const fullName = (item) => `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email;
const createsPending = (user) => ['manager', 'gerencia'].includes(user?.role?.toLowerCase());
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value) => {
  if (!value) return '—';
  try { return new Date(value).toLocaleString(); } catch { return String(value); }
};

export default function People() {
  const { user, accessToken } = useAuth();
  const { branchId } = useDevices();
  const [section, setSection] = useState('employees');
  const [include, setInclude] = useState(false);
  const [reload, setReload] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [links, setLinks] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) { setRows([]); return; }
    setLoading(true); setError('');
    try {
      const result = section === 'employees'
        ? await people.listEmployees(branchId, accessToken, include)
        : section === 'customers'
          ? await people.listCustomers(branchId, accessToken, include)
          : await people.listSuppliers(branchId, accessToken, include);
      setRows(Array.isArray(result?.items) ? result.items : []);
    } catch (e) { setError(e.message || 'No se pudo cargar la lista.'); }
    finally { setLoading(false); }
  }, [branchId, accessToken, section, include]);

  useEffect(() => { load(); }, [load, reload]);

  const change = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));
  const close = () => {
    setModal(null); setEditing(null); setForm(EMPTY_FORM); setFormError(''); setError('');
  };
  const refresh = () => setReload((value) => value + 1);

  function openForm(item = null) {
    setEditing(item); setFormError(''); setError('');
    if (section === 'suppliers') {
      setForm({ ...EMPTY_FORM, name: item?.name || '', contactEmail: item?.contactEmail || '',
        whatsappNumber: item?.whatsappNumber || '' });
    } else {
      setForm({ ...EMPTY_FORM, firstName: item?.firstName || '', lastName: item?.lastName || '',
        email: item?.email || '', phoneNumber: item?.phoneNumber || '', role: item?.role || 'employee' });
    }
    setModal('form');
  }

  async function save() {
    if (section === 'suppliers') {
      if (!form.name.trim()) return setFormError('Escribe el nombre del proveedor.');
    } else {
      if (!form.firstName.trim() || !form.lastName.trim()) return setFormError('Escribe nombre y apellido.');
      if (!isEmail(form.email)) return setFormError('Escribe un correo válido.');
      if (!editing && form.password.length < 8) return setFormError('La contraseña debe tener al menos 8 caracteres.');
    }
    setFormError(''); setBusy(true); setError('');
    try {
      let saved;
      if (section === 'suppliers') {
        const data = { name: form.name.trim(), contact_email: form.contactEmail.trim() || null,
          whatsapp_number: form.whatsappNumber.trim() || null };
        saved = editing ? await people.updateSupplier(branchId, editing.id, accessToken, data)
          : await people.createSupplier(branchId, accessToken, data);
      } else {
        const data = { first_name: form.firstName.trim(), last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(), phone_number: form.phoneNumber.trim() || null };
        if (!editing && section === 'employees') data.role = form.role;
        if (!editing) data.password = form.password;
        saved = section === 'employees'
          ? (editing ? await people.updateEmployee(branchId, editing.id, accessToken, data)
            : await people.createEmployee(branchId, accessToken, data))
          : (editing ? await people.updateCustomer(branchId, editing.id, accessToken, data)
            : await people.createCustomer(branchId, accessToken, data));
      }
      close(); refresh();
      setNotice({ tone: 'success', text: `${section === 'suppliers' ? saved.name : fullName(saved)} quedó guardado.` });
    } catch (e) { setError(e.message || 'No se pudo guardar.'); }
    finally { setBusy(false); }
  }

  async function deactivate() {
    setBusy(true); setError('');
    try {
      if (section === 'employees') await people.deactivateEmployee(branchId, editing.id, accessToken);
      else if (section === 'customers') await people.deactivateCustomer(branchId, editing.id, accessToken);
      else await people.deactivateSupplier(branchId, editing.id, accessToken);
      close(); refresh();
      setNotice({ tone: 'success', text: 'Registro dado de baja; el historial se conserva.' });
    } catch (e) { setError(e.message || 'No se pudo dar de baja.'); }
    finally { setBusy(false); }
  }

  async function openPurchases(item) {
    setEditing(item); setModal('purchases'); setPurchases([]); setBusy(true); setError('');
    try {
      const result = await people.customerPurchases(branchId, item.id, accessToken);
      setPurchases(Array.isArray(result?.items) ? result.items : []);
    } catch (e) { setError(e.message || 'No se pudieron cargar las compras.'); }
    finally { setBusy(false); }
  }

  async function openProducts(item) {
    setEditing(item); setModal('products'); setLinks([]); setBusy(true); setError('');
    try {
      const [current, catalog] = await Promise.all([
        people.supplierProducts(branchId, item.id, accessToken),
        listCatalog(branchId, '', accessToken),
      ]);
      const linked = new Map((current.items || []).map((row) => [row.productId, row]));
      setLinks((catalog || []).map((product) => ({
        productId: product.id, name: product.name, sku: product.sku,
        supplierSku: linked.get(product.id)?.supplierSku || '',
        associated: linked.has(product.id),
      })));
    } catch (e) { setError(e.message || 'No se pudo cargar el catálogo.'); }
    finally { setBusy(false); }
  }

  async function saveProducts() {
    setBusy(true); setError('');
    const products = links.filter((row) => row.associated).map((row) => ({
      product_id: row.productId, supplier_sku: row.supplierSku.trim() || null,
      is_preferred: false,
    }));
    try {
      await people.replaceSupplierProducts(branchId, editing.id, accessToken, products);
      close(); setNotice({ tone: 'success', text: `${products.length} producto(s) asociados.` });
    } catch (e) { setError(e.message || 'No se pudieron guardar las asociaciones.'); }
    finally { setBusy(false); }
  }

  const actions = (row) => <div className={styles.row}>
    <Button size="sm" variant="secondary" onClick={() => openForm(row)}>Editar</Button>
    {section === 'customers' && row.active && <Button size="sm" variant="secondary" onClick={() => openPurchases(row)}>Compras</Button>}
    {section === 'suppliers' && row.active && <Button size="sm" variant="secondary" onClick={() => openProducts(row)}>Productos</Button>}
    {row.active && <Button size="sm" variant="danger" onClick={() => { setEditing(row); setModal('confirm'); }}>Dar de baja</Button>}
  </div>;

  return <>
    <PageHeader title="Personas" subtitle="Empleados, clientes y proveedores de la empresa"
      actions={<>
        <Button variant="secondary" onClick={() => { setInclude((value) => !value); refresh(); }}>
          {include ? 'Ver solo activos' : 'Ver dados de baja'}
        </Button>
        <Button onClick={() => openForm()}>Nuevo {section === 'employees' ? 'empleado' : section === 'customers' ? 'cliente' : 'proveedor'}</Button>
      </>} />

    <div className={styles.row} style={{ marginBottom: '1rem' }}>
      {SECTIONS.map(([key, label]) => <Button key={key} size="sm"
        variant={section === key ? 'primary' : 'secondary'}
        onClick={() => { setSection(key); setNotice(null); }}>{label}</Button>)}
    </div>

    {!branchId && <Notice tone="info">Selecciona una sucursal en la barra superior.</Notice>}
    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
    {error && <Notice tone="danger">{error}</Notice>}
    {formError && <Notice tone="danger">{formError}</Notice>}

    <Table loading={loading} rows={rows}
      empty="No hay registros para mostrar."
      columns={[
        { key: 'name', label: 'Nombre', render: (r) => <>
          <strong>{section === 'suppliers' ? r.name : fullName(r)}</strong>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {section === 'suppliers' ? (r.contactEmail || 'Sin correo') : r.email}
          </div>
        </> },
        { key: 'role', label: 'Rol', render: (r) => section === 'suppliers' ? 'Proveedor'
          : section === 'customers' ? 'Cliente' : (r.role || 'Empleado') },
        { key: 'active', label: 'Estado', render: (r) =>
          <Badge tone={r.active ? 'success' : 'neutral'} dot>{r.active ? 'Activo' : 'De baja'}</Badge> },
        { key: 'actions', label: 'Acciones', render: actions },
      ]} />

    <Modal open={modal === 'form'} title={editing ? 'Editar registro' : 'Nuevo registro'}
      busy={busy} onClose={close}
      footer={<>
        <Button variant="secondary" onClick={close} disabled={busy}>Cancelar</Button>
        <Button onClick={save} loading={busy} disabled={busy || Boolean(editing && !editing.active)}>Guardar</Button>
      </>}>
      {editing && !editing.active && <Notice tone="info">Este registro está dado de baja. Solo puedes consultarlo.</Notice>}
      {section === 'suppliers' ? <>
        <Field label="Nombre del proveedor" value={form.name} onChange={change('name')} placeholder="Nombre del proveedor" />
        <Field label="Correo de contacto" type="email" value={form.contactEmail} onChange={change('contactEmail')} placeholder="correo@ejemplo.com" />
        <Field label="WhatsApp" value={form.whatsappNumber} onChange={change('whatsappNumber')} placeholder="5551234567" />
      </> : <>
        <Field label="Nombre" value={form.firstName} onChange={change('firstName')} placeholder="Nombre" />
        <Field label="Apellido" value={form.lastName} onChange={change('lastName')} placeholder="Apellido" />
        <Field label="Correo" type="email" value={form.email} onChange={change('email')} placeholder="correo@ejemplo.com" />
        <Field label="Teléfono" value={form.phoneNumber} onChange={change('phoneNumber')} placeholder="5551234567" />
        {section === 'employees' && !editing && <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '1rem' }}>
          <label htmlFor="people-role">Rol</label>
          <select id="people-role" value={form.role} onChange={change('role')}>
            {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <small>Elige el rol de la lista. No se puede escribir a mano.</small>
          {createsPending(user) && <small>La cuenta quedará pendiente de aprobación de owner o RRHH.</small>}
        </div>}
        {!editing && <Field label="Contraseña inicial" type="password" value={form.password} onChange={change('password')} placeholder="Mínimo 8 caracteres" />}
      </>}
    </Modal>

    <Modal open={modal === 'confirm'} title="Dar de baja" busy={busy} onClose={close}
      footer={<>
        <Button variant="secondary" onClick={close} disabled={busy}>Cancelar</Button>
        <Button variant="danger" onClick={deactivate} loading={busy}>Sí, dar de baja</Button>
      </>}>
      <p>¿Dar de baja a {editing ? (section === 'suppliers' ? editing.name : fullName(editing)) : ''}? El registro se conserva en el historial.</p>
    </Modal>

    <Modal open={modal === 'purchases'} title={`Compras de ${editing ? fullName(editing) : ''}`}
      busy={busy} onClose={close}
      footer={<>
        <Button variant="secondary" onClick={() => openForm(editing)} disabled={busy}>Editar datos</Button>
        <Button variant="secondary" onClick={close} disabled={busy}>Cerrar</Button>
      </>}>
      <Notice tone="info">Solo lectura: las compras vienen del sistema de ventas.</Notice>
      {purchases.length === 0 && <p>Sin compras registradas.</p>}
      {purchases.map((sale) => <div key={sale.id} className={styles.row} style={{ display: 'block', padding: '0.6rem 0' }}>
        <strong>{sale.saleNumber}</strong> · {dateLabel(sale.occurredAt)} · {money(sale.total)} · {sale.status}
        {sale.items.map((line) => <div key={line.productId} style={{ color: 'var(--muted)' }}>
          {line.quantity} × {line.name} ({line.sku})
        </div>)}
      </div>)}
    </Modal>

    <Modal open={modal === 'products'} title={`Productos de ${editing?.name || ''}`}
      busy={busy} onClose={close}
      footer={<>
        <Button onClick={saveProducts} loading={busy}>Guardar asociaciones</Button>
        <Button variant="secondary" onClick={() => openForm(editing)} disabled={busy}>Editar datos</Button>
        <Button variant="secondary" onClick={close} disabled={busy}>Cerrar</Button>
      </>}>
      <Notice tone="info">Marca los productos que suministra este proveedor.</Notice>
      {links.length === 0 && <p>No hay productos en el catálogo de esta empresa.</p>}
      {links.map((link, index) => <div key={link.productId} className={styles.row}>
        <label>
          <input type="checkbox" checked={link.associated}
            onChange={(event) => setLinks((previous) => previous.map((row, i) =>
              i === index ? { ...row, associated: event.target.checked } : row))} />
          {' '}{link.name} ({link.sku})
        </label>
        {link.associated && <input aria-label={`SKU de ${link.name} en el proveedor`} value={link.supplierSku}
          placeholder="SKU del proveedor (opcional)"
          onChange={(event) => setLinks((previous) => previous.map((row, i) =>
            i === index ? { ...row, supplierSku: event.target.value } : row))} />}
      </div>)}
    </Modal>
  </>;
}
