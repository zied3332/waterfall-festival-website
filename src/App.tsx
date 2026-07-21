import {
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";

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

import {
  clearAuthSession,
  getAccessToken,
  getCurrentUser,
  saveAuthenticatedUser,
} from "./services/auth.service";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSessionChecking, setIsSessionChecking] =
    useState(Boolean(getAccessToken()));

  const isAdminPage =
    location.pathname.startsWith("/admin");

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setIsSessionChecking(false);
      return;
    }

    let isCancelled = false;

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();

        if (isCancelled) {
          return;
        }

        saveAuthenticatedUser(currentUser);
      } catch {
        if (isCancelled) {
          return;
        }

        clearAuthSession();

        if (
          location.pathname.startsWith("/admin") &&
          location.pathname !== "/admin/login"
        ) {
          navigate("/admin/login", {
            replace: true,
            state: {
              from: location.pathname,
            },
          });
        }
      } finally {
        if (!isCancelled) {
          setIsSessionChecking(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isCancelled = true;
    };
  }, [location.pathname, navigate]);

  if (isSessionChecking && isAdminPage) {
    return (
      <div className="admin-session-loading">
        Verifying your session...
      </div>
    );
  }

  return (
    <>
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:slug"
            element={<EventDetails />}
          />

          <Route
            path="/tickets"
            element={<Tickets />}
          />

          <Route
            path="/experience"
            element={<Experience />}
          />

          <Route
            path="/gallery"
            element={<Gallery />}
          />

          <Route
            path="/venue"
            element={<Venue />}
          />

          <Route
            path="/faq"
            element={<Faq />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Dashboard />}
            />

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

            <Route
              path="faq"
              element={<AdminFAQ />}
            />

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