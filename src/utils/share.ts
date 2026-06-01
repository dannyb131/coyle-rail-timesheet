export async function shareFile(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename)] })) {
    try {
      await navigator.share({
        title,
        text,
        files: [new File([blob], filename)],
      });
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return false;
      throw err;
    }
  }
  return false;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
