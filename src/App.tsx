import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Tickets from "./pages/Tickets";
import Contact from "./pages/Contact";
import Venue from "./pages/Venue";
import Gallery from "./pages/Gallery";
import Experience from "./pages/Experience";
import Faq from "./pages/FAQ";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import FloatingChat from "./components/chat/FloatingChat";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Dashboard />} />
</Route>
        </Routes>
      </main>

      <Footer />
      <FloatingChat />
    </BrowserRouter>
  );
}

export default App;