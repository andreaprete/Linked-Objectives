import TopNavbar from './TopNavbar.jsx';

export default function SidebarLayout({ children, title, id, blur = false }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (should never be blurred) */}
      <div className="w-60 bg-gray-800 text-white p-4 z-10">
        <p className="text-xl font-bold mb-4">OKR Tool</p>
      </div>

      {/* Right side content area */}
      <div className="flex-1 bg-gray-100 min-h-screen flex flex-col relative">
        {/* Top navbar (should never be blurred) */}
        <TopNavbar title={title} id={id} />

        {/* Main content area */}
        <main className="flex-1 p-8 transition duration-200 ease-in-out relative layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
