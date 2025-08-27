import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  className = "",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Buscar..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // For date formats, also search by different patterns
    (searchTerm && (
      // Search by year (e.g., "2025")
      option.label.includes(searchTerm) ||
      // Search by month name (e.g., "janeiro", "jan")
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Search by month number (e.g., "01", "1")
      (searchTerm.match(/^\d{1,2}$/) && option.value.endsWith(`-${searchTerm.padStart(2, '0')}`)) ||
      // Search by year-month (e.g., "2025-01", "2025/01")
      option.value.includes(searchTerm.replace('/', '-'))
    ))
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };


    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current && (options.length > 5 || searchable)) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, options.length]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleToggle();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full px-4 py-2.5 text-left bg-white border rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-azure-500 focus:border-azure-500 hover:border-gray-400 ${
          isOpen ? 'border-azure-500 ring-2 ring-azure-500 ring-opacity-20' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden z-[9999]">
          {/* Search Input - only show if more than 5 options */}
          {(options.length > 5 || searchable) && (
            <div className="p-3 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-azure-500 focus:border-azure-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearchTerm('');
                  }
                }}
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-azure-50 transition-colors duration-150 flex items-center justify-between focus:bg-azure-50 focus:outline-none ${
                    value === option.value ? 'bg-azure-100 text-azure-800 font-medium' : 'text-gray-700'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-azure-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : searchTerm ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma opção disponível
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;