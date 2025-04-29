export default function TopNavbar() {
    return (
      <div className="w-full bg-white shadow px-6 py-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-gray-800">Objectives - 1</h2>
        
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 border rounded text-sm focus:outline-none"
          />
          <button className="rounded-full w-8 h-8 bg-gray-800 text-white flex items-center justify-center font-bold">
            N
          </button>
        </div>
      </div>
    );
  }
  