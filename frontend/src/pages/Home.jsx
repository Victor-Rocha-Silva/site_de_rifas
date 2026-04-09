import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    api.get("/teste")
      .then((response) => setMensagem(response.data.message))
      .catch(() => setMensagem("Erro ao conectar com a API"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Projeto Rifa</h1>
      <p>{mensagem}</p>

      <hr />

      <h2>Rifa Exemplo</h2>
      <p>Prêmio: Combo de lanches</p>
      <p>Valor por número: R$ 2,00</p>
      <p>Números disponíveis: 83</p>

      <button>Comprar números</button>
    </div>
  );
}

export default Home;