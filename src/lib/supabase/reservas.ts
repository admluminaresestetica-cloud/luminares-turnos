export async function buscarReserva(
  celular: string,
  codigo: string
): Promise<Reserva | null> {
  try {
    // 1. Limpiamos celular dejando solo números
    const celularNorm = celular.replace(/\D/g, '');

    // 2. Extraemos el número del código quitando '#' y espacios
    const numeroCodigo = codigo.replace('#', '').trim();
    if (!numeroCodigo) return null;

    // 3. Consultamos en Supabase buscando directamente los códigos que terminen o coincidan con el número
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .ilike('codigo_unico', `%${numeroCodigo}%`);

    if (error) {
      console.error('Error al buscar reserva:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // 4. Verificamos coincidencia de celular
    const reserva = data.find((r) => {
      if (!r.cliente_celular) return false;
      const celReserva = r.cliente_celular.replace(/\D/g, '');
      return (
        celReserva === celularNorm ||
        celReserva.endsWith(celularNorm) ||
        celularNorm.endsWith(celReserva)
      );
    });

    return reserva ?? null;
  } catch (err) {
    console.error('Error inesperado en buscarReserva:', err);
    return null;
  }
}
