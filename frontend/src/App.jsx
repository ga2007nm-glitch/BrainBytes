
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SelectLevel from "./pages/SelectLevel";
import Arena from "./pages/Arena";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/select" element={<SelectLevel />} />
        <Route path="/arena" element={<Arena />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
