import Navbar from "@/components/layout/Navbar";
export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"16px 20px" }}>
        
        {children}
      </main>
    </>
  );
}
