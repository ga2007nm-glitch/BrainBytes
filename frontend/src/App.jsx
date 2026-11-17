
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SelectLevel from "./pages/SelectLevel";
import Arena from "./pages/Arena";
import AvatarStudio from "./AvatarStudio";
import Battle from "./Battle";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/select" element={<SelectLevel />} />
      <Route path="/arena" element={<Arena />} />
      <Route path="/avatar" element={<AvatarStudio />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
