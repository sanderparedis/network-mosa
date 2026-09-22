import React, { useState, useMemo } from 'react';
import {
  Search,
  Server,
  Layers,
  Network,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Building2,
  Tag,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { InfrastructureDatabase, SearchResultItem } from '../types';
import { searchInfrastructure } from '../utils/searchHelper';

interface GlobalSearchViewProps {
  query: string;
  onQueryChange: (q: string) => void;
  db: InfrastructureDatabase;
  onNavigateToItem: (vestigingId: string, category: 'server' | 'vm' | 'apparaat', itemId: string) => void;
}

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  query,
  onQueryChange,
  db,
  onNavigateToItem
}) => {
  const [filterType, setFilterType] = useState<'all' | 'server' | 'vm' | 'apparaat'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Perform search across the database
  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchInfrastructure(query, db);
  }, [query, db]);

  const filteredResults = useMemo(() => {
    if (filterType === 'all') return allResults;
    return allResults.filter(item => item.category === filterType);
  }, [allResults, filterType]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const sampleSearches = [
    '10.10.1.11',
    '00:15:5D',
    'Domeincontroller',
    'PowerEdge',
    'Aruba',
    'Veeam',
    'PaperCut'
  ];

  return (
    <div className="space-y-6">
      {/* Search Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="max-w-3xl">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Centrale Zoekfunctie
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Doorzoek alle 4 schoolvestigingen tegelijk op IP-adres, MAC-adres, hostnaam, hardware of rol.
          </p>

          <div className="relative mt-4">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="global-search-page-input"
              type="text"
              autoFocus
              placeholder="Typ een IP-adres (bv. 10.10.1.12), MAC-adres of naam..."
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-base border-2 border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none transition-colors text-slate-900 placeholder-slate-400 font-medium"
            />
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="absolute right-3.5 top-3.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md"
              >
                Wissen
              </button>
            )}
          </div>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Snel zoeken:</span>
            {sampleSearches.map(sample => (
              <button
                key={sample}
                onClick={() => onQueryChange(sample)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono text-[11px] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Filter categories */}
        {query.trim().length > 0 && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Filter op:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alles ({allResults.length})
            </button>
            <button
              onClick={() => setFilterType('server')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'server'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Servers ({allResults.filter(r => r.category === 'server').length})
            </button>
            <button
              onClick={() => setFilterType('vm')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'vm'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              VM&apos;s ({allResults.filter(r => r.category === 'vm').length})
            </button>
            <button
              onClick={() => setFilterType('apparaat')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'apparaat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Netwerk ({allResults.filter(r => r.category === 'apparaat').length})
            </button>
          </div>
        )}
      </div>

      {/* Search Results Display */}
      {query.trim().length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Waarmee kunnen we u helpen zoeken?
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Voer hierboven een IP-adres in om direct te ontdekken van welke server of virtuele machine het adres is, of zoek op hardware serienummer of functietitel.
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-600 text-sm">
            Geen resultaten gevonden voor <strong className="text-slate-900">&quot;{query}&quot;</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Controleer de spelling of zoek op een gedeelte van het IP- of MAC-adres.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            {filteredResults.length} {filteredResults.length === 1 ? 'resultaat' : 'resultaten'} gevonden
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredResults.map(item => (
              <div
                key={item.category + '-' + item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === 'server'
                        ? 'bg-blue-50 text-blue-700'
                        : item.category === 'vm'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {item.category === 'server' && <Server className="w-5 h-5" />}
                    {item.category === 'vm' && <Layers className="w-5 h-5" />}
                    {item.category === 'apparaat' && <Network className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {item.naam}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          item.category === 'server'
                            ? 'bg-blue-100 text-blue-800'
                            : item.category === 'vm'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {item.vestigingNaam}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 font-medium">
                      {item.details}
                    </div>

                    {item.locatie && (
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.locatie}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: IP / MAC and Jump Button */}
                <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  {item.ipAdres && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-slate-400 font-medium">IP:</span>
                      <span className="font-mono font-bold text-slate-900">{item.ipAdres}</span>
                      <button
                        onClick={() => copyToClipboard(item.ipAdres, `search-ip-${item.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                        title="Kopieer IP-adres"
                      >
                        {copiedId === `search-ip-${item.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {item.macAdres && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-slate-400 font-medium">MAC:</span>
                      <span className="font-mono text-slate-700">{item.macAdres}</span>
                      <button
                        onClick={() => copyToClipboard(item.macAdres!, `search-mac-${item.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                        title="Kopieer MAC-adres"
                      >
                        {copiedId === `search-mac-${item.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigateToItem(item.vestigingId, item.category, item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mt-1"
                  >
                    Bekijk op Vestiging
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
