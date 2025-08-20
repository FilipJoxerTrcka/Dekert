import jsPDF from "jspdf";

// helper – wrap text for pdf
function addWrappedText(pdf, text, x, y, maxWidth, lineHeight) {
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

/**
 * Convert uploaded image file or DataURL to DataURL string (JPEG)
 */
export const readFileAsDataURL = (fileOrDataUrl) => {
  return new Promise((resolve) => {
    // ak je už DataURL
    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      resolve(fileOrDataUrl);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // nakreslíme do canvasu a prekonvertujeme na JPEG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrDataUrl);
  });
};

/**
 * Export data to PDF
 */
export const exportPDF = async (clientName, notes, brands, maxPrice, drawings, photos) => {
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Obhliadka klímy", 10, 20);

  // --- Client name ---
  pdf.setFontSize(14);
  pdf.text("Meno klienta:", 10, 35);
  pdf.setFontSize(12);
  pdf.text(clientName || "-", 50, 35);

  // --- Notes ---
  pdf.setFontSize(14);
  pdf.text("Poznámky:", 10, 45);
  pdf.setFontSize(12);
  let y = addWrappedText(pdf, notes || "-", 10, 55, 180, 7);

  // --- Brands ---
  y += 10;
  pdf.setFontSize(14);
  pdf.text("Vybrané značky:", 10, y);
  pdf.setFontSize(12);
  if (brands.length > 0) {
    brands.forEach((b, i) => {
      pdf.text(`${i + 1}. ${b.value || "-"}`, 15, y + 10 + i * 7);
    });
    y += 10 + brands.length * 7;
  } else {
    pdf.text("-", 15, y + 10);
    y += 20;
  }

  // --- Max price ---
  y += 5;
  pdf.setFontSize(14);
  pdf.text("Maximálna cena:", 10, y);
  pdf.setFontSize(12);
  pdf.text(maxPrice ? `${maxPrice} €` : "-", 60, y);
  y += 20;

  // --- Drawings ---
  if (drawings && drawings.length > 0) {
    pdf.setFontSize(14);
    pdf.text("Pôdorys:", 10, y);
    y += 10;

    for (let i = 0; i < drawings.length; i++) {
      const imgData = await readFileAsDataURL(drawings[i]);
      pdf.addImage(imgData, "JPEG", 10, y, 120, 80);
      y += 90;
      if (y > 270 && i < drawings.length - 1) {
        pdf.addPage();
        y = 20;
      }
    }
  }

  // --- Photos ---
  if (photos && photos.length > 0) {
    if (y > 200) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFontSize(14);
    pdf.text("Fotky:", 10, y);
    y += 10;

    for (let i = 0; i < photos.length; i++) {
      const imgData = await readFileAsDataURL(photos[i].file);
      pdf.addImage(imgData, "JPEG", 10, y, 100, 70);
      y += 80;
      if (y > 270 && i < photos.length - 1) {
        pdf.addPage();
        y = 20;
      }
    }
  }

  pdf.save("obhliadka.pdf");
};
