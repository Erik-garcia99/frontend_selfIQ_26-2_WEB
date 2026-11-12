import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Modal, Notice, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { issueBranchToken, issueBusinessToken } from '../../services/branchService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import { canCreateBranch } from '../../utils/validation';
import TokenBox from './TokenBox';
import styles from './admin.module.css';

// Tarjeta genérica: genera o reemplaza un token. Un token nuevo invalida el anterior.
function TokenCard({ title, text, field, issue, buttonLabel, disabledReason }) {
  const [token, setToken] = useState('');
  const [confirm, setConfirm] = useState(false);
  const task = useAsyncAction();
  const generate = async () => {
    const result = await task.run(issue);
    setConfirm(false);
    if (result) setToken(result[field]);
  };
  return <Card title={title}>
    <p className={styles.text}>{text}</p>
    {disabledReason ? <Notice tone="info">{disabledReason}</Notice> : <>
      {token && <><TokenBox token={token} />
        <p className={styles.tokenNote}>Cópialo ahora: por seguridad solo se muestra en esta sesión.</p></>}
      <Notice>{!confirm && task.error}</Notice>
      <Button variant={token ? 'secondary' : 'primary'} onClick={() => { task.setError(''); setConfirm(true); }}>{token ? 'Generar otro' : buttonLabel}</Button>
    </>}
    <Modal open={confirm} title="¿Generar token nuevo?" busy={task.loading} onClose={() => setConfirm(false)}
      footer={<><Button variant="secondary" disabled={task.loading} onClick={() => setConfirm(false)}>Cancelar</Button>
        <Button loading={task.loading} loadingLabel="Generando…" onClick={generate}>Generar</Button></>}>
      Si ya existía un token, dejará de funcionar y tendrás que compartir el nuevo.
      <Notice>{task.error}</Notice>
    </Modal>
  </Card>;
}

export default function Tokens() {
  const { user, accessToken } = useAuth();
  const { branchId, branches } = useDevices();
  const branch = branches.find((item) => item.id === branchId);
  const businessId = user?.business_id;

  return <>
    <PageHeader title="Tokens de acceso" subtitle="Para registrar personal y crear sucursales."
      actions={<Link to="/personal"><Button variant="ghost">Volver a Personal</Button></Link>} />
    <div className={styles.stack}>
      {branchId
        ? <TokenCard key={branchId} title={`Token de la sucursal${branch ? `: ${branch.name}` : ''}`}
            text="Quien se registre con este token queda asociado a la sucursal seleccionada en la barra superior."
            field="branch_token" buttonLabel="Generar token de sucursal" issue={() => issueBranchToken(branchId, accessToken)} />
        : <Card title="Token de la sucursal"><EmptyState icon="key" title="Sin sucursal seleccionada">Elige una sucursal en la barra superior para generar su token.</EmptyState></Card>}
      {canCreateBranch(user) && <TokenCard title="Token global de empresa"
        text="Se usa para crear sucursales nuevas."
        field="business_token" buttonLabel="Generar token de empresa" issue={() => issueBusinessToken(businessId, accessToken)}
        disabledReason={businessId ? '' : 'Tu cuenta no tiene un negocio asociado, así que no se puede generar este token.'} />}
    </div>
  </>;
}
