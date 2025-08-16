import jsPDF from "jspdf";

export const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

export const exportPDF = async (clientName, note, drawings, photos) => {
  const pdf = new jsPDF();

  if (clientName.trim()) {
    pdf.setFontSize(16);
    pdf.text(`Klient: ${clientName}`, 10, 20);
  }

  pdf.setFontSize(14);
  pdf.text("Poznámky k obhliadke:", 10, 40);
  pdf.setFontSize(12);
  pdf.text(note || "-", 10, 50);

  let y = 70;
  for (let i = 0; i < drawings.length; i++) {
    pdf.addImage(drawings[i], "PNG", 10, y, 180, 100);
    y += 110;
    if (y > 270 && i < drawings.length - 1) {
      pdf.addPage();
      y = 20;
    }
  }

  for (let i = 0; i < photos.length; i++) {
    const imgData = await readFileAsDataURL(photos[i]);
    pdf.addImage(imgData, "JPEG", 10, y, 180, 100);
    y += 110;
    if (y > 270 && i < photos.length - 1) {
      pdf.addPage();
      y = 20;
    }
  }

  pdf.save(`${clientName || "obhliadka"}.pdf`);
};
