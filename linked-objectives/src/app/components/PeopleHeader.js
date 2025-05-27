import { Users } from 'lucide-react';

export default function PeopleHeader({ count, search, setSearch }) {
  return (
    <div className="people-header flex items-center justify-between py-4 mb-2">
      <div className="flex items-center gap-3">
        <Users className="text-blue-600" size={32} />
        <h1 className="people-header-title text-2xl font-bold">People</h1>
        <span className="people-header-count text-gray-500 text-lg">{count} in total</span>
      </div>
      <input
        className="people-header-search"
        type="text"
        placeholder="Search by name, role, team..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  );
}
