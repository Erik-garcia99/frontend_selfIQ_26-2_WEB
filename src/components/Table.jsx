import styles from './Table.module.css';

export function Table({ columns, rows, empty = 'Sin datos.', loading = false, onRowClick }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={columns.length} className={styles.muted}>Cargando…</td></tr>}
          {!loading && rows.length === 0 && <tr><td colSpan={columns.length} className={styles.muted}>{empty}</td></tr>}
          {!loading && rows.map((row, i) => (
            <tr key={row.id ?? i} onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? styles.clickable : ''}>
              {columns.map((col) => <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}