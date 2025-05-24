import '@/app/styles/SidebarLayout.css'; // Import the CSS

import TopNavbar from './TopNavbar.js';

export default function SidebarLayout({ children, title, id, blur = false }) {
  return (
    <div className="flex min-h-screen">
      <div className="sidebar">
        <p className="text-xl font-bold mb-4">OKR Tool</p>
      </div>

      <div className="flex-1 bg-gray-100 min-h-screen flex flex-col relative">
        <TopNavbar title={title} id={id} />
        <main className={`main-content ${blur ? 'blur' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
