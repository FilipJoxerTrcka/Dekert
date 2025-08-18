import jsPDF from "jspdf";

// Pomocná funkcia na načítanie súboru ako dataURL
export const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

/**
 * Export dát do PDF
 * @param {string} clientName - meno klienta
 * @param {string} notes - poznámky
 * @param {Array} brands - pole značiek (objekty {id, value})
 * @param {string} maxPrice - maximálna cena
 * @param {Array} drawings - obrázky pôdorysov (array dataURL stringov)
 * @param {Array} photos - fotky (array objektov {id, file, preview})
 */
export const exportPDF = async (clientName, notes, brands, maxPrice, drawings, photos) => {
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Obhliadka klímy", 10, 20);

  // --- Meno klienta ---
  pdf.setFontSize(14);
  pdf.text("Meno klienta:", 10, 35);
  pdf.setFontSize(12);
  pdf.text(clientName || "-", 50, 35);

  // --- Poznámky ---
  pdf.setFontSize(14);
  pdf.text("Poznámky:", 10, 45);
  pdf.setFontSize(12);
  pdf.text(notes || "-", 10, 55);

  // --- Značky ---
  let y = 70;
  pdf.setFontSize(14);
  pdf.text("Vybrané značky:", 10, y);
  pdf.setFontSize(12);
  if (brands.length > 0) {
    brands.forEach((b, i) => {
      pdf.text(`${i + 1}. ${b.value || "-"}`, 15, y + 10 + i * 10);
    });
  } else {
    pdf.text("-", 15, y + 10);
  }

  // --- Max cena ---
  const yPrice = y + 10 + brands.length * 10 + 10;
  pdf.setFontSize(14);
  pdf.text("Maximálna cena:", 10, yPrice);
  pdf.setFontSize(12);
  pdf.text(maxPrice ? `${maxPrice} €` : "-", 60, yPrice);

  y = yPrice + 20;

  // --- Pôdorysy ---
  if (drawings && drawings.length > 0) {
    pdf.setFontSize(14);
    pdf.text("Pôdorys:", 10, y);
    y += 10;

    for (let i = 0; i < drawings.length; i++) {
      pdf.addImage(drawings[i], "PNG", 10, y, 180, 100);
      y += 110;
      if (y > 270 && i < drawings.length - 1) {
        pdf.addPage();
        y = 20;
      }
    }
  }

  // --- Fotky ---
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
      pdf.addImage(imgData, "JPEG", 10, y, 180, 100);
      y += 110;
      if (y > 270 && i < photos.length - 1) {
        pdf.addPage();
        y = 20;
      }
    }
  }

  pdf.save("obhliadka.pdf");
};
