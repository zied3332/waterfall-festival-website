import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";

function Events() {
  return <h1>Events</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

<main>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events" element={<Events />} />
  </Routes>
</main>
    </BrowserRouter>
  );
}

export default App;