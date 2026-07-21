import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AdminLayout from "./admin/AdminLayout";
import AdminEvents from "./admin/pages/AdminEvents";
import AdminFAQ from "./admin/pages/AdminFAQ";
import AdminGallery from "./admin/pages/AdminGallery";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminMessages from "./admin/pages/AdminMessages";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminTickets from "./admin/pages/AdminTickets";
import Dashboard from "./admin/pages/Dashboard";

import FloatingChat from "./components/chat/FloatingChat";

import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";

import Contact from "./pages/Contact";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
import Experience from "./pages/Experience";
import Faq from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Tickets from "./pages/Tickets";
import Venue from "./pages/Venue";

function AppContent() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route
            path="/events/:slug"
            element={<EventDetails />}
          />
          <Route path="/tickets" element={<Tickets />} />
          <Route
            path="/experience"
            element={<Experience />}
          />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route index element={<Dashboard />} />

            <Route
              path="events"
              element={<AdminEvents />}
            />

            <Route
              path="tickets"
              element={<AdminTickets />}
            />

            <Route
              path="gallery"
              element={<AdminGallery />}
            />

            <Route
              path="messages"
              element={<AdminMessages />}
            />

            <Route path="faq" element={<AdminFAQ />} />

            <Route
              path="settings"
              element={<AdminSettings />}
            />
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