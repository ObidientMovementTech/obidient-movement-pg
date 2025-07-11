// src/utils/exportAsImage.ts

import html2canvas from "html2canvas";

export default async function exportAsImage(element: HTMLElement, fileName: string) {
  if (!element) return;

  // Detect device pixel ratio (retina = 2, normal = 1)
  const scale = window.devicePixelRatio || 1;

  const canvas = await html2canvas(element, {
    scale: scale * 2, 
    useCORS: true,    
    logging: false,   
    backgroundColor: null,
  });

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
