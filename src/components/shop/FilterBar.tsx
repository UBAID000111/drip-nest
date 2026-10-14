import React from 'react';
import { Category } from '../../types';
import { SlidersHorizontal, Search } from 'lucide-react';

interface FilterBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  sortBy: 'newest' | 'priceAsc' | 'priceDesc' | 'name';
  onSortChange: (sort: 'newest' | 'priceAsc' | 'priceDesc' | 'name') => void;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSortChange,
  onlyInStock,
  onToggleInStock,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 sm:p-5 mb-8 shadow-xs space-y-4">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search homeware by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] placeholder-[#252A24]/40 focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
          />
        </div>

        {/* Sort and Stock filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#252A24]/70">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#234737]" />
            <span>Sort:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-1.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs font-medium text-[#252A24] focus:outline-none focus:border-[#234737]"
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="name">Name (A–Z)</option>
          </select>

          {/* In-stock toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-[#252A24] cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => onToggleInStock(e.target.checked)}
              className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Category selector row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            selectedCategoryId === 'all'
              ? 'bg-[#234737] text-[#F8F5EF] shadow-xs'
              : 'bg-[#F8F5EF] text-[#252A24]/80 hover:text-[#234737] hover:bg-[#EFE6D7]'
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#234737] text-[#F8F5EF] shadow-xs'
                  : 'bg-[#F8F5EF] text-[#252A24]/80 hover:text-[#234737] hover:bg-[#EFE6D7]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
