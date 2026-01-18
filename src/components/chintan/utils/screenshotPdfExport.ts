import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ReactElement } from "react";
import { createRoot } from "react-dom/client";

interface ExportOptions {
  onProgress?: (current: number, total: number) => void;
  filename?: string;
}

/**
 * Captures a single slide as a canvas using html2canvas
 */
const captureSlide = async (container: HTMLElement): Promise<HTMLCanvasElement> => {
  // Prepare glassmorphic elements for capture (html2canvas doesn't support backdrop-filter well)
  const glassElements = container.querySelectorAll('.chintan-glass-card');
  const originalStyles: Map<Element, string> = new Map();
  
  glassElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    originalStyles.set(el, htmlEl.style.background);
    // Add solid fallback background for capture
    htmlEl.style.background = 'rgba(255, 255, 255, 0.9)';
  });

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High quality for print
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 1920,
      height: 1080,
      logging: false,
    });
    return canvas;
  } finally {
    // Restore original styles
    glassElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.background = originalStyles.get(el) || '';
    });
  }
};

/**
 * Renders a React element to a temporary container and captures it
 */
const renderAndCapture = async (
  element: ReactElement,
  offscreenContainer: HTMLDivElement
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const root = createRoot(offscreenContainer);
    
    root.render(element);
    
    // Wait for render, animations to complete, and images to load
    // Using 2500ms to ensure all staggered Framer Motion animations complete
    setTimeout(async () => {
      // Ensure DOM is fully painted using double requestAnimationFrame
      await new Promise<void>(rafResolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => rafResolve());
        });
      });
      
      try {
        const canvas = await captureSlide(offscreenContainer);
        root.unmount();
        resolve(canvas);
      } catch (error) {
        root.unmount();
        reject(error);
      }
    }, 2500); // Increased from 800ms to allow all animations to complete
  });
};

/**
 * Creates an off-screen container for rendering slides
 */
const createOffscreenContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  `;
  container.className = 'chintan-mesh-bg';
  document.body.appendChild(container);
  return container;
};

/**
 * Main export function - captures all slides and generates PDF
 */
export const exportChintanToPDF = async (
  slideElements: ReactElement[],
  options: ExportOptions = {}
): Promise<void> => {
  const { onProgress, filename = 'Chintan-Shivir-2026-Pitch-Deck.pdf' } = options;
  const totalSlides = slideElements.length;
  
  // Create off-screen container
  const offscreenContainer = createOffscreenContainer();
  
  // Create PDF in landscape 16:9 format
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167], // 16:9 ratio in mm (A4-ish landscape)
  });
  
  const canvases: HTMLCanvasElement[] = [];
  
  try {
    // Capture each slide
    for (let i = 0; i < totalSlides; i++) {
      onProgress?.(i + 1, totalSlides);
      
      const canvas = await renderAndCapture(slideElements[i], offscreenContainer);
      canvases.push(canvas);
    }
    
    // Add all captured slides to PDF
    canvases.forEach((canvas, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 167);
    });
    
    // Save the PDF
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(offscreenContainer);
  }
};
