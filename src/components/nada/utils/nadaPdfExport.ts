import { ReactElement } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";

interface ExportOptions {
  filename?: string;
  onProgress?: (current: number, total: number) => void;
}

const captureSlide = async (container: HTMLElement): Promise<HTMLCanvasElement> => {
  // Ensure glassmorphic effects are captured properly
  const glassCards = container.querySelectorAll('.nada-glass-card, .nada-stat-card');
  glassCards.forEach((card) => {
    const el = card as HTMLElement;
    el.style.backdropFilter = 'none';
    (el.style as any).webkitBackdropFilter = 'none';
    // Use solid background for PDF
    if (el.classList.contains('nada-glass-card')) {
      el.style.background = 'rgba(255, 255, 255, 0.95)';
    }
  });

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#f8fafc',
    logging: false,
    width: 1920,
    height: 1080,
    windowWidth: 1920,
    windowHeight: 1080,
  });

  return canvas;
};

const renderAndCapture = async (
  element: ReactElement,
  offscreenContainer: HTMLDivElement
): Promise<HTMLCanvasElement> => {
  // Clear previous content
  offscreenContainer.innerHTML = '';
  
  const slideWrapper = document.createElement('div');
  slideWrapper.style.cssText = `
    width: 1920px;
    height: 1080px;
    position: relative;
    background: 
      radial-gradient(ellipse at 0% 0%, hsla(210, 100%, 40%, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, hsla(185, 80%, 45%, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 30%, hsla(170, 70%, 35%, 0.08) 0%, transparent 40%),
      linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  offscreenContainer.appendChild(slideWrapper);

  // Create React root and render
  const root = createRoot(slideWrapper);
  root.render(element);

  // Wait for rendering and animations to complete
  await new Promise((resolve) => setTimeout(resolve, 2500));
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const canvas = await captureSlide(slideWrapper);
  
  root.unmount();
  
  return canvas;
};

const createOffscreenContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -99999px;
    top: 0;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    z-index: -9999;
    pointer-events: none;
  `;
  document.body.appendChild(container);
  return container;
};

export const exportNadaToPDF = async (
  slideElements: ReactElement[],
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = 'NADA-Anti-Doping-Action-Plan-2026.pdf',
    onProgress,
  } = options;

  const offscreenContainer = createOffscreenContainer();
  
  try {
    // A4 landscape in mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [297, 167], // 16:9 aspect ratio
    });

    const totalSlides = slideElements.length;

    for (let i = 0; i < totalSlides; i++) {
      onProgress?.(i + 1, totalSlides);

      const canvas = await renderAndCapture(slideElements[i], offscreenContainer);
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (i > 0) {
        pdf.addPage([297, 167], 'landscape');
      }

      // Add image to fill the page
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 167);
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(offscreenContainer);
  }
};
