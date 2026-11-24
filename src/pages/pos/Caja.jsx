import { useEffect, useRef, useState } from 'react';
import { Button, Field, Notice, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { lookupProduct, searchProducts } from '../../services/productsService';
import { createSale } from '../../services/salesService';
import { unlockPos } from '../../services/posService';
import styles from './Caja.module.css';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const cartKey = (branchId) => `pos.cart.${branchId}`;
const idemKey = (branchId) => `pos.idempotency.${branchId}`;
const unlockKey = (branchId) => `pos.unlock.${branchId}`;
const AUTO_LOCK_MS = 5 * 60 * 1000;

const readCart = (branchId) => {
  try { return JSON.parse(sessionStorage.getItem(cartKey(branchId)) || '[]'); } catch { return []; }
};
const readKey = (branchId) => {
  try { return sessionStorage.getItem(idemKey(branchId)) || ''; } catch { return ''; }
};
const readUnlock = (branchId) => {
  try {
    const value = JSON.parse(sessionStorage.getItem(unlockKey(branchId)) || 'null');
    return value && value.token && Date.parse(value.expiresAt) > Date.now() ? value.token : '';
  } catch { return ''; }
};
const clearUnlock = (branchId) => {
  try { sessionStorage.removeItem(unlockKey(branchId)); } catch { /* sin storage */ }
};
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function Caja() {
  const { accessToken } = useAuth();
  const { branchId } = useDevices();
  const barcodeRef = useRef(null);
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState(() => readCart(branchId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [payment, setPayment] = useState('cash');
  const [received, setReceived] = useState('');
  const [sale, setSale] = useState(null);
  const [locked, setLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const idleTimer = useRef(null);

  useEffect(() => {
    if (branchId) {
      setCart(readCart(branchId));
      setLocked(!readUnlock(branchId));
    }
  }, [branchId]);

  // Auto-bloqueo por inactividad. El backend además vence el token a los 20 min.
  useEffect(() => {
    if (!branchId || locked) return undefined;
    const reset = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        clearUnlock(branchId);
        setLocked(true);
        setNotice('La caja se bloqueó por inactividad.');
      }, AUTO_LOCK_MS);
    };
    const events = ['keydown', 'click', 'input'];
    events.forEach((name) => window.addEventListener(name, reset));
    reset();
    return () => {
      clearTimeout(idleTimer.current);
      events.forEach((name) => window.removeEventListener(name, reset));
    };
  }, [branchId, locked]);
  useEffect(() => {
    if (branchId) try { sessionStorage.setItem(cartKey(branchId), JSON.stringify(cart)); } catch { /* sin storage */ }
  }, [branchId, cart]);
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.sale_price) * item.quantity, 0);
  const tax = cart.reduce((sum, item) => sum + Number(item.sale_price) * item.quantity * Number(item.tax_rate || 0), 0);
  const total = subtotal + tax;

  const addProduct = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} agregado.`);
    setError('');
    setResults([]);
    setSearch('');
  };

  const handleLookup = async (event) => {
    event.preventDefault();
    const code = barcode.trim();
    if (!code || !branchId) return;
    setLoading(true); setError(''); setNotice('');
    try {
      const product = await lookupProduct(branchId, code, accessToken);
      addProduct(product);
    } catch (e) {
      setError(e.message || 'Producto no encontrado.');
    } finally {
      setBarcode('');
      setLoading(false);
      barcodeRef.current?.focus();
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!search.trim() || !branchId) return;
    setLoading(true); setError('');
    try { setResults(await searchProducts(branchId, search.trim(), accessToken)); }
    catch (e) { setError(e.message || 'No se pudo buscar.'); }
    finally { setLoading(false); }
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev.flatMap((item) => {
      if (item.id !== id) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleUnlock = async (event) => {
    event.preventDefault();
    if (!branchId || !password || unlocking) return;
    setUnlocking(true); setUnlockError('');
    try {
      const data = await unlockPos(branchId, password, accessToken);
      try {
        sessionStorage.setItem(unlockKey(branchId), JSON.stringify({
          token: data.token, expiresAt: data.unlocked_until,
        }));
      } catch { /* sin storage: el token vive solo en memoria */ }
      setPassword(''); setLocked(false); setNotice('Caja desbloqueada.');
    } catch (e) {
      setUnlockError(e.message || 'No se pudo desbloquear.');
    } finally {
      setUnlocking(false);
    }
  };

  const lock = () => {
    if (!branchId) return;
    clearUnlock(branchId);
    setLocked(true); setPassword(''); setUnlockError('');
    setNotice('Caja bloqueada.');
  };

  const checkout = async () => {
    if (!cart.length || !branchId) return;
    const token = readUnlock(branchId);
    if (!token) {
      setLocked(true);
      setError('Escribe tu contraseña para desbloquear la caja antes de cobrar.');
      return;
    }
    setLoading(true); setError(''); setNotice(''); setSale(null);
    let key = readKey(branchId);
    if (!key) {
      key = uuid();
      try { sessionStorage.setItem(idemKey(branchId), key); } catch { /* sin storage */ }
    }
    const payload = {
      customer_id: null,
      items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      payment: { method: payment, amount_received: payment === 'cash' && received ? Number(received) : null },
    };
    try {
      const result = await createSale(branchId, payload, key, accessToken, token);
      setSale(result);
      setCart([]);
      setReceived('');
      try { sessionStorage.removeItem(idemKey(branchId)); } catch { /* sin storage */ }
    } catch (e) {
      if (e.code === 'POS_LOCKED') {
        clearUnlock(branchId);
        setLocked(true);
        setError('El desbloqueo venció. Vuelve a escribir tu contraseña.');
        return;
      }
      setError(e.message || 'No se pudo cobrar.');
      // Si fue error de red, se conserva la clave para reintentar sin duplicar.
      if (e.status && e.status !== 0 && e.status !== 408) {
        try { sessionStorage.removeItem(idemKey(branchId)); } catch { /* sin storage */ }
      }
    } finally {
      setLoading(false);
      barcodeRef.current?.focus();
    }
  };

  if (locked) return <>
    <PageHeader title="Caja bloqueada" subtitle="Escribe tu contraseña para volver a vender." />
    <div className={styles.locked}>
      <form onSubmit={handleUnlock}>
        <Field label="Contraseña" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" />
        <Button type="submit" disabled={unlocking || !password || !branchId}>
          {unlocking ? 'Comprobando…' : 'Desbloquear caja'}
        </Button>
      </form>
      {!branchId && <Notice tone="danger">Selecciona una sucursal.</Notice>}
      {unlockError && <Notice tone="danger">{unlockError}</Notice>}
    </div>
  </>;

  return <>
    {!branchId && <Notice tone="danger">Selecciona una sucursal para vender.</Notice>}
    <div className={styles.lockRow}>
      <Button variant="secondary" onClick={lock}>Bloquear caja</Button>
    </div>

    <form className={styles.scan} onSubmit={handleLookup}>
      <Field ref={barcodeRef} label="Escanear código (SKU / código de barras)" value={barcode}
        onChange={(e) => setBarcode(e.target.value)} autoFocus inputMode="text" placeholder="Escanea o escribe y presiona Enter" />
      <Button type="submit" disabled={loading || !branchId}>Agregar</Button>
    </form>

    <form className={styles.search} onSubmit={handleSearch}>
      <Field label="Buscar por nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button type="submit" variant="secondary" disabled={loading || !branchId}>Buscar</Button>
    </form>

    {results.length > 0 && <div className={styles.results}>
      {results.map((p) => <button key={p.id} type="button" className={styles.result} onClick={() => addProduct(p)}>
        <strong>{p.name}</strong><span>{p.sku} · {money.format(Number(p.sale_price))}</span>
      </button>)}
    </div>}

    <div className={styles.cart}>
      {cart.length === 0 ? <p className={styles.empty}>Carrito vacío. Escanea un producto para comenzar.</p> : <>
        <table className={styles.table}>
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Importe</th><th /></tr></thead>
          <tbody>
            {cart.map((item) => <tr key={item.id}>
              <td><strong>{item.name}</strong><div className={styles.sku}>{item.sku}</div></td>
              <td><div className={styles.qty}>
                <button type="button" onClick={() => changeQty(item.id, -1)} aria-label="Quitar uno">−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => changeQty(item.id, 1)} aria-label="Agregar uno">+</button>
              </div></td>
              <td>{money.format(Number(item.sale_price))}</td>
              <td>{money.format(Number(item.sale_price) * item.quantity)}</td>
              <td><button type="button" className={styles.remove} onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.name}`}>×</button></td>
            </tr>)}
          </tbody>
        </table>
        <div className={styles.totals}>
          <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
          <div><span>IVA</span><strong>{money.format(tax)}</strong></div>
          <div className={styles.grand}><span>Total</span><strong>{money.format(total)}</strong></div>
        </div>
        <div className={styles.pay}>
          <label className={styles.label}>Método de pago
            <select className={styles.select} value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </label>
          {payment === 'cash' && <Field label="Monto recibido" type="number" min="0" step="0.01"
            value={received} onChange={(e) => setReceived(e.target.value)} />}
          <Button onClick={checkout} disabled={loading}>{loading ? 'Procesando…' : `Cobrar ${money.format(total)}`}</Button>
        </div>
      </>}
    </div>

    {error && <Notice tone="danger">{error}</Notice>}
    {notice && <Notice tone="success">{notice}</Notice>}
    {sale && <Notice tone="success">Venta {sale.sale_number} registrada por {money.format(sale.total)}.</Notice>}
  </>;
}