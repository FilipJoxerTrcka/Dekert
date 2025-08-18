import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import "./FabricCanvas.css";

export const FabricCanvas = React.forwardRef(({ onSave }, ref) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const historyRef = useRef([]);

  const resizeCanvas = (canvas) => {
    const width = window.innerWidth * 0.9;
    const height = Math.min(window.innerHeight * 0.8, 500);
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
  };

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f5f5f5",
      selection: false, // zakáže výber objektov
    });

    let isDrawing = false;
    let line = null;

    const startLine = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: 2,
        stroke: "black",
        selectable: false,
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

  React.useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      if (fabricRef.current) {
        fabricRef.current.clear();
        historyRef.current = [];
        fabricRef.current.setBackgroundColor(
          "#f5f5f5",
          fabricRef.current.renderAll.bind(fabricRef.current)
        );
      }
    },
    undoLast: () => {
      if (fabricRef.current && historyRef.current.length > 0) {
        const lastObj = historyRef.current.pop();
        fabricRef.current.remove(lastObj);
        fabricRef.current.renderAll();
      }
    },
    getDrawing: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toDataURL({ format: "png" });
    },
    saveAndClear: () => {
      const data = fabricRef.current.toDataURL({ format: "png" });
      onSave(data);
      fabricRef.current.clear();
      historyRef.current = [];
      fabricRef.current.setBackgroundColor(
        "#f5f5f5",
        fabricRef.current.renderAll.bind(fabricRef.current)
      );
    },
  }));

  return <canvas ref={canvasRef} className="drawing-canvas" />;
});
