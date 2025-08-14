import React, { useState } from "react";
import { FabricCanvas } from "./FabricCanvas";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [images, setImages] = useState([]);

  // Nahrávanie fotiek
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

  // Uloženie dát
  const handleSave = () => {
    const data = {
      id: uuidv4(),
      brand,
      maxPrice,
      images,
      // tu neskôr pridáme pôdorys z FabricCanvas
    };
    console.log("Uložené dáta:", data);
    alert("Dáta uložené do konzoly");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Obhliadka klímy</h1>

      <label>Značka klímy:</label>
      <select value={brand} onChange={(e) => setBrand(e.target.value)}>
        <option value="">-- Vyber značku --</option>
        <option value="Daikin">Daikin</option>
        <option value="Mitsubishi">Mitsubishi</option>
        <option value="LG">LG</option>
        <option value="Samsung">Samsung</option>
      </select>

      <br /><br />

      <label>Max. cena (€):</label>
      <input
        type="number"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />

      <br /><br />

      <h3>Pôdorys izieb:</h3>
      <FabricCanvas />

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
          <img
            key={img.id}
            src={img.preview}
            alt=""
            style={{ width: 100, height: 100, objectFit: "cover", margin: 5 }}
          />
        ))}
      </div>

      <br />
      <button onClick={handleSave}>Uložiť</button>
    </div>
  );
}

export default App;
