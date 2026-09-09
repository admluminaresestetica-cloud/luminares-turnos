import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useReferidos(
  codigoReferidoUsado: string,
  configSistema: any,
  precioTotal: number
) {
  const [validando, setValidando] = useState(false);
  const [descuentoMonto, setDescuentoMonto] = useState<number>(0);
  const [referidoValido, setReferidoValido] = useState<boolean | null>(null);
  const [mensajeReferido, setMensajeReferido] = useState<string>('');

  useEffect(() => {
    let cancelado = false;

    async function validar() {
      const codigoClean = (codigoReferidoUsado || '').trim().toUpperCase();

      if (!codigoClean) {
        setDescuentoMonto(0);
        setReferidoValido(null);
        setMensajeReferido('');
        return;
      }

      setValidando(true);

      try {
        // 1. Verificar si el sistema tiene activos los referidos
        if (!configSistema || !configSistema.referidos_activo) {
          if (!cancelado) {
            setValidando(false);
            setDescuentoMonto(0);
            setReferidoValido(false);
            setMensajeReferido('El programa de referidos no está activo.');
          }
          return;
        }

        // 2. Buscar si el código existe en la tabla de clientes
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('nombre, codigo_referido')
          .ilike('codigo_referido', codigoClean)
          .maybeSingle();

        if (cancelado) return;

        if (error || !cliente) {
          setValidando(false);
          setDescuentoMonto(0);
          setReferidoValido(false);
          setMensajeReferido('Código de referido no válido o inexistente.');
          return;
        }

        // 3. Calcular el monto de descuento según la configuración
        const tipo = configSistema.referidos_tipo_descuento ?? 'monto_fijo';
        const valor = Number(configSistema.referidos_valor_descuento ?? 0);

        let descuentoCalculado = 0;

        if (tipo === 'porcentaje') {
          descuentoCalculado = Math.round((precioTotal * valor) / 100);
        } else if (tipo === 'monto_fijo') {
          descuentoCalculado = Math.min(valor, precioTotal);
        }

        setValidando(false);
        setDescuentoMonto(descuentoCalculado);
        setReferidoValido(true);
        setMensajeReferido(
          `¡Código válido de ${cliente.nombre}! Descuento de $${descuentoCalculado.toLocaleString('es-AR')}.`
        );
      } catch (err) {
        console.error('Error al validar referido:', err);
        if (!cancelado) {
          setValidando(false);
          setDescuentoMonto(0);
          setReferidoValido(false);
          setMensajeReferido('Error al verificar el código.');
        }
      }
    }

    validar();

    return () => {
      cancelado = true;
    };
  }, [codigoReferidoUsado, configSistema, precioTotal]);

  return {
    validando,
    descuentoMonto,
    referidoValido,
    mensajeReferido,
  };
}