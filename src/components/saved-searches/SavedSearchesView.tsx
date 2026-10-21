import React from 'react';
import { Bookmark, Search, Trash2, ArrowRight, Calendar, Sliders } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { SavedSearch } from '../../types';

interface SavedSearchesViewProps {
  onRunSearch: (search: SavedSearch) => void;
  onNavigateToDiscovery: () => void;
}

export const SavedSearchesView: React.FC<SavedSearchesViewProps> = ({
  onRunSearch,
  onNavigateToDiscovery,
}) => {
  const { savedSearches, deleteSearch } = useLeads();

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
            Saved Search Monitors
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quickly rerun recurring ideal customer queries across target markets and geographies.
          </p>
        </div>

        <button
          onClick={onNavigateToDiscovery}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#284fcd] transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          Create New Search
        </button>
      </div>

      {savedSearches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-[#101828]">No saved searches yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            When configuring filters in the AI Lead Discovery tab, click "Save This Search" to monitor the query here.
          </p>
          <button
            onClick={onNavigateToDiscovery}
            className="mt-4 rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white hover:bg-[#284fcd]"
          >
            Launch Lead Discovery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs hover:border-[#3563E9] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-50 p-1.5 text-[#3563E9]">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-[#101828]">{search.name}</h3>
                  </div>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Saved Search"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Industry:</span>
                    <span className="font-semibold text-gray-800">{search.industry || 'Any'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="font-semibold text-gray-800">{search.location || 'Global'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Company Size:</span>
                    <span className="font-semibold text-gray-800">{search.companySize || 'Any'}</span>
                  </div>
                  {search.keywords && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Keywords:</span>
                      <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                        {search.keywords}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  Saved on {new Date(search.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => onRunSearch(search)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#3563E9] hover:bg-blue-100 transition-colors"
                >
                  Run Query <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
