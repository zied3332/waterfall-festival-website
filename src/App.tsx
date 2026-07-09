import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import EventDetails from "./pages/EventDetails";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminEvents from "./admin/pages/AdminEvents";
import FloatingChat from "./components/chat/FloatingChat";
import AdminTickets from "./admin/pages/AdminTickets";
import AdminGallery from "./admin/pages/AdminGallery";
import AdminMessages from "./admin/pages/AdminMessages";
import AdminFAQ from "./admin/pages/AdminFAQ";
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
              <Route path="events" element={<AdminEvents />} />
                <Route path="tickets" element={<AdminTickets />} />
<Route path="gallery" element={<AdminGallery />} />
<Route path="messages" element={<AdminMessages />} />
<Route path="faq" element={<AdminFAQ />} />
          </Route>
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
      {!isAdminPage && <FloatingChat />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;