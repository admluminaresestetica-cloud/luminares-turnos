'use client';

interface Antecedentes {
  embarazo: boolean;
  solReciente: boolean;
  medicacion: boolean;
  pielSensible: boolean;
}

interface ChecklistProps {
  fototipo: string;
  setFototipo: (f: string) => void;
  antecedentes: Antecedentes;
  setAntecedentes: (a: Antecedentes) => void;
  observacionesFijas: string;
  setObservacionesFijas: (obs: string) => void;
}

export default function ChecklistAnamnesis({
  fototipo,
  setFototipo,
  antecedentes,
  setAntecedentes,
  observacionesFijas,
  setObservacionesFijas,
}: ChecklistProps) {
  const toggleAntecedente = (campo: keyof Antecedentes) => {
    setAntecedentes({
      ...antecedentes,
      [campo]: !antecedentes[campo],
    });
  };

  return (
    <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Fototipo de Piel (Fitzpatrick)
        </label>
        <select
          value={fototipo}
          onChange={(e) => setFototipo(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="Fototipo I">Fototipo I (Muy Clara / Pelirroja)</option>
          <option value="Fototipo II">Fototipo II (Clara / Sensible)</option>
          <option value="Fototipo III">Fototipo III (Intermedia)</option>
          <option value="Fototipo IV">Fototipo IV (Oscura / Bronceado fácil)</option>
          <option value="Fototipo V">Fototipo V (Muy Oscura)</option>
        </select>
      </div>

      <div>
        <span className="block text-xs font-bold uppercase text-slate-700 mb-2">
          📋 Check Clínico / Anamnesis
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { key: 'embarazo', label: 'Embarazo / Lactancia' },
            { key: 'solReciente', label: 'Sol / Bronceado < 15 días' },
            { key: 'medicacion', label: 'Medicación Fotosensible' },
            { key: 'pielSensible', label: 'Piel Sensible / Lesiones' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 bg-white p-2 border rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={antecedentes[item.key as keyof Antecedentes]}
                onChange={() => toggleAntecedente(item.key as keyof Antecedentes)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Observaciones Médicas Fijas / Permanentes:
        </label>
        <input
          type="text"
          value={observacionesFijas}
          onChange={(e) => setObservacionesFijas(e.target.value)}
          placeholder="Ej: Alergia a gel conductor, lunares en espalda..."
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />
      </div>
    </div>
  );
}