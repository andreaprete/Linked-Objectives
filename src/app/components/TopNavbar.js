export function TopNavbar() {
    return (
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <input type="text" placeholder="Search..." className="border rounded p-2 w-1/3" />
        <div className="flex items-center space-x-4">
          <button>🔔</button>
          <img src="/avatar.png" className="w-8 h-8 rounded-full" />
        </div>
      </header>
    );
  }