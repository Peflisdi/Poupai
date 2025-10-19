import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-primary">
      <Sidebar />
      <Header />
      <main className="pt-16 lg:ml-64">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
