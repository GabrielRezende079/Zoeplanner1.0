import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
  onCustomCategory?: () => void;
  showCustomOption?: boolean;
  className?: string;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  categories,
  placeholder = "Selecione uma categoria",
  onCustomCategory,
  showCustomOption = true,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleScroll = (event: Event) => {
      // Só fecha se o scroll não for dentro do dropdown
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
      window.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomCategory = () => {
    if (onCustomCategory) {
      onCustomCategory();
    }
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
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-azure-500 focus:border-azure-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearchTerm('');
                }
              }}
            />
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelect(category)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-azure-50 transition-colors duration-150 focus:bg-azure-50 focus:outline-none ${
                    value === category ? 'bg-azure-100 text-azure-800 font-medium' : 'text-gray-700'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(category);
                    }
                  }}
                >
                  {category}
                </button>
              ))
            ) : searchTerm ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma categoria encontrada
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma categoria disponível
              </div>
            )}

            {/* Custom Category Option */}
            {showCustomOption && onCustomCategory && (
              <button
                type="button"
                onClick={handleCustomCategory}
                className="w-full px-4 py-3 text-left text-sm text-olive-600 hover:bg-olive-50 transition-colors duration-150 border-t border-gray-100 font-medium focus:bg-olive-50 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCustomCategory();
                  }
                }}
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                  Criar nova categoria
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;