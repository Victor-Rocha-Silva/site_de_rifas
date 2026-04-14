export default function EmptyState({
    title = "Nada por aqui ainda",
    description = "Quando houver informações disponíveis, elas aparecerão aqui.",
    action = null,
  }) {
    return (
      <div className="state-card">
        <div className="state-icon">○</div>
        <h2>{title}</h2>
        <p>{description}</p>
        {action && <div className="state-action">{action}</div>}
      </div>
    );
  }