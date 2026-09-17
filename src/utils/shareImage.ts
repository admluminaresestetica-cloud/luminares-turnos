export async function compartirOGuardarImagen({
  dataUrl,
  nombreArchivo = "historia-oferta.png",
  titulo = "Oferta",
  texto = "¡Mirá esta oferta!",
}: {
  dataUrl: string;
  nombreArchivo?: string;
  titulo?: string;
  texto?: string;
}) {
  try {
    // 1. Convertir la imagen base64/DataURL a un objeto File real
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], nombreArchivo, { type: "image/png" });

    // 2. Verificar si el navegador del celular permite compartir archivos
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: titulo,
        text: texto,
      });
      return { success: true, action: "shared" };
    } else {
      // 3. Respaldo (PC o navegadores sin soporte): Forzar descarga
      descargarImagenDirecta(dataUrl, nombreArchivo);
      return { success: true, action: "downloaded" };
    }
  } catch (error) {
    // Si el usuario cancela la ventana de compartir, no es un error
    if ((error as Error).name !== "AbortError") {
      console.error("Error al compartir imagen:", error);
      descargarImagenDirecta(dataUrl, nombreArchivo);
    }
    return { success: false, error };
  }
}

export function descargarImagenDirecta(dataUrl: string, nombreArchivo: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
