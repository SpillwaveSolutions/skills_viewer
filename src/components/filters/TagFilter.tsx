import React, { useState, useMemo } from 'react';
import { useSkillStore, getAvailableTags } from '../../stores/useSkillStore';
import { X } from 'lucide-react';

export const TagFilter: React.FC = () => {
  const searchFilters = useSkillStore((state) => state.searchFilters);
  const setSearchFilters = useSkillStore((state) => state.setSearchFilters);
  const skills = useSkillStore((state) => state.skills);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableTags = useMemo(() => getAvailableTags(useSkillStore.getState()), [skills]);

  const [tagSearch, setTagSearch] = useState('');

  // Calculate tag counts
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach((skill) => {
      const tags = skill.metadata?.tags as string[] | undefined;
      if (tags && Array.isArray(tags)) {
        tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return counts;
  }, [skills]);

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const handleTagToggle = (tag: string) => {
    const currentTags = searchFilters.tags;
    let newTags: string[];

    if (currentTags.includes(tag)) {
      newTags = currentTags.filter((t) => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }

    setSearchFilters({ tags: newTags });
  };

  const handleClearAll = () => {
    setSearchFilters({ tags: [] });
  };

  if (availableTags.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
        <p className="text-xs text-gray-500 italic">No tags found in skill metadata</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-label="Filter by tags">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
        {searchFilters.tags.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            aria-label={`Clear all selected tags (${searchFilters.tags.length} selected)`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tag search input */}
      <input
        type="text"
        value={tagSearch}
        onChange={(e) => setTagSearch(e.target.value)}
        placeholder="Search tags..."
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search tags"
      />

      {/* Selected tags */}
      {searchFilters.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pb-2 border-b border-gray-200">
          {searchFilters.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="hover:bg-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag list */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredTags.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No tags match "{tagSearch}"</p>
        ) : (
          filteredTags.map((tag) => (
            <label
              key={tag}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={searchFilters.tags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Filter by ${tag} tag (${tagCounts[tag] || 0} skills)`}
              />
              <span className="flex-1 text-sm text-gray-700 truncate" title={tag}>
                {tag}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {tagCounts[tag] || 0}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};
