'use client';

import { useState, useEffect } from 'react';
import { X, User, Calendar, PackageSearch, Heart, LogOut, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Importamos los widgets modulares y el modal de canje
import PuntosCardWidget from '@/components/puntos/PuntosCardWidget';
import ProximoTurnoWidget from '@/components/puntos/ProximoTurnoWidget';
import ReferidosCardWidget from '@/components/puntos/ReferidosCardWidget';
import HistorialPuntosList from '@/components/puntos/HistorialPuntosList';
import ModalCanjePremios from '@/components/puntos/ModalCanjePremios';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, loginWithGoogle, signOut } = useAuth();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [puntosTotales, setPuntosTotales] = useState<number>(0);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

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
        setCargandoReferido(false);
        return cliente;
      }

      const nombreGoogle = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Cliente';
      const codigoNuevo = generarCodigoReferido(nombreGoogle);

      const { data: nuevoCliente } = await supabase
        .from('clientes')
        .insert([
          {
            user_id: currentUser.id,
            nombre: nombreGoogle,
            celular: '', 
            codigo_referido: codigoNuevo,
            descuentos_disponibles: 0,
            codigo_activo: false,
          }
        ])
        .select()
        .single();

      if (nuevoCliente) {
        setClienteData(nuevoCliente);
      }
    } catch (err) {
      console.error('Error al asegurar perfil de cliente:', err);
    } finally {
      setCargandoReferido(false);
    }
  }

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
      const { data } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', userId)
        .gte('fecha_hora_inicio', ahoraIso)
        .in('estado', ['pendiente', 'confirmada'])
        .order('fecha_hora_inicio', { ascending: true })
        .limit(1)
        .maybeSingle();

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
        cargarProximoTurno(user.id)
      ]);

      setCargandoPuntos(false);
    }

    fetchData();
  }, [user?.id, isOpen]);

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

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center sm:items-start sm:justify-end p-0 sm:p-6 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-background border-0 sm:border border-border sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Modal */}
          <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Foto de perfil" 
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-xs">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-extrabold text-foreground leading-tight">
                  {user ? (user.user_metadata?.full_name || 'Mi Perfil') : '¡Hola! Bienvenid@'}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {user ? user.email : 'Iniciá sesión para ver tu actividad'}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo principal del Modal con scroll fluido */}
          <div className="flex-1 space-y-3.5 overflow-y-auto">
            {/* Si no está logueado */}
            {!user ? (
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3 text-center shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">
                  Iniciá sesión con tu cuenta de Google para acceder a tus turnos, compras y acumular puntos.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={cargandoGoogle}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {cargandoGoogle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Conectando con Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                      </svg>
                      <span>Iniciar sesión con Google</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Si está logueado: Widgets Modulares */
              <div className="space-y-3">
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

                <HistorialPuntosList historial={historial} />
              </div>
            )}

            {/* Accesos Directos Unificados */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Gestión y Actividad
              </span>

              <Link
                href="/mis-turnos"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span>Mis Turnos y Reservas</span>
                </div>
              </Link>

              <Link
                href="/seguimiento"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <PackageSearch className="w-3.5 h-3.5" />
                  </div>
                  <span>Mis Compras y Pedidos</span>
                </div>
              </Link>

              <Link
                href="/favoritos"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span>Mis Productos Favoritos</span>
                </div>
              </Link>

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>Soporte por WhatsApp</span>
                </div>
              </a>
            </div>

            {/* Cerrar sesión */}
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-all active:scale-[0.98] cursor-pointer mt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Secundario de Canje de Premios */}
      {user && (
        <ModalCanjePremios
          isOpen={isModalCanjeOpen}
          onClose={() => setIsModalCanjeOpen(false)}
          userId={user.id}
          puntosActuales={puntosTotales}
          onCanjeExitoso={refetchDatosPuntos}
        />
      )}
    </>
  );
}