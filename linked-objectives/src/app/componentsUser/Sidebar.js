export default function Sidebar() {
    return (
      <aside className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">OKR Tool</h1>
        <nav className="space-y-4">
          <a href="#" className="block text-gray-300 hover:text-white">Home</a>
          <a href="#" className="block text-white font-semibold">Dashboard</a>
          <a href="#" className="block text-gray-300 hover:text-white">Goals</a>
          <a href="#" className="block text-gray-300 hover:text-white">Teams</a>
          <a href="#" className="block text-gray-300 hover:text-white">Users</a>
          <a href="#" className="block text-white font-semibold mt-4">Strategy Map</a>
        </nav>
      </aside>
    );
  }
  