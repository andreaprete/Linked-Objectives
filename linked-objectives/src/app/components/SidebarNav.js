export function SidebarNav() {
    return (
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold">OKR Tool</h1>
        <nav className="space-y-2">
          {["Home", "Dashboard", "Goals", "Teams", "Users", "Strategy Map"].map((item) => (
            <div key={item} className="hover:bg-gray-700 p-2 rounded cursor-pointer">
              {item}
            </div>
          ))}
        </nav>
      </aside>
    );
  }