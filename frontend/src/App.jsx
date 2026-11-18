
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SelectLevel from "./pages/SelectLevel";
import Arena from "./pages/Arena";
import AvatarStudio from "./AvatarStudio";
import Battle from "./Battle";
import TeacherDashboard from "./TeacherDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select" element={<SelectLevel />} />
      <Route path="/arena" element={<Arena />} />
      <Route path="/avatar" element={<AvatarStudio />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
