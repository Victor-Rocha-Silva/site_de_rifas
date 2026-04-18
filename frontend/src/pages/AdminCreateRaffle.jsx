import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import { useToast } from "../context/ToastContext";

function generateSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey])) {
      return data.errors[firstKey][0];
    }
  }

  return data?.message || "Não foi possível criar a rifa.";
}

function emptyPrize(sortOrder = 1) {
  return {
    title: "",
    description: "",
    image_path: "",
    sort_order: sortOrder,
    preview: "",
    uploading: false,
  };
}

export default function AdminCreateRaffle() {
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    instagram_url: "",
    banner_path: "",
    logo_path: "",
    total_numbers: 100,
    price_per_ticket: "2.50",
    status: "draft",
    starts_at: "",
    ends_at: "",
    draw_at: "",
    design: {
      background_color: "#0f172a",
      text_color: "#ffffff",
      button_color: "#7c3aed",
      button_text_color: "#ffffff",
    },
  });

  const [slugTouched, setSlugTouched] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [prizes, setPrizes] = useState([emptyPrize(1)]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const previewData = useMemo(() => {
    return {
      title: form.title || "Título da rifa",
      subtitle: form.subtitle || "Subtítulo da sua rifa",
      description:
        form.description || "Descrição da rifa para pré-visualização.",
      background_color: form.design.background_color || "#0f172a",
      text_color: form.design.text_color || "#ffffff",
      button_color: form.design.button_color || "#7c3aed",
      button_text_color: form.design.button_text_color || "#ffffff",
      total_numbers: Number(form.total_numbers || 0),
      price_per_ticket: Number(form.price_per_ticket || 0),
      prizes,
      bannerPreview,
      logoPreview,
      status: form.status,
    };
  }, [form, prizes, bannerPreview, logoPreview]);

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateDesign(field, value) {
    setForm((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        [field]: value,
      },
    }));
  }

  function handleTitleChange(value) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : generateSlug(value),
    }));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    setForm((prev) => ({
      ...prev,
      slug: generateSlug(value),
    }));
  }

  function updatePrize(index, field, value) {
    setPrizes((prev) =>
      prev.map((prize, i) =>
        i === index
          ? {
              ...prize,
              [field]: value,
            }
          : prize
      )
    );
  }

  function addPrize() {
    setPrizes((prev) => [...prev, emptyPrize(prev.length + 1)]);
  }

  function removePrize(index) {
    setPrizes((prev) => {
      if (prev.length === 1) return prev;

      return prev
        .filter((_, i) => i !== index)
        .map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        }));
    });
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/admin/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return (
      response?.data?.path ||
      response?.data?.image_path ||
      response?.data?.file_path ||
      response?.data?.url ||
      ""
    );
  }

  async function handleBannerUpload(file) {
    if (!file) return;

    setErrorMessage("");
    setBannerPreview(URL.createObjectURL(file));
    info("Enviando banner", "A imagem do banner está sendo enviada.");

    try {
      const path = await uploadImage(file);
      updateForm("banner_path", path);
      success("Banner enviado", "O banner foi salvo com sucesso.");
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showError("Falha no banner", message);
    }
  }

  async function handleLogoUpload(file) {
    if (!file) return;

    setErrorMessage("");
    setLogoPreview(URL.createObjectURL(file));
    info("Enviando logo", "A imagem da logo está sendo enviada.");

    try {
      const path = await uploadImage(file);
      updateForm("logo_path", path);
      success("Logo enviada", "A logo foi salva com sucesso.");
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showError("Falha na logo", message);
    }
  }

  async function handlePrizeImageUpload(index, file) {
    if (!file) return;

    setErrorMessage("");
    updatePrize(index, "preview", URL.createObjectURL(file));
    updatePrize(index, "uploading", true);
    info("Enviando imagem", `A imagem do prêmio ${index + 1} está sendo enviada.`);

    try {
      const path = await uploadImage(file);
      updatePrize(index, "image_path", path);
      success("Imagem enviada", `A imagem do prêmio ${index + 1} foi salva.`);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showError("Falha no upload", message);
    } finally {
      updatePrize(index, "uploading", false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        total_numbers: Number(form.total_numbers),
        price_per_ticket: Number(form.price_per_ticket),
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        draw_at: form.draw_at || null,
        prizes: prizes
          .filter((prize) => prize.title.trim() !== "")
          .map((prize, index) => ({
            title: prize.title,
            description: prize.description || null,
            image_path: prize.image_path || null,
            sort_order: index + 1,
          })),
      };

      await api.post("/admin/raffles", payload);

      success("Rifa criada", "A nova rifa foi cadastrada com sucesso.");
      navigate("/admin/rifas");
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showError("Erro ao criar rifa", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <div className="page-header">
          <h1>Nova rifa</h1>
          <p>Crie uma nova rifa com identidade visual, prêmios e imagens.</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <form className="glass-card" onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Dados principais</h2>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Preencha os dados da sua rifa.
                </p>
              </div>

              <Link to="/admin/rifas">
                <button type="button" className="secondary-btn">
                  Voltar
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label>Título da rifa</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Rifa iPhone 15"
                />
              </div>

              <div>
                <label>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="rifa-iphone-15"
                />
                <small className="muted-text">URL: /rifa/{form.slug || "slug-da-rifa"}</small>
              </div>

              <div>
                <label>Subtítulo</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => updateForm("subtitle", e.target.value)}
                  placeholder="Ex: Participe agora"
                />
              </div>

              <div>
                <label>Descrição</label>
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Descreva a rifa"
                />
              </div>

              <div>
                <label>Instagram</label>
                <input
                  type="url"
                  value={form.instagram_url}
                  onChange={(e) => updateForm("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/suarifa"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                <div>
                  <label>Total de números</label>
                  <input
                    type="number"
                    min="1"
                    value={form.total_numbers}
                    onChange={(e) => updateForm("total_numbers", e.target.value)}
                  />
                </div>

                <div>
                  <label>Valor por cota</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price_per_ticket}
                    onChange={(e) => updateForm("price_per_ticket", e.target.value)}
                  />
                </div>

                <div>
                  <label>Status inicial</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativa</option>
                    <option value="paused">Pausada</option>
                    <option value="finished">Finalizada</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                <div>
                  <label>Início</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => updateForm("starts_at", e.target.value)}
                  />
                </div>

                <div>
                  <label>Encerramento</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => updateForm("ends_at", e.target.value)}
                  />
                </div>

                <div>
                  <label>Sorteio</label>
                  <input
                    type="datetime-local"
                    value={form.draw_at}
                    onChange={(e) => updateForm("draw_at", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ marginBottom: 12 }}>Imagens principais</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label>Banner da rifa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e.target.files?.[0])}
                  />
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 16,
                        marginTop: 12,
                        border: "1px solid var(--line)",
                      }}
                    />
                  )}
                </div>

                <div>
                  <label>Logo da rifa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{
                        width: 150,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 20,
                        marginTop: 12,
                        border: "1px solid var(--line)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ marginBottom: 12 }}>Cores da rifa</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                <div>
                  <label>Fundo</label>
                  <input
                    type="color"
                    value={form.design.background_color}
                    onChange={(e) =>
                      updateDesign("background_color", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Texto</label>
                  <input
                    type="color"
                    value={form.design.text_color}
                    onChange={(e) => updateDesign("text_color", e.target.value)}
                  />
                </div>

                <div>
                  <label>Botão</label>
                  <input
                    type="color"
                    value={form.design.button_color}
                    onChange={(e) => updateDesign("button_color", e.target.value)}
                  />
                </div>

                <div>
                  <label>Texto do botão</label>
                  <input
                    type="color"
                    value={form.design.button_text_color}
                    onChange={(e) =>
                      updateDesign("button_text_color", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0 }}>Prêmios</h2>

                <button type="button" onClick={addPrize}>
                  Adicionar prêmio
                </button>
              </div>

              <div style={{ display: "grid", gap: 18 }}>
                {prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="glass-card"
                    style={{ padding: 18 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>Prêmio {index + 1}</h3>

                      {prizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrize(index)}
                          style={{ background: "#991b1b", color: "#fff" }}
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gap: 14 }}>
                      <div>
                        <label>Título do prêmio {index + 1}</label>
                        <input
                          type="text"
                          value={prize.title}
                          onChange={(e) =>
                            updatePrize(index, "title", e.target.value)
                          }
                          placeholder="Ex: iPhone 15 128GB"
                        />
                      </div>

                      <div>
                        <label>Descrição do prêmio {index + 1}</label>
                        <textarea
                          rows="4"
                          value={prize.description}
                          onChange={(e) =>
                            updatePrize(index, "description", e.target.value)
                          }
                          placeholder="Descrição do prêmio"
                        />
                      </div>

                      <div>
                        <label>Imagem do prêmio {index + 1}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handlePrizeImageUpload(index, e.target.files?.[0])
                          }
                        />

                        {prize.uploading && (
                          <small className="muted-text">Enviando imagem...</small>
                        )}

                        {prize.preview && (
                          <img
                            src={prize.preview}
                            alt={`Preview prêmio ${index + 1}`}
                            style={{
                              width: 180,
                              height: 180,
                              objectFit: "cover",
                              borderRadius: 16,
                              marginTop: 12,
                              border: "1px solid var(--line)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button type="submit" disabled={saving}>
                {saving ? "Criando rifa..." : "Criar rifa"}
              </button>

              {errorMessage && (
                <p className="error" style={{ marginTop: 12 }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </form>

          <div className="glass-card">
            <h2 style={{ marginTop: 0 }}>Pré-visualização</h2>
            <p className="muted-text">
              Veja uma ideia rápida de como a rifa vai aparecer.
            </p>

            <div
              style={{
                marginTop: 18,
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "#09111f",
              }}
            >
              {previewData.bannerPreview ? (
                <img
                  src={previewData.bannerPreview}
                  alt="Banner"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  Banner da rifa
                </div>
              )}

              <div
                style={{
                  padding: 20,
                  background: previewData.background_color,
                  color: previewData.text_color,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    {previewData.logoPreview ? (
                      <img
                        src={previewData.logoPreview}
                        alt="Logo"
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 18,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.08)",
                        }}
                      >
                        Logo
                      </div>
                    )}

                    <div>
                      <h3 style={{ margin: 0 }}>{previewData.title}</h3>
                      <p style={{ margin: "6px 0 0 0", opacity: 0.9 }}>
                        {previewData.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`status-badge ${previewData.status}`}>
                    {previewData.status}
                  </span>
                </div>

                <p style={{ marginTop: 16, lineHeight: 1.7 }}>
                  {previewData.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <span style={{ display: "block", opacity: 0.8 }}>
                      Valor por cota
                    </span>
                    <strong>
                      R$ {previewData.price_per_ticket.toFixed(2).replace(".", ",")}
                    </strong>
                  </div>

                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <span style={{ display: "block", opacity: 0.8 }}>
                      Total de números
                    </span>
                    <strong>{previewData.total_numbers}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: 18,
                    background: previewData.button_color,
                    color: previewData.button_text_color,
                  }}
                >
                  Comprar cotas
                </button>

                {!!previewData.prizes.length && (
                  <div style={{ marginTop: 22 }}>
                    <h4 style={{ marginBottom: 12 }}>Prêmios</h4>

                    <div style={{ display: "grid", gap: 10 }}>
                      {previewData.prizes
                        .filter((prize) => prize.title)
                        .map((prize, index) => (
                          <div
                            key={index}
                            style={{
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 16,
                              padding: 12,
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            <strong>{prize.title}</strong>
                            {prize.description && (
                              <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
                                {prize.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}