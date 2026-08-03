import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import { initNativeShell } from "./utils/native";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import GuestOnly from "./routes/GuestOnly";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequiresAssistedUser from "./routes/RequiresAssistedUser";
import Signin from "./components/Signin/Signin";
import Signup from "./components/Signup/Signup";
import Onboarding from "./pages/Onboarding";
import HomeSection from "./components/Home/HomeSection";
import AlertSection from "./components/Alert/AlertSection";
import LocationSection from "./components/Location/LocationSection";
import ContactSection from "./components/Contacts/ContactSection";

initNativeShell();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <NotificationsProvider>
      <AuthProvider>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route element={<AuthLayout />}>
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<RequiresAssistedUser />}>
                <Route path="/home" element={<HomeSection />} />
                <Route path="/alerts" element={<AlertSection />} />
                <Route path="/location" element={<LocationSection />} />
                <Route path="/contacts" element={<ContactSection />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
      </NotificationsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
