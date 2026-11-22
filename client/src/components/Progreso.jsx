import { ETAPAS, NOMBRES, SALIDAS, etapaAlcanzada } from "../taller.js";

// Barra con las 7 etapas del camino normal y la posición actual.
// Si la orden salió por rechazada o cancelada, se indica aparte.
export default function Progreso({ estado }) {
  const cerradaSinReparar = SALIDAS.includes(estado);
  // Para una salida, la barra se queda donde estaba la orden antes de salir.
  const actual = ETAPAS.indexOf(etapaAlcanzada(estado));

  return (
    <div className="progreso">
      <ol>
        {ETAPAS.map((etapa, indice) => {
          let clase = "pendiente";
          if (indice < actual) {
            clase = "hecha";
          } else if (indice === actual) {
            clase = cerradaSinReparar ? "detenida" : "actual";
          }
          return (
            <li key={etapa} className={clase}>
              <span>{indice + 1}</span>
              {NOMBRES[etapa]}
            </li>
          );
        })}
      </ol>
      {cerradaSinReparar && (
        <p className="tenue">La orden se cerró sin reparar: {NOMBRES[estado].toLowerCase()}.</p>
      )}
    </div>
  );
}
