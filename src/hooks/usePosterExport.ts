import { useState, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';

export function usePosterExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportPoster = useCallback(async (
    node: HTMLElement | null,
    filename: string = 'recd-club-taste-profile.png'
  ): Promise<string | null> => {
    if (!node) {
      setError(new Error('Node to export not found'));
      return null;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Create a data URL from the element
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2, // High DPI
        skipFonts: true, // Speeds up export, assuming fonts are already loaded on the page
      });

      // Download image
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      return dataUrl;
    } catch (err: any) {
      console.error('Error exporting poster', err);
      setError(err);
      setIsExporting(false);
      return null;
    }
  }, []);

  return { exportPoster, isExporting, error };
}
