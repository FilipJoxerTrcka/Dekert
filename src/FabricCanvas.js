import React, { useEffect, useRef, useState } from "react";
import { Canvas, PencilBrush } from "fabric";

export function FabricCanvas() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const noteRef = useRef(null);
  const [note, setNote] = useState("");

  // Načíta poznámku pri štarte
  useEffect(() => {
    const savedNote = localStorage.getItem("obhliadka_note");
    if (savedNote) setNote(savedNote);
  }, []);

  const resizeCanvas = (canvas) => {
    const parentWidth = canvasRef.current.parentElement.offsetWidth;
    const width = parentWidth - 10; // rezerva na padding
    const height = Math.min(window.innerHeight * 0.5, 400);

    // Nastaví rozmery canvasu
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();

    // Nastaví rovnakú šírku textarea
    if (noteRef.current) {
      noteRef.current.style.width = `${width}px`;
    }
  };

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#f5f5f5",
    });

    const brush = new PencilBrush(canvas);
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = brush;
    brush.width = 2;
    brush.color = "black";

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

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ border: "1px solid black", display: "block" }} />

      <textarea
        ref={noteRef}
        value={note}
        onChange={handleNoteChange}
        placeholder="Napíš poznámky k obhliadke..."
        style={{
          marginTop: "10px",
          minHeight: "100px",
          padding: "8px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          resize: "vertical",
          display: "block",
        }}
      />
    </div>
  );
}
