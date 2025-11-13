import React, { useMemo } from 'react';
import { useSkillStore, getLocationCounts } from '../../stores/useSkillStore';

export const LocationFilter: React.FC = () => {
  const searchFilters = useSkillStore((state) => state.searchFilters);
  const setSearchFilters = useSkillStore((state) => state.setSearchFilters);
  const skills = useSkillStore((state) => state.skills);
  const locationCounts = useMemo(() => getLocationCounts(useSkillStore.getState()), [skills]);

  const handleLocationToggle = (location: 'claude' | 'opencode') => {
    const currentLocations = searchFilters.locations;
    let newLocations: ('claude' | 'opencode')[];

    if (currentLocations.includes(location)) {
      // Remove location if already selected
      newLocations = currentLocations.filter((loc) => loc !== location);
    } else {
      // Add location if not selected
      newLocations = [...currentLocations, location];
    }

    setSearchFilters({ locations: newLocations });
  };

  return (
    <div className="space-y-2" role="group" aria-label="Filter by location">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>

      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
        <input
          type="checkbox"
          checked={searchFilters.locations.includes('claude')}
          onChange={() => handleLocationToggle('claude')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          aria-label={`Filter by Claude skills (${locationCounts.claude} skills)`}
        />
        <span className="flex-1 text-sm text-gray-700">~/.claude/skills</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {locationCounts.claude}
        </span>
      </label>

      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
        <input
          type="checkbox"
          checked={searchFilters.locations.includes('opencode')}
          onChange={() => handleLocationToggle('opencode')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          aria-label={`Filter by OpenCode skills (${locationCounts.opencode} skills)`}
        />
        <span className="flex-1 text-sm text-gray-700">~/.config/opencode/skills</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {locationCounts.opencode}
        </span>
      </label>
    </div>
  );
};
