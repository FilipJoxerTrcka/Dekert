import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import "./FabricCanvas.css";
import { exportPDF, readFileAsDataURL } from "./fabricHelpers";

export function FabricCanvas() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const noteRef = useRef(null);

  const [note, setNote] = useState("");
  const [clientName, setClientName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const historyRef = useRef([]);

  // Načíta poznámku pri štarte
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
    if (noteRef.current) noteRef.current.style.width = `${width}px`;
  };

  // Inicializácia canvasu a kreslenie čiar
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, { backgroundColor: "#f5f5f5" });

    let isDrawing = false;
    let line = null;

    const startLine = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: 2,
        stroke: "black",
        originX: "center",
        originY: "center",
      });
      canvas.add(line);
      isDrawing = true;
    };

    const drawLine = (opt) => {
      if (!isDrawing || !line) return;
      const pointer = canvas.getPointer(opt.e);
      line.set({ x2: pointer.x, y2: pointer.y });
      canvas.renderAll();
    };

    const endLine = () => {
      if (line) historyRef.current.push(line);
      isDrawing = false;
      line = null;
    };

    canvas.on("mouse:down", startLine);
    canvas.on("mouse:move", drawLine);
    canvas.on("mouse:up", endLine);

    resizeCanvas(canvas);
    const handleResize = () => resizeCanvas(canvas);
    window.addEventListener("resize", handleResize);

    fabricRef.current = canvas;

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // Handlery
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
      fabricRef.current.setBackgroundColor("#f5f5f5", fabricRef.current.renderAll.bind(fabricRef.current));
    }
  };

  const undoLast = () => {
    if (fabricRef.current && historyRef.current.length > 0) {
      const lastObj = historyRef.current.pop();
      fabricRef.current.remove(lastObj);
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

  return (
    <div className="fabric-container">
      <input
        type="text"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Meno / názov zákazníka"
        className="client-input"
      />

      <canvas ref={canvasRef} className="drawing-canvas" />

      <textarea
        ref={noteRef}
        value={note}
        onChange={handleNoteChange}
        placeholder="Napíš poznámky k obhliadke..."
        className="note-textarea"
      />

      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="photo-input" />

      <div className="buttons">
        <button onClick={saveDrawing}>Uložiť výkres</button>
        <button onClick={undoLast}>Undo</button>
        <button onClick={clearCanvas}>Vymazať plochu</button>
        <button onClick={() => exportPDF(clientName, note, drawings, photos)}>Uložiť do PDF</button>
      </div>

      {drawings.length > 0 && (
        <div className="drawings-preview">
          <h3>Uložené výkresy:</h3>
          <div className="drawings-grid">
            {drawings.map((d, i) => (
              <div key={i} className="drawing-wrapper">
                <img src={d} alt={`drawing-${i}`} />
                <button onClick={() => setDrawings((prev) => prev.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
