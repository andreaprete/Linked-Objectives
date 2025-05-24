// AppLayout.js
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopbar from './UnifiedTopbar';
import "@/app/styles/AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <UnifiedSidebar />
      <div className="main-content">
        <UnifiedTopbar />
        <div className="main-inner">
          {children}
        </div>
      </div>
    </div>
  );
}