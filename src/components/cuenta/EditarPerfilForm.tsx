'use client';

interface EditarPerfilFormProps {
  esIncompleto: boolean;
  nombreInput: string;
  setNombreInput: (val: string) => void;
  celularInput: string;
  setCelularInput: (val: string) => void;
  avatarInput: string;
  setAvatarInput: (val: string) => void;
  onGuardar: () => void;
  onCancelar?: () => void;
}

// 🎨 Galería de avatares predefinidos de DiceBear
const AVATARES_DISPONIBLES = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Mia",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Lucas",
  "https://api.dicebear.com/7.x/micah/svg?seed=Sam",
  "https://api.dicebear.com/7.x/micah/svg?seed=Alex",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=dog",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=panda",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fox",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=tiger",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=rabbit",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=koala",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=lion",
];

export default function EditarPerfilForm({
  esIncompleto,
  nombreInput,
  setNombreInput,
  celularInput,
  setCelularInput,
  avatarInput,
  setAvatarInput,
  onGuardar,
  onCancelar,
}: EditarPerfilFormProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 space-y-4 shadow-lg my-auto relative">
      {!esIncompleto && onCancelar && (
        <button
          type="button"
          onClick={onCancelar}
          className="absolute top-4 right-4 text-xs font-bold text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          ✕
        </button>
      )}

      <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
        {esIncompleto ? '👋' : '✏️'}
      </div>

      <div className="space-y-1.5 text-center">
        <h4 className="text-base font-bold text-stone-900 dark:text-zinc-50">
          {esIncompleto ? '¡Completá tu perfil!' : 'Tus datos personales'}
        </h4>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-400 font-medium">
          {esIncompleto 
            ? 'Para sumar puntos, retirar premios y gestionar tus turnos sin errores, por favor ingresá tus datos:' 
            : 'Actualizá tu información para que figure correctamente en tus reservas y cupones:'}
        </p>
      </div>

      <div className="space-y-3 text-left">
        {/* 🎨 Selector de Avatar */}
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1.5">Elegí tu Avatar</label>
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            {AVATARES_DISPONIBLES.map((urlAvatar, index) => (
              <img
                key={index}
                src={urlAvatar}
                alt={`Avatar ${index + 1}`}
                onClick={() => setAvatarInput(urlAvatar)}
                className={`w-12 h-12 rounded-2xl cursor-pointer p-1 ring-2 transition-all hover:scale-105 shrink-0 bg-stone-100 dark:bg-zinc-800 ${
                  avatarInput === urlAvatar ? "ring-primary scale-105 shadow-md" : "ring-transparent opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1">Nombre y Apellido</label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={nombreInput}
            onChange={(e) => setNombreInput(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-sm font-medium text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1">Celular / WhatsApp</label>
          <input
            type="tel"
            placeholder="Ej: 3415123456"
            value={celularInput}
            onChange={(e) => setCelularInput(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-sm font-medium text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onGuardar}
        disabled={!nombreInput.trim()}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
      >
        {esIncompleto ? 'Guardar y continuar' : 'Guardar cambios'}
      </button>
    </div>
  );
}