import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import uploadImage from "../services/uploadImage";
import AdminRafflePreview from "../components/AdminRafflePreview";

export default function AdminCreateRaffle() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    instagram_url: "",
    total_numbers: 100,
    price_per_ticket: 1,
    status: "active",
    background_color: "#6D28D9",
    text_color: "#FFFFFF",
    button_color: "#F59E0B",
    button_text_color: "#111827",
    prize1_title: "",
    prize1_description: "",
    prize2_title: "",
    prize2_description: "",
  });

  const [files, setFiles] = useState({
    banner: null,
    logo: null,
    prize1: null,
    prize2: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    banner: null,
    logo: null,
    prize1: null,
    prize2: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const bannerUrl = files.banner ? URL.createObjectURL(files.banner) : null;
    const logoUrl = files.logo ? URL.createObjectURL(files.logo) : null;
    const prize1Url = files.prize1 ? URL.createObjectURL(files.prize1) : null;
    const prize2Url = files.prize2 ? URL.createObjectURL(files.prize2) : null;

    setPreviewUrls({
      banner: bannerUrl,
      logo: logoUrl,
      prize1: prize1Url,
      prize2: prize2Url,
    });

    return () => {
      if (bannerUrl) URL.revokeObjectURL(bannerUrl);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      if (prize1Url) URL.revokeObjectURL(prize1Url);
      if (prize2Url) URL.revokeObjectURL(prize2Url);
    };
  }, [files]);

  const previewPrizes = useMemo(() => {
    return [
      form.prize1_title
        ? {
            tempId: "prize1",
            title: form.prize1_title,
            description: form.prize1_description,
            previewUrl: previewUrls.prize1,
          }
        : null,
      form.prize2_title
        ? {
            tempId: "prize2",
            title: form.prize2_title,
            description: form.prize2_description,
            previewUrl: previewUrls.prize2,
          }
        : null,
    ].filter(Boolean);
  }, [form, previewUrls]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const bannerUpload = files.banner ? await uploadImage(files.banner) : null;
      const logoUpload = files.logo ? await uploadImage(files.logo) : null;
      const prize1Upload = files.prize1 ? await uploadImage(files.prize1) : null;
      const prize2Upload = files.prize2 ? await uploadImage(files.prize2) : null;

      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        instagram_url: form.instagram_url || null,
        banner_path: bannerUpload?.path || null,
        logo_path: logoUpload?.path || null,
        total_numbers: Number(form.total_numbers),
        price_per_ticket: Number(form.price_per_ticket),
        status: form.status,
        design: {
          background_color: form.background_color,
          text_color: form.text_color,
          button_color: form.button_color,
          button_text_color: form.button_text_color,
        },
        prizes: [
          form.prize1_title
            ? {
                title: form.prize1_title,
                description: form.prize1_description || null,
                image_path: prize1Upload?.path || null,
                sort_order: 1,
              }
            : null,
          form.prize2_title
            ? {
                title: form.prize2_title,
                description: form.prize2_description || null,
                image_path: prize2Upload?.path || null,
                sort_order: 2,
              }
            : null,
        ].filter(Boolean),
      };

      await api.post("/admin/raffles", payload);

      setMessage("Rifa criada com sucesso.");

      setTimeout(() => {
        navigate("/admin/rifas");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar rifa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container admin-preview-layout">
      <div>
        <div className="page-header">
          <h1>Nova rifa</h1>
          <p>Crie uma nova rifa com tema, imagens e prêmios.</p>
        </div>

        <form className="glass-card" onSubmit={handleSubmit}>
          <label>Título</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Rifa iPhone 15"
            required
          />

          <br /><br />

          <label>Subtítulo</label>
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Ex: Participe agora"
          />

          <br /><br />

          <label>Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descreva a rifa"
          />

          <br /><br />

          <label>Instagram URL</label>
          <input
            name="instagram_url"
            value={form.instagram_url}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />

          <br /><br />

          <label>Banner</label>
          <input
            type="file"
            name="banner"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <label>Logo</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <label>Total de números</label>
          <input
            type="number"
            name="total_numbers"
            value={form.total_numbers}
            onChange={handleChange}
            min="1"
            max="100000"
            required
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

          <h2>Cores</h2>

          <label>Cor de fundo</label>
          <input
            name="background_color"
            value={form.background_color}
            onChange={handleChange}
            placeholder="#6D28D9"
          />

          <br /><br />

          <label>Cor do texto</label>
          <input
            name="text_color"
            value={form.text_color}
            onChange={handleChange}
            placeholder="#FFFFFF"
          />

          <br /><br />

          <label>Cor do botão</label>
          <input
            name="button_color"
            value={form.button_color}
            onChange={handleChange}
            placeholder="#F59E0B"
          />

          <br /><br />

          <label>Cor do texto do botão</label>
          <input
            name="button_text_color"
            value={form.button_text_color}
            onChange={handleChange}
            placeholder="#111827"
          />

          <br /><br />

          <h2>Prêmio 1</h2>

          <label>Título do prêmio 1</label>
          <input
            name="prize1_title"
            value={form.prize1_title}
            onChange={handleChange}
            placeholder="Ex: iPhone 15 128GB"
          />

          <br /><br />

          <label>Descrição do prêmio 1</label>
          <textarea
            name="prize1_description"
            value={form.prize1_description}
            onChange={handleChange}
            placeholder="Descrição do prêmio"
          />

          <br /><br />

          <label>Imagem do prêmio 1</label>
          <input
            type="file"
            name="prize1"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <h2>Prêmio 2</h2>

          <label>Título do prêmio 2</label>
          <input
            name="prize2_title"
            value={form.prize2_title}
            onChange={handleChange}
            placeholder="Ex: Capinha Premium"
          />

          <br /><br />

          <label>Descrição do prêmio 2</label>
          <textarea
            name="prize2_description"
            value={form.prize2_description}
            onChange={handleChange}
            placeholder="Descrição do prêmio"
          />

          <br /><br />

          <label>Imagem do prêmio 2</label>
          <input
            type="file"
            name="prize2"
            accept="image/*"
            onChange={handleFileChange}
          />

          <br /><br />

          <button type="submit" disabled={loading}>
            {loading ? "Criando rifa..." : "Criar rifa"}
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