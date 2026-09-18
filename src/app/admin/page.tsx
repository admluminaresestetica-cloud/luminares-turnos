// ... (tus otras importaciones)
import AdminChatWidget from './components/AdminChatWidget'; // <--- Importás el widget

export default function AdminHubPage() {
  // ... (toda tu lógica de sesión y modulos)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between p-6 sm:p-10 select-none transition-colors duration-200 relative">

      {/* ENCABEZADO SUPERIOR */}
      {/* ... (tu header actual) */}

      {/* GRILLA DE MODULOS */}
      {/* ... (tu main actual) */}

      {/* PIE DE PÁGINA */}
      {/* ... (tu footer actual) */}

      {/* WIDGET FLOTANTE DE IA */}
      <AdminChatWidget />

    </div>
  );
}