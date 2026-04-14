import ProgressBar from "./ProgressBar";
import { mediaUrl, money } from "../utils/format";

export default function AdminRafflePreview({
  data,
  prizes = [],
  bannerPreview = null,
  logoPreview = null,
}) {
  const bannerSrc = bannerPreview || mediaUrl(data.banner_path);
  const logoSrc = logoPreview || mediaUrl(data.logo_path);

  return (
    <div className="glass-card preview-card">
      <div className="preview-header">
        <h2>Pré-visualização ao vivo</h2>
        <span className={`status-badge ${data.status || "draft"}`}>
          {data.status || "draft"}
        </span>
      </div>

      {bannerSrc ? (
        <div className="preview-banner">
          <img src={bannerSrc} alt="Banner da rifa" />
        </div>
      ) : (
        <div className="preview-banner preview-banner-empty">
          <span>Banner da rifa</span>
        </div>
      )}

      <div
        className="preview-body"
        style={{
          background: data.background_color || "#6D28D9",
          color: data.text_color || "#FFFFFF",
        }}
      >
        <div className="preview-top">
          {logoSrc ? (
            <img src={logoSrc} alt="Logo da rifa" className="preview-logo" />
          ) : (
            <div className="preview-logo preview-logo-empty">Logo</div>
          )}

          <div>
            <h1>{data.title || "Título da rifa"}</h1>
            <p>{data.subtitle || "Subtítulo da rifa"}</p>
          </div>
        </div>

        <p className="preview-description">
          {data.description || "A descrição da rifa vai aparecer aqui."}
        </p>

        <div className="raffle-stats-large">
          <div className="mini-stat">
            <span>Valor por cota</span>
            <strong>{money(data.price_per_ticket || 0)}</strong>
          </div>

          <div className="mini-stat">
            <span>Total de números</span>
            <strong>{data.total_numbers || 0}</strong>
          </div>

          <div className="mini-stat">
            <span>Vendidos</span>
            <strong>0</strong>
          </div>

          <div className="mini-stat">
            <span>Disponíveis</span>
            <strong>{data.total_numbers || 0}</strong>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="progress-label">
            <span>Progresso da rifa</span>
            <strong>0%</strong>
          </div>
          <ProgressBar value={0} />
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            type="button"
            style={{
              background: data.button_color || "#F59E0B",
              color: data.button_text_color || "#111827",
            }}
          >
            Comprar cotas
          </button>
        </div>
      </div>

      <div className="preview-prizes">
        <h3>Prêmios</h3>

        {prizes.length ? (
          prizes.map((prize, index) => {
            const imageSrc = prize.previewUrl || mediaUrl(prize.image_path);

            return (
              <div key={prize.id || prize.tempId || index} className="preview-prize-card">
                {imageSrc ? (
                  <img src={imageSrc} alt={prize.title || `Prêmio ${index + 1}`} className="preview-prize-image" />
                ) : (
                  <div className="preview-prize-image preview-prize-image-empty">
                    Imagem
                  </div>
                )}

                <div>
                  <strong>{prize.title || `Prêmio ${index + 1}`}</strong>
                  <p>{prize.description || "Descrição do prêmio"}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>Nenhum prêmio adicionado ainda.</p>
        )}
      </div>
    </div>
  );
}