import { useState } from 'react';
import { Button, Field, Notice, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { createBranch } from '../../services/branchService';
import styles from './admin.module.css';

export default function CreateBranch() {
  const { user, accessToken } = useAuth();
  const { reloadBranches } = useDevices();
  const [name, setName] = useState('');
  const [businessToken, setBusinessToken] = useState('');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    try {
      const r = await createBranch({ name, business_token: businessToken }, accessToken);
      setResult(r.branch_token);
      setMessage('Sucursal creada.');
      reloadBranches();
    } catch (e) { setMessage(e.message || 'Error'); }
  };

  return <>
    <PageHeader title="Crear sucursal" />
    {message && <Notice tone={message === 'Sucursal creada.' ? 'success' : 'danger'}>{message}</Notice>}
    <div className={styles.wrap || ''}>
      <Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Token global de empresa" value={businessToken} onChange={(e) => setBusinessToken(e.target.value)} />
      <Button onClick={submit}>Crear</Button>
      {result && <div className={styles.token}>{result}</div>}
    </div>
  </>;
}