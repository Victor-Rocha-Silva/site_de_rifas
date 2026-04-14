import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import uploadImage from "../services/uploadImage";
import { mediaUrl } from "../utils/format";
import AdminRafflePreview from "../components/AdminRafflePreview";

function emptyNewPrize() {
  return {
    tempId: crypto.randomUUID(),
    title: "",
    description: "",
    sort_order: 0,
    image_path: "",
    imageFile: null,
  };
}

export default function AdminEditRaffle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [files, setFiles] = useState({
    banner: null,
    logo: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    banner: null,
    logo: null,
  });

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    instagram_url: "",
    banner_path: "",
    logo_path: "",
    price_per_ticket: 1,
    status: "active",
    background_color: "#6D28D9",
    text_color: "#FFFFFF",
    button_color: "#F59E0B",
    button_text_color: "#111827",
    total_numbers: 0,
  });

  const [existingPrizes, setExistingPrizes] = useState([]);
  const [newPrizes, setNewPrizes] = useState([]);

  useEffect(() => {
    const bannerUrl = files.banner ? URL.createObjectURL(files.banner) : null;
    const logoUrl = files.logo ? URL.createObjectURL(files.logo) : null;

    setPreviewUrls({
      banner: bannerUrl,
      logo: logoUrl,
    });

    return () => {
      if (bannerUrl) URL.revokeObjectURL(bannerUrl);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [files]);

  useEffect(() => {
    async function loadRaffle() {
      try {
        const response = await api.get(`/admin/raffles/${id}`);
        const data = response.data;

        setRaffle(data);

        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          instagram_url: data.instagram_url || "",
          banner_path: data.banner_path || "",
          logo_path: data.logo_path || "",
          price_per_ticket: data.price_per_ticket || 1,
          status: data.status || "active",
          background_color: data.design?.background_color || "#6D28D9",
          text_color: data.design?.text_color || "#FFFFFF",
          button_color: data.design?.button_color || "#F59E0B",
          button_text_color: data.design?.button_text_color || "#111827",
          total_numbers: data.total_numbers || 0,
        });

        setExistingPrizes(
          (data.prizes || []).map((prize) => ({
            id: prize.id,
            title: prize.title || "",
            description: prize.description || "",
            sort_order: prize.sort_order ?? 0,
            image_path: prize.image_path || "",
            imageFile: null,
            previewUrl: null,
          }))
        );

        setNewPrizes([]);
      } catch {
        setError("Erro ao carregar a rifa.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffle();
  }, [id]);

  const previewPrizes = useMemo(() => {
    const existing = existingPrizes.map((prize) => ({
      ...prize,
      previewUrl: prize.previewUrl || null,
    }));

    const news = newPrizes.map((prize) => ({
      ...prize,
      previewUrl: prize.previewUrl || null,
    }));

    return [...existing, ...news].filter((prize) => prize.title?.trim());
  }, [existingPrizes, newPrizes]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const { name, files: selectedFiles } = e.target;

    setFiles((prev) => ({
      ...prev,
      [name]: selectedFiles?.[0] || null,
    }));
  }

  function handleExistingPrizeChange(prizeId, field, value) {
    setExistingPrizes((prev) =>
      prev.map((prize) =>
        prize.id === prizeId
          ? {
              ...prize,
              [field]: value,
            }
          : prize
      )
    );
  }

  function handleExistingPrizeFileChange(prizeId, file) {
    setExistingPrizes((prev) =>
      prev.map((prize) => {
        if (prize.id !== prizeId) return prize;

        if (prize.previewUrl) {
          URL.revokeObjectURL(prize.previewUrl);
        }

        return {
          ...prize,
          imageFile: file || null,
          previewUrl: file ? URL.createObjectURL(file) : null,
        };
      })
    );
  }

  function handleNewPrizeChange(tempId, field, value) {
    setNewPrizes((prev) =>
      prev.map((prize) =>
        prize.tempId === tempId
          ? {
              ...prize,
              [field]: value,
            }
          : prize
      )
    );
  }

  function handleNewPrizeFileChange(tempId, file) {
    setNewPrizes((prev) =>
      prev.map((prize) => {
        if (prize.tempId !== tempId) return prize;

        if (prize.previewUrl) {
          URL.revokeObjectURL(prize.previewUrl);
        }

        return {
          ...prize,
          imageFile: file || null,
          previewUrl: file ? URL.createObjectURL(file) : null,
        };
      })
    );
  }

  function addNewPrize() {
    setNewPrizes((prev) => [...prev, emptyNewPrize()]);
  }

  function removeNewPrize(tempId) {
    setNewPrizes((prev) => {
      const target = prev.find((prize) => prize.tempId === tempId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((prize) => prize.tempId !== tempId);
    });
  }

  async function deleteExistingPrize(prizeId) {
    const confirmed = window.confirm("Deseja excluir este prêmio?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/prizes/${prizeId}`);

      setExistingPrizes((prev) => {
        const target = prev.find((prize) => prize.id === prizeId);
        if (target?.previewUrl) {
          URL.revokeObjectURL(target.previewUrl);
        }
        return prev.filter((prize) => prize.id !== prizeId);
      });

      setMessage("Prêmio excluído com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao excluir prêmio.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const bannerUpload = files.banner ? await uploadImage(files.banner) : null;
      const logoUpload = files.logo ? await uploadImage(files.logo) : null;

      const rafflePayload = {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        instagram_url: form.instagram_url || null,
        banner_path: bannerUpload?.path || form.banner_path || null,
        logo_path: logoUpload?.path || form.logo_path || null,
        price_per_ticket: Number(form.price_per_ticket),
        status: form.status,
        design: {
          background_color: form.background_color,
          text_color: form.text_color,
          button_color: form.button_color,
          button_text_color: form.button_text_color,
        },
      };

      await api.put(`/admin/raffles/${id}`, rafflePayload);

      for (const prize of existingPrizes) {
        const uploaded = prize.imageFile ? await uploadImage(prize.imageFile) : null;

        await api.put(`/admin/prizes/${prize.id}`, {
          title: prize.title,
          description: prize.description || null,
          sort_order: Number(prize.sort_order || 0),
          image_path: uploaded?.path || prize.image_path || null,
        });
      }

      for (const prize of newPrizes) {
        if (!prize.title.trim()) continue;

        const uploaded = prize.imageFile ? await uploadImage(prize.imageFile) : null;

        await api.post(`/admin/raffles/${id}/prizes`, {
          title: prize.title,
          description: prize.description || null,
          sort_order: Number(prize.sort_order || 0),
          image_path: uploaded?.path || null,
        });
      }

      setMessage("Rifa e prêmios atualizados com sucesso.");

      setTimeout(() => {
        navigate("/admin/rifas");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar a rifa.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="container">Carregando rifa...</div>;
  }

  if (!raffle) {
    return <div className="container">Rifa não encontrada.</div>;
  }

  return (
    <div className="container admin-preview-layout">
      <div>
        <div className="page-header">
          <h1>Editar rifa</h1>
          <p>Atualize as informações da rifa e gerencie os prêmios.</p>
        </div>

        <form className="glass-card" onSubmit={handleSubmit}>
          <label>Título</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <br /><br />

          <label>Subtítulo</label>
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
          />

          <br /><br />

          <label>Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <br /><br />

          <label>Instagram URL</label>
          <input
            name="instagram_url"
            value={form.instagram_url}
            onChange={handleChange}
          />

          <br /><br />

          <label>Preço por cota</label>
          <input
            type="number"
            step="0.01"
            name="price_per_ticket"
            value={form.price_per_ticket}
            onChange={handleChange}
            min="0.01"
            required
          />

          <br /><br />

          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="finished">Finalizada</option>
          </select>

          <br /><br />

          <h2>Banner atual</h2>
          {form.banner_path ? (
            <img
              src={mediaUrl(form.banner_path)}
              alt="Banner atual"
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 16,
                marginBottom: 12,
              }}
            />
          ) : (
            <p>Sem banner cadastrado.</p>
          )}

          <label>Novo banner</label>
          <input
            type="file"
            name="banner"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <h2>Logo atual</h2>
          {form.logo_path ? (
            <img
              src={mediaUrl(form.logo_path)}
              alt="Logo atual"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 16,
                marginBottom: 12,
              }}
            />
          ) : (
            <p>Sem logo cadastrada.</p>
          )}

          <label>Nova logo</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <h2>Cores</h2>

          <label>Cor de fundo</label>
          <input
            name="background_color"
            value={form.background_color}
            onChange={handleChange}
          />

          <br /><br />

          <label>Cor do texto</label>
          <input
            name="text_color"
            value={form.text_color}
            onChange={handleChange}
          />

          <br /><br />

          <label>Cor do botão</label>
          <input
            name="button_color"
            value={form.button_color}
            onChange={handleChange}
          />

          <br /><br />

          <label>Cor do texto do botão</label>
          <input
            name="button_text_color"
            value={form.button_text_color}
            onChange={handleChange}
          />

          <br /><br />

          <h2>Prêmios existentes</h2>

          {existingPrizes.length ? (
            existingPrizes.map((prize, index) => (
              <div
                key={prize.id}
                className="glass-card"
                style={{ marginTop: 12, background: "rgba(255,255,255,0.03)" }}
              >
                <h3>Prêmio #{index + 1}</h3>

                <label>Título</label>
                <input
                  value={prize.title}
                  onChange={(e) =>
                    handleExistingPrizeChange(prize.id, "title", e.target.value)
                  }
                />

                <br /><br />

                <label>Descrição</label>
                <textarea
                  value={prize.description}
                  onChange={(e) =>
                    handleExistingPrizeChange(prize.id, "description", e.target.value)
                  }
                />

                <br /><br />

                <label>Ordem</label>
                <input
                  type="number"
                  value={prize.sort_order}
                  onChange={(e) =>
                    handleExistingPrizeChange(prize.id, "sort_order", e.target.value)
                  }
                />

                <br /><br />

                {prize.previewUrl || prize.image_path ? (
                  <>
                    <p>Imagem atual:</p>
                    <img
                      src={prize.previewUrl || mediaUrl(prize.image_path)}
                      alt={prize.title}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 16,
                        marginBottom: 12,
                      }}
                    />
                  </>
                ) : (
                  <p>Sem imagem cadastrada.</p>
                )}

                <label>Nova imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleExistingPrizeFileChange(prize.id, e.target.files?.[0] || null)
                  }
                />

                <br /><br />

                <button
                  type="button"
                  onClick={() => deleteExistingPrize(prize.id)}
                  style={{ background: "#ef4444" }}
                >
                  Excluir prêmio
                </button>
              </div>
            ))
          ) : (
            <p>Nenhum prêmio cadastrado.</p>
          )}

          <br />

          <div className="card-row" style={{ marginTop: 18 }}>
            <h2>Novos prêmios</h2>
            <button type="button" onClick={addNewPrize}>
              Adicionar prêmio
            </button>
          </div>

          {newPrizes.map((prize, index) => (
            <div
              key={prize.tempId}
              className="glass-card"
              style={{ marginTop: 12, background: "rgba(255,255,255,0.03)" }}
            >
              <h3>Novo prêmio #{index + 1}</h3>

              <label>Título</label>
              <input
                value={prize.title}
                onChange={(e) =>
                  handleNewPrizeChange(prize.tempId, "title", e.target.value)
                }
              />

              <br /><br />

              <label>Descrição</label>
              <textarea
                value={prize.description}
                onChange={(e) =>
                  handleNewPrizeChange(prize.tempId, "description", e.target.value)
                }
              />

              <br /><br />

              <label>Ordem</label>
              <input
                type="number"
                value={prize.sort_order}
                onChange={(e) =>
                  handleNewPrizeChange(prize.tempId, "sort_order", e.target.value)
                }
              />

              <br /><br />

              {prize.previewUrl && (
                <>
                  <p>Prévia da imagem:</p>
                  <img
                    src={prize.previewUrl}
                    alt={prize.title || "Prévia do prêmio"}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 16,
                      marginBottom: 12,
                    }}
                  />
                </>
              )}

              <label>Imagem</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleNewPrizeFileChange(prize.tempId, e.target.files?.[0] || null)
                }
              />

              <br /><br />

              <button
                type="button"
                onClick={() => removeNewPrize(prize.tempId)}
                style={{ background: "#ef4444" }}
              >
                Remover bloco
              </button>
            </div>
          ))}

          <br /><br />

          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <AdminRafflePreview
        data={form}
        prizes={previewPrizes}
        bannerPreview={previewUrls.banner}
        logoPreview={previewUrls.logo}
      />
    </div>
  );
}