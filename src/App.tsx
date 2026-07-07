import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import Footer from "./layout/Footer";
import Contact from "./pages/Contact";
import Venue from "./pages/Venue";
import Gallery from "./pages/Gallery";
import FloatingChat from "./components/chat/FloatingChat";
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
          <Route path="/contact" element={<Contact />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>

      <Footer />
      <FloatingChat />
    </BrowserRouter>
  );
}

export default App;