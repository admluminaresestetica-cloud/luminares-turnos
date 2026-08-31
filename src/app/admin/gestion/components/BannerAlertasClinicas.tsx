'use client';

interface BannerAlertasClinicasProps {
  antecedentes?: Record<string, boolean>;
  observacionesFijas?: string;
}

export default function BannerAlertasClinicas({
  antecedentes = {},
  observacionesFijas,
}: BannerAlertasClinicasProps) {
  // Buscamos dinámicamente TODAS las preguntas de Supabase que se marcaron en TRUE
  const alertas = Object.entries(antecedentes)
    .filter(([_, valor]) => valor === true)
    .map(([pregunta]) => pregunta);

  if (alertas.length === 0 && !observacionesFijas) return null;

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
      <p className="text-xs font-bold text-amber-900 uppercase">
        ⚠️ Alertas Clínicas del Paciente
      </p>

      {alertas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {alertas.map((alerta, idx) => (
            <span
              key={idx}
              className="text-xs bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded"
            >
              {alerta}
            </span>
          ))}
        </div>
      )}

      {observacionesFijas && (
        <p className="text-xs text-amber-950">
          <strong>Obs. Médicas Permanentes:</strong> {observacionesFijas}
        </p>
      )}
    </div>
  );
}