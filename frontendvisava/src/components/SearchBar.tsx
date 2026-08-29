import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  return (
    <div className="search-container">
      <div className="search-bar glass-panel">
        <Search className="search-icon" size={20} strokeWidth={2.5} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search camps, medical, water..." 
          aria-label="Search"
        />
        <button className="filter-btn" aria-label="Filters">
          <SlidersHorizontal size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
