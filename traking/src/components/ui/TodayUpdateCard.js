import { useState } from 'react';

export default function TodayUpdateCard({ updates }) {
  const [showAll, setShowAll] = useState(false);
  const visibleUpdates = showAll ? updates : updates.slice(0, 6);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Today's Update</h2>
        {updates.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-blue-500 text-sm"
          >
            {showAll ? 'Show less' : 'See all'}
          </button>
        )}
      </div>
      
      <div className={`space-y-4 ${showAll ? 'max-h-72 overflow-y-auto pr-2' : ''}`}>
        {visibleUpdates.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2 text-gray-700">{item.name}</span>
            </div>
            <div className="font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
