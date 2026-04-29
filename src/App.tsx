import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Invitation from "./pages/Invitation";
import GuestManager from "./pages/GuestManager";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/invite" element={<Invitation />} />
        <Route path="/guests" element={<GuestManager />} />
      </Routes>
    </BrowserRouter>
  );
}
