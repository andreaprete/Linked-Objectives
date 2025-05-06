import TopNavbar from './TopNavbar.jsx';

export default function SidebarLayout({ children, title, id }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-60 bg-gray-800 text-white p-4">
        <p className="text-xl font-bold mb-4">OKR Tool</p>
      </div>

      <div className="flex-1 bg-gray-100 min-h-screen flex flex-col">
        <TopNavbar title={title} id={id} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}