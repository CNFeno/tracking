/* import { Search } from 'lucide-react';

export default function SearchBar({ placeholder }) {
  return (
    <div className="relative w-96">
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        className="pl-10 pr-4 py-2 border rounded-md w-full"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
    </div>
  );
} */

import { Search } from 'lucide-react';

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="relative w-96">
      <input
        type="text"
        value={value} // <-- ajoute ceci
        onChange={onChange} // <-- et ceci
        placeholder={placeholder || "Search..."}
        className="pl-10 pr-4 py-2 border rounded-md w-full"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
    </div>
  );
}
