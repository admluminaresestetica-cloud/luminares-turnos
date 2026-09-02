// src/lib/admin/api.ts

interface AdminRequestParams {
  tabla: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  datos?: any;
  id?: string | number;
}

export async function ejecutarAccionAdmin({ tabla, accion, datos, id }: AdminRequestParams) {
  try {
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tabla,
        accion,
        datos,
        id,
        authHeader: 'mi_clave_admin_interna', // La clave interna de tu route.ts
      }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.error || 'Error al ejecutar la acción');
    }

    return resultado.data;
  } catch (error: any) {
    console.error(`Error en acción admin (${accion} en ${tabla}):`, error);
    throw error;
  }
}