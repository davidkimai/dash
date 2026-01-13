import html2canvas from 'html2canvas';

/**
 * Capture a DOM element as PNG
 */
export async function captureElementAsPNG(
  elementId: string,
  filename: string = 'dashboard.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Capture with higher quality
    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI for better quality
      backgroundColor: '#f9fafb',
      logging: false,
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Screenshot failed:', error);
    throw new Error('Failed to capture screenshot');
  }
}

/**
 * Capture multiple elements as separate PNGs
 */
export async function captureMultipleElements(
  elementIds: string[],
  baseFilename: string = 'dashboard'
): Promise<void> {
  for (let i = 0; i < elementIds.length; i++) {
    const elementId = elementIds[i];
    const filename = `${baseFilename}-${i + 1}.png`;
    await captureElementAsPNG(elementId, filename);
    
    // Small delay between captures
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
