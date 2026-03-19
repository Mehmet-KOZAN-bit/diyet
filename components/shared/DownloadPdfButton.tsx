"use client";

import { Button } from "@/components/ui/button";

export default function DownloadPdfButton({ elementId, clientName }: { elementId: string, clientName: string }) {
  const handleDownload = async () => {
    try {
      const input = document.getElementById(elementId);
      if (!input) return;
      
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: '#ffffff',
        onclone: (_doc: Document, clone: HTMLElement) => {
          // Force every element to black & white
          clone.querySelectorAll('*').forEach((el: any) => {
            el.style.color = '#000000';
            el.style.backgroundColor = 'transparent';
            el.style.borderColor = '#cbd5e1';
            el.style.boxShadow = 'none';
            el.style.textShadow = 'none';
            el.style.backgroundImage = 'none';
          });

          // Give each meal section a subtle box
          clone.querySelectorAll('div').forEach((el: any) => {
            if (el.querySelector('h3, p')) {
              el.style.border = '1px solid #e2e8f0';
              el.style.borderRadius = '8px';
              el.style.padding = '12px 16px';
              el.style.marginBottom = '12px';
              el.style.pageBreakInside = 'avoid';
            }
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`${clientName} - Diyet Plani`, 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`Diyet_Plani_${new Date().toLocaleDateString('tr-TR')}.pdf`);
    } catch (e) {
      console.error("PDF oluşturulamadı", e);
      alert("PDF oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0">
      PDF İndir
    </Button>
  );
}
