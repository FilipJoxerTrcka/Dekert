import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";

export function FabricCanvas() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const noteRef = useRef(null);
  const [note, setNote] = useState("");
  const [clientName, setClientName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const historyRef = useRef([]);

  useEffect(() => {
    const savedNote = localStorage.getItem("obhliadka_note");
    if (savedNote) setNote(savedNote);
  }, []);

  const resizeCanvas = (canvas) => {
    const parentWidth = canvasRef.current.parentElement.offsetWidth;
    const width = parentWidth - 10;
    const height = Math.min(window.innerHeight * 0.5, 400);
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();

    if (noteRef.current) {
      noteRef.current.style.width = `${width}px`;
    }
  };

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f5f5f5",
    });

    let line = null;
    let isDrawing = false;

    canvas.on("mouse:down", (opt) => {
      const pointer = canvas.getPointer(opt.e);
      line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: "black",
        strokeWidth: 2,
        originX: "center",
        originY: "center",
      });
      canvas.add(line);
      isDrawing = true;
    });

    canvas.on("mouse:move", (opt) => {
      if (!isDrawing || !line) return;
      const pointer = canvas.getPointer(opt.e);
      line.set({ x2: pointer.x, y2: pointer.y });
      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      if (line) historyRef.current.push(line);
      isDrawing = false;
      line = null;
    });

    resizeCanvas(canvas);
    const handleResize = () => resizeCanvas(canvas);
    window.addEventListener("resize", handleResize);
    fabricRef.current = canvas;

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    localStorage.setItem("obhliadka_note", newNote);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const clearCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      historyRef.current = [];
      fabricRef.current.setBackgroundColor(
        "#f5f5f5",
        fabricRef.current.renderAll.bind(fabricRef.current)
      );
    }
  };

  const undoLast = () => {
    if (fabricRef.current && historyRef.current.length > 0) {
      const last = historyRef.current.pop();
      fabricRef.current.remove(last);
      fabricRef.current.renderAll();
    }
  };

  const saveDrawing = () => {
    if (fabricRef.current) {
      const img = fabricRef.current.toDataURL({ format: "png" });
      setDrawings((prev) => [...prev, img]);
      clearCanvas();
    }
  };

  const deleteDrawing = (index) => {
    setDrawings((prev) => prev.filter((_, i) => i !== index));
  };

  const readFileAsDataURL = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

  const exportPDF = async () => {
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

  return (
    <div>
      <input
        type="text"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Meno / názov zákazníka"
        style={{ width: "100%", padding: "8px", marginBottom: "10px", fontSize: "16px" }}
      />

      <canvas ref={canvasRef} style={{ border: "1px solid black", display: "block" }} />

      <textarea
        ref={noteRef}
        value={note}
        onChange={handleNoteChange}
        placeholder="Napíš poznámky k obhliadke..."
        style={{ width: "100%", minHeight: "80px", marginTop: "10px", padding: "8px" }}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        style={{ marginTop: "10px" }}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={saveDrawing} style={{ marginRight: "10px", padding: "8px" }}>
          Uložiť výkres
        </button>
        <button onClick={undoLast} style={{ marginRight: "10px", padding: "8px", background: "orange", color: "white" }}>
          Undo
        </button>
        <button onClick={clearCanvas} style={{ marginRight: "10px", padding: "8px", background: "red", color: "white" }}>
          Vymazať plochu
        </button>
        <button onClick={exportPDF} style={{ padding: "8px" }}>
          Uložiť do PDF
        </button>
      </div>

      {drawings.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uložené výkresy:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {drawings.map((d, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={d} alt={`drawing-${i}`} style={{ width: "150px", border: "1px solid #ccc" }} />
                <button
                  onClick={() => deleteDrawing(i)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
