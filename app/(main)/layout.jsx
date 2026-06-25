import Navbar from "@/components/layout/Navbar";

export default function MainLayout({ children }) {
  return (
    <div style={{ background:"#0a081e", minHeight:"100vh" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
