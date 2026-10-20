import React, { useState } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DropdownSettings } from '../types';

interface DropdownSelectProps {
  label?: string;
  category: keyof DropdownSettings;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  allowDelete?: boolean;
  showInlineButtons?: boolean;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  category,
  value,
  onChange,
  placeholder = '-- Select --',
  className = '',
  selectClassName = '',
  allowDelete = true,
  showInlineButtons = false,
}) => {
  const { dropdowns, addDropdownOption, deleteDropdownOption } = useApp();
  const options = (dropdowns[category] as string[]) || [];

  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [isManaging, setIsManaging] = useState(false);

  const handleAdd = () => {
    if (newValue.trim()) {
      addDropdownOption(category, newValue.trim());
      onChange(newValue.trim());
      setNewValue('');
      setIsAdding(false);
    }
  };

  const handleDelete = (opt: string) => {
    if (window.confirm(`Delete option "${opt}" from ${String(category)}?`)) {
      deleteDropdownOption(category, opt);
      if (value === opt) {
        onChange('');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>}

      <div className="flex items-center space-x-1">
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === '__ADD_NEW__') {
              setIsAdding(true);
            } else if (e.target.value === '__MANAGE__') {
              setIsManaging(true);
            } else {
              onChange(e.target.value);
            }
          }}
          className={`w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-xs ${selectClassName}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option disabled>──────────</option>
          <option value="__ADD_NEW__" className="text-blue-600 font-bold">
            ➕ Add New Option...
          </option>
          {allowDelete && (
            <option value="__MANAGE__" className="text-red-600 font-bold">
              🗑️ Delete / Manage Options...
            </option>
          )}
        </select>

        {showInlineButtons && (
          <>
            {/* Quick inline + button */}
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              title={`Add new ${String(category)}`}
              className="p-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Quick inline delete current selected */}
            {allowDelete && value && (
              <button
                type="button"
                onClick={() => handleDelete(value)}
                title={`Delete "${value}"`}
                className="p-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Inline Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-gray-800">
                Add New to {String(category).replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              placeholder="Enter new value..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Option</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Manage / Delete Modal */}
      {isManaging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="text-sm font-bold text-gray-800">
                Manage {String(category).replace(/([A-Z])/g, ' $1').trim()} ({options.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsManaging(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 my-2">
              Click the trash icon to permanently remove an option from this dropdown list.
            </p>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-64 divide-y divide-gray-100">
              {options.map((opt) => (
                <div key={opt} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded">
                  <span className="text-xs font-medium text-gray-800">{opt}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(opt)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title={`Delete ${opt}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsManaging(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
