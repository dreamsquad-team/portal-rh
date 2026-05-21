import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { VacationRequestPage } from "./pages/VacationRequestPage";
import { AdminPage } from "./pages/AdminPage";
import { MyVacationsPage } from "./pages/MyVacationsPage";
import type { AuthUser } from "./api/types";
import { getStoredUser, storeUser, clearUser } from "./auth";

type Page = "home" | "vacations" | "request" | "my" | "admin";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [page, setPage] = useState<Page>(() => {
    const u = getStoredUser();
    return u?.role === "admin" ? "home" : "request";
  });
  const [dashboardFilter, setDashboardFilter] = useState("all");

  function handleLogin(user: AuthUser) {
    storeUser(user);
    setCurrentUser(user);
    setPage(user.role === "admin" ? "home" : "request");
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        active={page}
        onNavigate={(id) => navigate(id)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentUser.role === "admin" && page === "home" && (
          <Home onNavigate={navigate} />
        )}
        {currentUser.role === "admin" && page === "vacations" && (
          <Dashboard initialFilter={dashboardFilter} />
        )}
        {currentUser.role === "admin" && page === "admin" && (
          <AdminPage currentUser={currentUser} />
        )}
        {page === "request" && (
          <VacationRequestPage currentUser={currentUser} />
        )}
        {page === "my" && (
          <MyVacationsPage currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}
