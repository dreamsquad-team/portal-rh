import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { VacationRequestPage } from "./pages/VacationRequestPage";
import { AdminPage } from "./pages/AdminPage";
import { MyVacationsPage } from "./pages/MyVacationsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { LandingPage } from "./pages/LandingPage";
import { ColaboradoresPage } from "./pages/ColaboradoresPage";
import { ComunicadosPage } from "./pages/ComunicadosPage";
import { IncentivosPage } from "./pages/IncentivosPage";
import type { AuthUser } from "./api/types";
import { getStoredUser, storeUser, clearUser } from "./auth";

type Page = "landing" | "home" | "vacations" | "request" | "my" | "admin" | "onboarding" | "colaboradores" | "comunicados" | "incentivos";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [page, setPage] = useState<Page>(() => {
    getStoredUser();
    return "landing";
  });
  const [dashboardFilter, setDashboardFilter] = useState("all");

  function handleLogin(user: AuthUser) {
    storeUser(user);
    setCurrentUser(user);
    setPage("landing");
  }

  function handleLogout() {
    clearUser();
    setCurrentUser(null);
  }

  function navigate(id: string, filter?: string) {
    if (filter) setDashboardFilter(filter);
    setPage(id as Page);
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        active={page}
        onNavigate={(id) => navigate(id)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {page === "landing" && (
          <LandingPage currentUser={currentUser} onNavigate={navigate} />
        )}
        {currentUser.role === "admin" && page === "home" && (
          <Home onNavigate={navigate} />
        )}
        {currentUser.role === "admin" && page === "vacations" && (
          <Dashboard initialFilter={dashboardFilter} />
        )}
        {currentUser.role === "admin" && page === "admin" && (
          <AdminPage currentUser={currentUser} />
        )}
        {currentUser.role === "admin" && page === "colaboradores" && (
          <ColaboradoresPage />
        )}
        {page === "request" && (
          <VacationRequestPage currentUser={currentUser} />
        )}
        {page === "my" && (
          <MyVacationsPage currentUser={currentUser} />
        )}
        {page === "onboarding" && (
          <OnboardingPage />
        )}
        {page === "comunicados" && (
          <ComunicadosPage currentUser={currentUser} />
        )}
        {page === "incentivos" && (
          <IncentivosPage currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}
