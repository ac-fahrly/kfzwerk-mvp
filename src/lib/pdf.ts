import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function saveAsPdf(el: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    // Render in light mode regardless of the current theme.
    onclone: (doc) => {
      doc.documentElement.classList.remove('dark');
    },
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const imgWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= usableHeight) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight);
  } else {
    const pageCanvasHeight = (canvas.width * usableHeight) / imgWidth;
    const totalPages = Math.ceil(canvas.height / pageCanvasHeight);
    for (let i = 0; i < totalPages; i++) {
      const offset = i * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offset);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      if (!ctx) throw new Error('Canvas 2d context unavailable');
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, sliceImgHeight);
    }
  }

  pdf.save(`${filename}.pdf`);
}
