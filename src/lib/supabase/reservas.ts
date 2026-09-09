export async function buscarReserva(
  celular: string,
  codigo: string
): Promise<Reserva | null> {
  // 1. Limpiamos el celular dejando únicamente dígitos
  const celularNorm = celular.replace(/\D/g, '');

  // 2. Limpiamos el código: eliminamos espacios y '#' extras
  const soloNumerosCodigo = codigo.replace('#', '').trim();
  
  // Como en la BD se guarda siempre con '#', armamos la clave exacta con el '#'
  const codigoBuscado = `#${soloNumerosCodigo}`;

  // 3. Consultamos en Supabase por la columna 'codigo_unico'
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('codigo_unico', codigoBuscado);

  if (error) {
    console.error('Error al buscar reserva:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // 4. Verificamos coincidencia de celular con los registros devueltos
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
}