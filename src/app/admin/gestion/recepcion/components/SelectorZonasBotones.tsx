'use client';

const LISTA_ZONAS = [
  'Axilas',
  'Bozo / Rostro',
  'Cavado Simple',
  'Cavado Profundo / Tira',
  'Piernas Completas',
  'Media Pierna',
  'Brazos',
  'Espalda',
  'Pecho / Abdomen',
  'Glúteos',
  'Nalgas / Tira',
];

interface SelectorProps {
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
}

export default function SelectorZonasBotones({
  zonasSeleccionadas,
  setZonasSeleccionadas,
}: SelectorProps) {
  const toggleZona = (zona: string) => {
    if (zonasSeleccionadas.includes(zona)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter((z) => z !== zona));
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, zona]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-slate-700">
        ✂️ Zonas a Realizar Hoy (Clic para seleccionar)
      </label>
      <div className="flex flex-wrap gap-2">
        {LISTA_ZONAS.map((zona) => {
          const seleccionada = zonasSeleccionadas.includes(zona);
          return (
            <button
              key={zona}
              type="button"
              onClick={() => toggleZona(zona)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                seleccionada
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {seleccionada ? '✓ ' : '+ '}
              {zona}
            </button>
          );
        })}
      </div>
    </div>
  );
}