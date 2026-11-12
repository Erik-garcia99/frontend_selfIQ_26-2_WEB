import { useState } from 'react';
import { Button, Notice, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { issueBranchToken, issueBusinessToken } from '../../services/branchService';
import styles from './admin.module.css';

export default function Tokens() {
  const { user, accessToken } = useAuth();
  const { branchId, branches } = useDevices();
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const genBranch = async () => {
    try { const r = await issueBranchToken(branchId, accessToken); setToken(r.branch_token); setMessage('Token de sucursal generado.'); }
    catch (e) { setMessage(e.message || 'Error'); }
  };
  const genBusiness = async () => {
    try { const r = await issueBusinessToken(user?.business_id, accessToken); setToken(r.business_token); setMessage('Token de empresa generado.'); }
    catch (e) { setMessage(e.message || 'Error'); }
  };

  return <>
    <PageHeader title="Tokens de acceso" />
    {message && <Notice tone={message.includes('generado') ? 'success' : 'danger'}>{message}</Notice>}
    <div className={styles.row}>
      <Button onClick={genBranch}>Token de sucursal</Button>
      {user?.role?.toLowerCase() === 'owner' || user?.is_superuser ? <Button onClick={genBusiness}>Token de empresa</Button> : null}
    </div>
    {token && <div className={styles.token}>{token}</div>}
  </>;
}