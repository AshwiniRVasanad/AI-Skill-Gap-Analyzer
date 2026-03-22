import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import HistoryPage from "@/pages/HistoryPage";
import HomePage from "@/pages/HomePage";
import InterviewPage from "@/pages/InterviewPage";
import LoginPage from "@/pages/LoginPage";
import ResumePage from "@/pages/ResumePage";
import { useState } from "react";

export type Page =
  | "login"
  | "home"
  | "resume"
  | "interview"
  | "history"
  | "admin";

export default function App() {
  const stored = localStorage.getItem("vexora_user");
  const [page, setPage] = useState<Page>(stored ? "home" : "login");

  const navigate = (p: Page) => setPage(p);

  return (
    <>
      {page === "login" && <LoginPage navigate={navigate} />}
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "resume" && <ResumePage navigate={navigate} />}
      {page === "interview" && <InterviewPage navigate={navigate} />}
      {page === "history" && <HistoryPage navigate={navigate} />}
      {page === "admin" && <AdminPage navigate={navigate} />}
      <Toaster />
    </>
  );
}
