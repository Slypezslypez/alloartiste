"use client";

// Redimensionne et compresse une image côté navigateur avant l'upload, pour éviter de
// saturer le stockage (Cloudflare R2) avec des photos de smartphone de plusieurs Mo.
// En cas d'échec ou de gain nul, le fichier d'origine est conservé tel quel.
export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  try {
    if (typeof createImageBitmap === "undefined") return file;
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Les PNG sont conservés en PNG (jamais convertis en JPEG) : le format JPEG n'a pas de canal
    // alpha, donc un logo à fond transparent se retrouverait avec un fond uni (noir ou blanc selon
    // le navigateur) une fois "compressé" — un défaut resté invisible tant qu'aucune image avec
    // transparence n'avait été testée (logos sponsors, notamment).
    const isPng = file.type === "image/png";
    const outputType = isPng ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outputType, isPng ? undefined : quality));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + (isPng ? ".png" : ".jpg");
    return new File([blob], newName, { type: outputType });
  } catch {
    return file;
  }
}
