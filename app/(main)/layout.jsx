import Navbar from "@/components/layout/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
