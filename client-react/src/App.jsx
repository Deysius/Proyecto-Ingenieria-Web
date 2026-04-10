import { useState, useEffect } from "react";
import Login from "./Login";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("login");
    if (saved === "true") setIsLogged(true);
  }, []);

  const API = "http://localhost:5000/api/rutas";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem("token")
  });

  const loadRutas = async () => {
    const res = await fetch(API, {
      headers: { "Authorization": localStorage.getItem("token") }
    });
    const data = await res.json();
    setRutas(data.rutas || []);
  };

  useEffect(() => {
    if (isLogged) loadRutas();
  }, [isLogged]);

  const addRuta = async () => {
    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          nombre,
          origen,
          destino,
          hora_salida: horaSalida,
          hora_llegada: horaLlegada
        }),
      });
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          nombre,
          origen,
          destino,
          hora_salida: horaSalida,
          hora_llegada: horaLlegada
        }),
      });
    }

    setNombre("");
    setOrigen("");
    setDestino("");
    setHoraSalida("");
    setHoraLlegada("");

    loadRutas();
  };

  const deleteRuta = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": localStorage.getItem("token") }
    });
    loadRutas();
  };

  const editRuta = (r) => {
    setNombre(r.nombre);
    setOrigen(r.origen);
    setDestino(r.destino);
    setHoraSalida(r.hora_salida);
    setHoraLlegada(r.hora_llegada);
    setEditingId(r.id);
  };

  const logout = () => {
    localStorage.removeItem("login");
    localStorage.removeItem("token");
    setIsLogged(false);
  };

  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>CRUD Rutas</h2>

      <button onClick={logout}>Cerrar sesión</button>

      <br /><br />

      <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input placeholder="Origen" value={origen} onChange={(e) => setOrigen(e.target.value)} />
      <input placeholder="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} />
      <input type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
      <input type="time" value={horaLlegada} onChange={(e) => setHoraLlegada(e.target.value)} />

      <button onClick={addRuta}>
        {editingId ? "Actualizar" : "Agregar"}
      </button>

      <ul>
        {rutas.map((r) => (
          <li key={r.id}>
            {r.nombre} - {r.origen} → {r.destino} ({r.hora_salida} - {r.hora_llegada})

            <button onClick={() => editRuta(r)}>Editar</button>
            <button onClick={() => deleteRuta(r.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;