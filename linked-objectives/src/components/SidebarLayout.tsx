import TopNavbar from './TopNavbar';

type SidebarLayoutProps = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-60 bg-gray-800 text-white p-4">
        <p className="text-xl font-bold mb-4">OKR Tool</p>
        {/* Add nav links here later */}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}