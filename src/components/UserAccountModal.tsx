'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  LogOut,
  SquareCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Subcomponentes modulares
import AuthSection from '@/components/cuenta/AuthSection';
import AtajosSection from '@/components/cuenta/AtajosSection';
import CanjesPendientesList from '@/components/cuenta/CanjesPendientesList';

// Widgets existentes
import PuntosCardWidget from '@/components/puntos/PuntosCardWidget';
import ProximoTurnoWidget from '@/components/puntos/ProximoTurnoWidget';
import ReferidosCardWidget from '@/components/puntos/ReferidosCardWidget';
import HistorialPuntosList from '@/components/puntos/HistorialPuntosList';
import ModalCanjePremios from '@/components/puntos/ModalCanjePremios';
import EditarPerfilForm from '@/components/cuenta/EditarPerfilForm';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, loginWithGoogle, signOut } = useAuth();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [cargandoFacebook, setCargandoFacebook] = useState(false);
  
  const [puntosTotales, setPuntosTotales] = useState<number>(0);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  
  // Estados para Perfil / Nombre / Celular
  const [nombreIncompleto, setNombreIncompleto] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nombreInput, setNombreInput] = useState('');
  const [celularInput, setCelularInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

  const [canjesPendientes, setCanjesPendientes] = useState<any[]>([]);
  const [cargandoCanjes, setCargandoCanjes] = useState(false);

  // Estado para el próximo turno
  const [proximoTurno, setProximoTurno] = useState<any>(null);
  const [cargandoTurno, setCargandoTurno] = useState(false);

  // Estados para Referidos
  const [clienteData, setClienteData] = useState<any>(null);
  const [cargandoReferido, setCargandoReferido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Estado para abrir/cerrar el modal de canje de premios
  const [isModalCanjeOpen, setIsModalCanjeOpen] = useState(false);

  function generarCodigoReferido(nombre: string): string {
    const limpio = (nombre || 'CLIENTE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 4);

    const aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${limpio || 'USER'}-${aleatorio}`;
  }

  async function asegurarPerfilCliente(currentUser: any) {
    if (!currentUser?.id) return null;
    setCargandoReferido(true);

    try {
      let { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (cliente) {
        setClienteData(cliente);
        setNombreInput(cliente.nombre || '');
        setCelularInput(cliente.celular || '');
        
        if (!cliente.nombre || cliente.nombre.trim() === '') {
          setNombreIncompleto(true);
        }
        setCargandoReferido(false);
        return cliente;
      }

      const codigoNuevo = generarCodigoReferido('CLIENTE');

      const { data: nuevoCliente } = await supabase
        .from('clientes')
        .insert([
          {
            user_id: currentUser.id,
            nombre: '',
            celular: '',
            codigo_referido: codigoNuevo,
            descuentos_disponibles: 0,
            codigo_activo: false,
          },
        ])
        .select()
        .single();

      if (nuevoCliente) {
        setClienteData(nuevoCliente);
        setNombreIncompleto(true);
      }
    } catch (err) {
      console.error('Error al asegurar perfil de cliente:', err);
    } finally {
      setCargandoReferido(false);
    }
  }

  // Función para actualizar o guardar el perfil real de forma segura
  const guardarPerfilReal = async () => {
    if (!user?.id || !nombreInput.trim()) return;
    try {
      // Usamos .update() porque el cliente ya fue creado al iniciar sesión
      const { error } = await supabase
        .from('clientes')
        .update({ 
          nombre: nombreInput.trim(),
          celular: celularInput.trim(),
          avatar_url: avatarInput, // 👈 1. Agregamos el avatar a Supabase
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Actualizamos el estado local de forma limpia
      setClienteData((prev: any) => ({ 
        ...prev, 
        nombre: nombreInput.trim(), 
        celular: celularInput.trim(),
        avatar_url: avatarInput // 👈 2. Actualizamos también el estado local
      }));
      setNombreIncompleto(false);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error al actualizar perfil en Supabase:', err);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  async function cargarHistorial(userId: string) {
    const { data } = await supabase
      .from('puntos_historial')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setHistorial(data);
    }
  }

  async function cargarProximoTurno(userId: string) {
    setCargandoTurno(true);
    try {
      const ahoraIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', userId)
        .gte('fecha_hora_inicio', ahoraIso)
        .in('estado', ['pendiente', 'confirmada', 'pendiente_sena'])
        .order('fecha_hora_inicio', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error al cargar próximo turno:', error);
      }

      setProximoTurno(data || null);
    } catch (err) {
      console.error('Error al cargar próximo turno:', err);
    } finally {
      setCargandoTurno(false);
    }
  }

  async function refetchDatosPuntos() {
    if (!user?.id) return;
    const { data } = await supabase
      .from('puntos_usuarios')
      .select('puntos_totales')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPuntosTotales(data.puntos_totales || 0);
    }
    await cargarHistorial(user.id);
  }

  async function cargarCanjesPendientes(userId: string) {
    setCargandoCanjes(true);
    try {
      const { data, error } = await supabase
        .from('canjes_usuarios')
        .select('id, codigo_canje, created_at, estado, fecha_expiracion, premios_catalogo(titulo, descripcion)')
        .eq('user_id', userId)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCanjesPendientes(data);
      }
    } catch (err) {
      console.error('Error al cargar canjes pendientes:', err);
    } finally {
      setCargandoCanjes(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !isOpen) return;

      setCargandoPuntos(true);

      const { data } = await supabase
        .from('puntos_usuarios')
        .select('puntos_totales')
        .eq('user_id', user.id)
        .maybeSingle();

      setPuntosTotales(data?.puntos_totales || 0);

      await Promise.all([
        cargarHistorial(user.id),
        asegurarPerfilCliente(user),
        cargarProximoTurno(user.id),
        cargarCanjesPendientes(user.id)
      ]);

      setCargandoPuntos(false);
    }

    fetchData();
  }, [user?.id, isOpen]);

  // Cerrar con Escape y bloquear scroll
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isModalCanjeOpen) onClose();
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isModalCanjeOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setCargandoGoogle(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setCargandoGoogle(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setCargandoFacebook(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error al iniciar sesión con Facebook:', error);
      setCargandoFacebook(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const copiarCodigo = () => {
    if (!clienteData?.codigo_referido) return;
    navigator.clipboard.writeText(clienteData.codigo_referido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-950/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mi cuenta"
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-md max-h-[85vh] overflow-y-auto
                   rounded-[32px]
                   bg-stone-50 dark:bg-zinc-950
                   border border-stone-200/60 dark:border-zinc-800
                   shadow-2xl shadow-stone-900/30 dark:shadow-black/70
                   animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Resplandor superior sutil */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent" />

        {/* Handle bar (solo móvil) */}
        <div className="relative flex justify-center pt-3 pb-1 sm:hidden shrink-0" aria-hidden>
          <span className="h-1.5 w-11 rounded-full bg-stone-300/80 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 px-6 pt-5 pb-4 shrink-0 border-b border-stone-200/40 dark:border-zinc-800/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Foto de perfil"
                  className="w-14 h-14 rounded-[20px] object-cover ring-2 ring-white dark:ring-zinc-900 shadow-lg shadow-primary/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-lg shadow-primary/10">
                  <User className="w-6 h-6" />
                </div>
              )}
              {user && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-50 dark:border-zinc-950"
                  aria-label="Sesión activa"
                />
              )}
            </div>

              <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-zinc-50 leading-tight truncate">
                  {user ? clienteData?.nombre || user.user_metadata?.full_name || 'Mi perfil' : '¡Hola! Bienvenida/o'}
                </h3>
                {user && !nombreIncompleto && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-[11px] font-bold text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    {isEditingProfile ? 'Cancelar' : '✏️ Editar'}
                  </button>
                )}
              </div>
              <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                {user ? user.email : 'Iniciá sesión para ver tu actividad'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 p-2.5 rounded-full bg-stone-200/50 dark:bg-zinc-800/70 text-stone-500 dark:text-zinc-400
                       hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100
                       active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="relative flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!user ? (
            <AuthSection
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              cargandoGoogle={cargandoGoogle}
              cargandoFacebook={cargandoFacebook}
            />
          ) : nombreIncompleto || isEditingProfile ? (
            <EditarPerfilForm
              esIncompleto={nombreIncompleto}
              nombreInput={nombreInput}
              setNombreInput={setNombreInput}
              celularInput={celularInput}
              setCelularInput={setCelularInput}
              avatarInput={avatarInput}  
              setAvatarInput={setAvatarInput}  
              onGuardar={async () => {
                await guardarPerfilReal();
                setIsEditingProfile(false);
              }}
              onCancelar={() => setIsEditingProfile(false)}
            />
          ) : (
            <div className="space-y-3.5">
              <PuntosCardWidget
                puntosTotales={puntosTotales}
                cargandoPuntos={cargandoPuntos}
                onAbrirCanje={() => setIsModalCanjeOpen(true)}
              />

              <ProximoTurnoWidget
                proximoTurno={proximoTurno}
                cargandoTurno={cargandoTurno}
                onCloseModal={onClose}
              />

              <ReferidosCardWidget
                clienteData={clienteData}
                cargandoReferido={cargandoReferido}
                copiado={copiado}
                onCopiarCodigo={copiarCodigo}
              />

              <CanjesPendientesList canjesPendientes={canjesPendientes} />

              <HistorialPuntosList historial={historial} />
            </div>
          )}

          {/* Accesos directos */}
          <AtajosSection onClose={onClose} />

          {/* Cerrar sesión */}
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold
                         text-destructive bg-destructive/[0.06] hover:bg-destructive/10
                         border border-destructive/15 hover:border-destructive/25
                         active:scale-[0.98] transition-all cursor-pointer
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>

        {/* Modal secundario de canje de premios */}
        {user && (
          <ModalCanjePremios
            isOpen={isModalCanjeOpen}
            onClose={() => setIsModalCanjeOpen(false)}
            userId={user.id}
            puntosActuales={puntosTotales}
            onCanjeExitoso={refetchDatosPuntos}
          />
        )}
      </div>
    </div>,
    document.body
  );
}