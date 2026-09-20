'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { crearEmpleadoAction } from './actions';

interface Perfil {
  id: string;
  user_id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
  activo: boolean;
  created_at: string;
}

export default function GestionEmpleadosPage() {
  const [empleados, setEmpleados] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'admin' | 'empleado'>('empleado');
  
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Cargar lista de empleados
  const cargarEmpleados = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEmpleados(data as Perfil[]);
    } else if (error) {
      console.error("Error al cargar lista:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Manejar el envío del formulario
  const handleCrearEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setMensaje({ tipo: 'error', texto: 'Por favor completá todos los campos.' });
      return;
    }

    if (password.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setGuardando(true);

    const respuesta = await crearEmpleadoAction({
      nombre,
      email,
      password,
      rol,
    });

    setGuardando(false);

    if (!respuesta.success) {
      setMensaje({ tipo: 'error', texto: respuesta.error || 'Ocurrió un error.' });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Empleado creado correctamente.' });
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('empleado');
      setModalAbierto(false);
      cargarEmpleados(); // Recargar la lista
    }
  };

  // Cambiar estado activo/inactivo de un empleado
  const toggleEstadoEmpleado = async (perfilId: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('perfiles')
      .update({ activo: !estadoActual })
      .eq('id', perfilId);

    if (!error) {
      cargarEmpleados();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personal</h1>
          <p className="text-sm text-gray-500">Administrá el equipo y las credenciales de acceso.</p>
        </div>
        <button
          onClick={() => {
            setMensaje(null);
            setModalAbierto(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Agregar Empleado
        </button>
      </div>

      {/* Alertas */}
      {mensaje && (
        <div
          className={`p-4 mb-4 rounded-lg text-sm font-medium ${
            mensaje.tipo === 'exito'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando personal...</div>
        ) : empleados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay ningún usuario o empleado registrado aún.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.nombre}</td>
                  <td className="px-6 py-4">{emp.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.rol === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {emp.rol === 'admin' ? 'Administrador' : 'Empleado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {emp.rol !== 'admin' && (
                      <button
                        onClick={() => toggleEstadoEmpleado(emp.id, emp.activo)}
                        className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                          emp.activo
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {emp.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Formulario */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 relative">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Nuevo Integrante</h2>
            <p className="text-sm text-gray-500 mb-4">
              Crea las credenciales de ingreso para un empleado.
            </p>

            <form onSubmit={handleCrearEmpleado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía Gómez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="sofia@estetica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Contraseña Inicial
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as 'admin' | 'empleado')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="empleado">Empleado (Solo ver su agenda/turnos)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}