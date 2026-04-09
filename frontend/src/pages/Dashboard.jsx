function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <p>Total vendido: R$ 250,00</p>
      <p>Total de números: 100</p>
      <p>Números vendidos: 40</p>
      <p>Números disponíveis: 60</p>
      <p>Lucro estimado: R$ 180,00</p>

      <hr />

      <h2>Participantes</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Quantidade</th>
            <th>Números</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Victor</td>
            <td>15999999999</td>
            <td>3</td>
            <td>12, 45, 78</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;