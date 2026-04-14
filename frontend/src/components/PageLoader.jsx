export default function PageLoader({ title = "Carregando", description = "Aguarde um instante..." }) {
    return (
      <div className="state-card state-card-center">
        <div className="state-spinner" />
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    );
  }