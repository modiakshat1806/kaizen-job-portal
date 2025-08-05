import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import collegeService from '../services/collegeService';

const InstitutionAutocomplete = ({
  value = '',
  onChange,
  onBlur,
  placeholder = "Enter your institution name (e.g., BITS Hyderabad)",
  error = null,
  required = false,
  className = "",
  disabled = false,
  studentPhone = null // For tracking who added new colleges
}) => {
  // DEBUG: Force component refresh - no "Add new" option should appear
  console.log('🔄 InstitutionAutocomplete loaded - automatic learning enabled');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCollege, setIsSavingCollege] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Debounced search function with API integration
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setIsLoading(true);
      try {
        const results = await collegeService.searchColleges(query, 8);
        setSuggestions(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      }
      setIsLoading(false);
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(newValue);
    }

    if (newValue.length >= 2) {
      setIsOpen(true);
      debouncedSearch(newValue);
    } else if (newValue.length === 0) {
      // Show popular colleges when input is empty and focused
      loadPopularColleges();
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // Load popular colleges
  const loadPopularColleges = useCallback(async () => {
    try {
      const popular = await collegeService.getPopularColleges();
      setSuggestions(popular);
    } catch (error) {
      console.error('Failed to load popular colleges:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle suggestion selection with automatic college addition
  const handleSuggestionSelect = async (suggestion) => {
    setInputValue(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);

    // Automatically add college to database if it doesn't exist
    setIsSavingCollege(true);
    try {
      const result = await collegeService.addCollege(suggestion, studentPhone);
      if (result.isNew) {
        console.log(`✅ New college "${suggestion}" added to database!`);
      }
    } catch (error) {
      // Silently handle errors - the college might already exist
      console.log('College already exists or failed to add:', error.message);
    } finally {
      setIsSavingCollege(false);
    }

    if (onChange) {
      onChange(suggestion);
    }

    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        if (inputValue.length === 0) {
          setSuggestions(getPopularColleges());
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSuggestionSelect(suggestions[0]);
        } else if (inputValue.trim().length >= 3) {
          // If no suggestions but user has typed something, use their input
          handleSuggestionSelect(inputValue.trim());
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      
      case 'Tab':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (inputValue.length === 0) {
      loadPopularColleges();
    } else if (inputValue.length >= 2) {
      debouncedSearch(inputValue);
    }
    setIsOpen(true);
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
      if (onBlur) {
        onBlur(e);
      }
    }, 150);
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onChange) {
      onChange('');
    }

    inputRef.current?.focus();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-field pr-20
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="text-gray-400">
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              ref={el => suggestionRefs.current[index] = el}
              className={`
                px-4 py-3 cursor-pointer transition-colors duration-150
                ${index === selectedIndex
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
              `}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {highlightMatch(suggestion, inputValue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && inputValue.length >= 2 && suggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        >
          <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
            No colleges found. Just type your institution name and press Enter.
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="form-error mt-1">{error}</p>
      )}
    </div>
  );
};

// Utility function to highlight matching text
const highlightMatch = (text, query) => {
  if (!query || query.length < 2) return text;
  
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  
  return (
    <>
      {text.substring(0, index)}
      <span className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default InstitutionAutocomplete;
