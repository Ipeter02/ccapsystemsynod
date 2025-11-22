
import React, { useState } from 'react';
import { MapPin, Locate, Search } from 'lucide-react';
import { ChurchLocation } from '../types';

interface LocationsProps {
  locations: ChurchLocation[];
}

const Locations: React.FC<LocationsProps> = ({ locations }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChurchLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindLocation = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Local DB Search
    const internalMatches = locations.filter(
      l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(internalMatches);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Find a Church / Location</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
             <input
              type="text"
              className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter district, church name, or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFindLocation()}
            />
          </div>
          <button
            onClick={handleFindLocation}
            disabled={isSearching}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            <Locate className="w-4 h-4 mr-2" />
            Find
          </button>
        </div>

        {hasSearched && (
          <div className="mt-6 space-y-6">
            {/* Internal Matches */}
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Results:</h3>
                {searchResults.map(loc => (
                  <div key={loc.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center">
                    <div>
                       <h4 className="font-bold text-indigo-900">{loc.name}</h4>
                       <p className="text-sm text-slate-600">{loc.address} ({loc.district})</p>
                    </div>
                    <MapPin className="text-indigo-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 p-3 rounded-lg bg-slate-50">No exact internal matches found for "{searchQuery}".</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
         <h3 className="font-bold text-lg mb-4 text-slate-800">Administrative Hierarchy</h3>
         <ul className="space-y-4 text-slate-600">
           <li className="flex items-center p-2 bg-slate-50 rounded-lg">
              <MapPin className="text-red-500 mr-3" />
              <div>
                <span className="font-semibold block text-slate-900">Headquarters: Mzuzu</span>
                <span className="text-xs text-slate-500">Mzuzu City, P.O. Box 112</span>
              </div>
           </li>
           <li className="ml-6 pl-6 border-l-2 border-slate-200 space-y-4 pt-2">
              <div>
                <div className="font-medium text-indigo-700 mb-2">Northern Region (Presbytery)</div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                   <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>Mzimba District</li>
                   <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>Rumphi District</li>
                   <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>Nkhata Bay District</li>
                   <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>Karonga District</li>
                </ul>
              </div>
           </li>
         </ul>
      </div>
    </div>
  );
};

export default Locations;
