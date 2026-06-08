export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f2744 100%)" }}>
      {children}
    </div>
  );
}
