import React, { useEffect, useRef, useState } from "react";
import { FabricCanvas } from "./FabricCanvas";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { exportPDF } from "./fabricHelpers";

function App() {
  const [clientName, setClientName] = useState(""); 
  const [notes, setNotes] = useState("");          
  const [brands, setBrands] = useState([{ id: uuidv4(), value: "" }]);
  const [maxPrice, setMaxPrice] = useState("");
  const [images, setImages] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fabricRef = useRef(null);

  // --- Fotky ---
  const onDrop = (acceptedFiles) => {
    setImages((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });
  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const toRemove = prev.find((i) => i.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  // --- Značky ---
  const handleAddBrand = () => {
    setBrands((prev) => [...prev, { id: uuidv4(), value: "" }]);
  };
  const handleBrandChange = (id, value) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, value } : b)));
  };

  // --- Pôdorysy ---
  const handleSaveDrawing = (data) => {
    setDrawings((prev) => [...prev, data]);
    setModalOpen(false);
  };
  const handleRemoveDrawing = (index) => {
    setDrawings((prev) => prev.filter((_, i) => i !== index));
  };

  // --- PDF ---
  const handleSavePDF = async () => {
    try {
      await exportPDF(clientName, notes, brands, maxPrice, drawings, images);
    } catch (e) {
      console.error(e);
      alert("Nepodarilo sa vytvoriť PDF. Pozri konzolu pre detaily.");
    }
  };

  // --- Cleanup preview URLs ---
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Obhliadka klímy</h1>

      {/* Meno klienta */}
      <div style={{ marginBottom: 10 }}>
        <label>Meno klienta: </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Zadaj meno klienta"
        />
      </div>

      {/* Poznámky */}
      <div style={{ marginBottom: 10 }}>
        <label>Poznámky: </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Poznámky ku objednávke"
          rows={3}
          style={{ width: "100%" }}
        />
      </div>

      {/* Značky */}
      <h3>Značky klímy:</h3>
      {brands.map((brand) => (
        <div key={brand.id} style={{ marginBottom: 10 }}>
          <select
            value={brand.value}
            onChange={(e) => handleBrandChange(brand.id, e.target.value)}
          >
            <option value="">-- Vyber značku --</option>
            <option value="Aux">Aux</option>
            <option value="Bosh">Bosh</option>
            <option value="Dekert">Dekert</option>
            <option value="Hisense">Hisense</option>
            <option value="MideaGroup">MideaGroup</option>
            <option value="MvPower">MvPower</option>
            <option value="Samsung">Samsung</option>
            <option value="Toshiba">Toshiba</option>
            <option value="Vivax">Vivax</option>
          </select>
        </div>
      ))}
      <button onClick={handleAddBrand}>➕ Pridať ďalšiu značku</button>

      <br /><br />

      <label>Max. cena (€): </label>
      <input
        type="number"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />

      <br /><br />

      {/* Kreslenie pôdorysov */}
      <button onClick={() => setModalOpen(true)}>✏️ Kresli pôdorys</button>

     {modalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 10,
        maxWidth: "95%",
        maxHeight: "90%",
        width: "90%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Canvas zaberie dostupný priestor */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <FabricCanvas ref={fabricRef} onSave={handleSaveDrawing} />
      </div>

      {/* Tlačidlá */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <button onClick={() => fabricRef.current.saveAndClear()}>💾 Uložiť</button>
        <button onClick={() => fabricRef.current.clearCanvas()}>🗑 Vymazať</button>
        <button onClick={() => setModalOpen(false)}>❌ Zavrieť</button>
        <button onClick={() => fabricRef.current.undoLast()}>🔙 Späť</button>
      </div>
    </div>
  </div>
)}

      {/* Náhľad pôdorysov */}
      {drawings.length > 0 && (
        <div>
          <h3>Uložené pôdorysy:</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {drawings.map((d, i) => (
              <div key={i} style={{ position: "relative", display: "inline-block" }}>
                <img src={d} alt={`Pôdorys ${i + 1}`} style={{ width: 100, height: 100, border: "1px solid gray" }} />
                <button
                  onClick={() => handleRemoveDrawing(i)}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fotky */}
      <h3>Fotky:</h3>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed gray",
          padding: 20,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <p>Potiahni alebo klikni na nahratie fotky</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
        {images.map((img) => (
          <div key={img.id} style={{ position: "relative", margin: 5 }}>
            <img src={img.preview} alt="" style={{ width: 100, height: 100, objectFit: "cover" }} />
            <button
              onClick={() => handleRemoveImage(img.id)}
              title="Zmazať fotku"
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: 22,
                height: 22,
                lineHeight: "22px",
                textAlign: "center",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <br /><br />

      <button onClick={handleSavePDF}>Uložiť do PDF</button>
    </div>
  );
}

export default App;
