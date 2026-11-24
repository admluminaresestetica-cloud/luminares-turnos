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
  return compartirMultiplesImagenes({
    dataUrls: [dataUrl],
    nombresArchivo: [nombreArchivo],
    titulo,
    texto,
    copiarTextoAlPortapapeles: false,
  });
}

export async function compartirMultiplesImagenes({
  dataUrls,
  nombresArchivo,
  nombreBase = "historia-oferta",
  titulo = "Oferta",
  texto = "¡Mirá esta oferta!",
  copiarTextoAlPortapapeles = true,
}: {
  dataUrls: string[];
  nombresArchivo?: string[];
  nombreBase?: string;
  titulo?: string;
  texto?: string;
  copiarTextoAlPortapapeles?: boolean;
}) {
  if (!dataUrls || dataUrls.length === 0) {
    return { success: false, error: new Error("No hay imágenes para compartir") };
  }

  const resolverNombre = (index: number, mimeType: string) => {
    if (nombresArchivo && nombresArchivo[index]) {
      return nombresArchivo[index];
    }
    const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
    const sufijo = dataUrls.length > 1 ? `-${index + 1}` : "";
    return `${nombreBase}${sufijo}.${ext}`;
  };

  try {
    // Copiar texto al portapapeles para pegarlo rápido en Estados de WhatsApp
    if (
      copiarTextoAlPortapapeles &&
      texto &&
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(texto);
      } catch {
        // Ignorar si el navegador deniega el portapapeles sin permiso explícito
      }
    }

    const files: File[] = await Promise.all(
      dataUrls.map(async (dataUrl, index) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const mimeType = blob.type || "image/png";
        const nombre = resolverNombre(index, mimeType);
        return new File([blob], nombre, { type: mimeType });
      })
    );

    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        files,
        title: titulo,
        text: texto,
      });
      return { success: true, action: "shared", count: files.length };
    }

    descargarMultiplesImagenes(dataUrls, nombresArchivo, nombreBase);
    return { success: true, action: "downloaded", count: files.length };
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("Error al compartir imágenes:", error);
      descargarMultiplesImagenes(dataUrls, nombresArchivo, nombreBase);
    }
    return { success: false, error };
  }
}

export function descargarMultiplesImagenes(
  dataUrls: string[],
  nombresArchivo?: string[],
  nombreBase = "historia-oferta"
) {
  dataUrls.forEach((dataUrl, index) => {
    const sufijo = dataUrls.length > 1 ? `-${index + 1}` : "";
    const nombre = nombresArchivo?.[index] || `${nombreBase}${sufijo}.png`;
    descargarImagenDirecta(dataUrl, nombre);
  });
}

export function descargarImagenDirecta(dataUrl: string, nombreArchivo: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}