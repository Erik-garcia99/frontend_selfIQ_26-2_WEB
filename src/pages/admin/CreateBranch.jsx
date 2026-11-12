import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, Modal, Notice, PageHeader, useToast } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useDevices } from '../../context/DeviceContext';
import { createBranch } from '../../services/branchService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import TokenBox from './TokenBox';
import styles from './admin.module.css';

const EMPTY = { name: '', business_token: '' };

export default function CreateBranch() {
  const { accessToken } = useAuth();
  const { reloadBranches } = useDevices();
  const toast = useToast();
  const task = useAsyncAction();
  const [form, setForm] = useState(EMPTY);
  const [created, setCreated] = useState(null);
  const bind = (key) => ({ value: form[key], disabled: task.loading, onChange: (e) => setForm((old) => ({ ...old, [key]: e.target.value })) });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return task.setError('Escribe el nombre de la sucursal.');
    if (!form.business_token.trim()) return task.setError('Pega el token global de empresa.');
    const result = await task.run(() => createBranch({ name: form.name.trim(), business_token: form.business_token.trim() }, accessToken));
    if (!result) return;
    setCreated({ name: form.name.trim(), token: result.branch_token });
    setForm(EMPTY);
    reloadBranches();
    toast.success('Sucursal creada.');
  };

  return <>
    <PageHeader title="Crear sucursal" subtitle="Alta de una nueva sucursal de tu negocio."
      actions={<Link to="/personal"><Button variant="ghost">Volver a Personal</Button></Link>} />
    <div className={styles.narrow}>
      <Card>
        <form onSubmit={submit} noValidate>
          <Field label="Nombre de la sucursal" placeholder="Sucursal Centro" autoComplete="off" {...bind('name')} />
          <Field label="Token global de empresa" autoComplete="off" spellCheck={false}
            hint="Se genera en Personal → Tokens de acceso." {...bind('business_token')} />
          <Notice>{task.error}</Notice>
          <Button type="submit" full loading={task.loading} loadingLabel="Creando…">Crear sucursal</Button>
        </form>
      </Card>
    </div>
    <Modal open={Boolean(created)} title="Sucursal creada" onClose={() => setCreated(null)}
      footer={<Button onClick={() => setCreated(null)}>Listo</Button>}>
      {created && <>
        <p><strong>{created.name}</strong> ya está disponible. Este es su token de registro para el personal:</p>
        <TokenBox token={created.token} />
        <p className={styles.tokenNote}>Cópialo ahora: por seguridad solo se muestra en esta sesión.</p>
      </>}
    </Modal>
  </>;
}
