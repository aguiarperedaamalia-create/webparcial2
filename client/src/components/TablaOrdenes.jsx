import { Link } from "react-router";
import { fecha, nombreCliente, telefonoCliente } from "../taller.js";
import Insignia from "./Insignia.jsx";

// Tabla de órdenes. Recibe la lista ya filtrada: solo sabe pintarla.
export default function TablaOrdenes({ ordenes, vacio }) {
  if (ordenes.length === 0) {
    return <p className="tenue">{vacio}</p>;
  }
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Equipo</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Etapa</th>
          <th>Recibido</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map((orden) => (
          <tr key={orden.id}>
            <td>
              <Link to={"/ordenes/" + orden.id}>{orden.equipo}</Link>
            </td>
            <td>{nombreCliente(orden)}</td>
            <td>{telefonoCliente(orden)}</td>
            <td>
              <Insignia estado={orden.estado} />
            </td>
            <td>{fecha(orden.created)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
