import React from 'react';
import { Network, Plus, Hash } from 'lucide-react';
import { Vlan } from '../types';

interface VlanSelectorProps {
  value: string;
  onChange: (value: string) => void;
  vlans?: Vlan[];
  vestigingId?: string;
  onOpenAddVlan?: () => void;
  idPrefix?: string;
  placeholder?: string;
  className?: string;
}

export const VlanSelector: React.FC<VlanSelectorProps> = ({
  value,
  onChange,
  vlans = [],
  vestigingId,
  onOpenAddVlan,
  idPrefix = 'vlan-select',
  placeholder = 'bv. 10 (Beheer) of Trunk',
  className = ''
}) => {
  // Sort and filter VLANs: global or specific to this vestiging
  const applicableVlans = React.useMemo(() => {
    return [...vlans].sort((a, b) => a.vlanId - b.vlanId);
  }, [vlans]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal === '__CUSTOM__') {
      // Keep existing or empty for custom
      return;
    }
    if (selectedVal === '__NEW__') {
      if (onOpenAddVlan) onOpenAddVlan();
      return;
    }
    onChange(selectedVal);
  };

  // Find if current value matches one of the known VLANs
  const matchedVlan = applicableVlans.find(v => {
    const tag = String(v.vlanId);
    return value === tag ||
      value === `${tag} (${v.naam})` ||
      value === `VLAN ${tag} (${v.naam})` ||
      value === `VLAN ${tag}`;
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id={`${idPrefix}-input`}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
          />
        </div>

        {/* Quick Dropdown Picker from created VLANs */}
        {applicableVlans.length > 0 && (
          <div className="w-36 shrink-0">
            <select
              id={`${idPrefix}-dropdown`}
              value={matchedVlan ? `VLAN ${matchedVlan.vlanId} (${matchedVlan.naam})` : ''}
              onChange={handleSelectChange}
              title="Kies uit aangemaakte VLAN's"
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">Kies VLAN...</option>
              {applicableVlans.map(v => {
                const label = `VLAN ${v.vlanId} (${v.naam})`;
                return (
                  <option key={v.id} value={label}>
                    {v.vlanId} - {v.naam}
                  </option>
                );
              })}
              <option value="Trunk (Alle VLAN's)">Trunk (Alle VLAN&apos;s)</option>
              {onOpenAddVlan && (
                <option value="__NEW__">➕ Nieuw VLAN aanmaken...</option>
              )}
            </select>
          </div>
        )}

        {/* Shortcut to create new VLAN if none or handy */}
        {onOpenAddVlan && (
          <button
            type="button"
            onClick={onOpenAddVlan}
            title="Nieuw VLAN toevoegen aan database"
            className="px-2 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md shrink-0 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">VLAN</span>
          </button>
        )}
      </div>

      {/* Quick Suggestion Chips from created VLANs (max 5) */}
      {applicableVlans.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-slate-400">VLAN&apos;s:</span>
          {applicableVlans.slice(0, 5).map(v => {
            const vlanString = `VLAN ${v.vlanId} (${v.naam})`;
            const isSelected = value.includes(String(v.vlanId));
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onChange(vlanString)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  isSelected
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-semibold'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600'
                }`}
                title={`VLAN ${v.vlanId}: ${v.naam}${v.subnet ? ` (${v.subnet})` : ''}`}
              >
                VLAN {v.vlanId}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onChange('Trunk')}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              value.toLowerCase().includes('trunk')
                ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-semibold'
                : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'
            }`}
          >
            Trunk
          </button>
        </div>
      )}
    </div>
  );
};
