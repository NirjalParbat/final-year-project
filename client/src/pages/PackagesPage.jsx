import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { packageAPI } from '../api/index.js';
import PackageCard from '../components/common/PackageCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const CATEGORIES = ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Wildlife', 'Heritage', 'Pilgrimage'];

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    minRating: '',
    sort: '-createdAt',
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await packageAPI.getAll(params);
      setPackages(data.packages);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', minDuration: '', maxDuration: '', minRating: '', sort: '-createdAt' });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-text mb-1">Explore Tour Packages</h1>
          <p className="text-brand-muted text-sm mb-6">{total > 0 ? `${total} packages available` : 'Discover your next adventure'}</p>
          
          {/* Search + Filter row */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search destinations or packages..."
                className="input pl-9"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                showFilters
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-brand-border bg-white text-brand-muted hover:border-primary-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="input w-full sm:w-auto"
            >
              <option value="-createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
              <option value="duration">Shortest First</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-brand-bg rounded-2xl border border-brand-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="input-label text-xs">Category</label>
                  <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input text-sm py-2">
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label text-xs">Min Price (NPR)</label>
                  <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} placeholder="0" className="input text-sm py-2" />
                </div>
                <div>
                  <label className="input-label text-xs">Max Price (NPR)</label>
                  <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} placeholder="No limit" className="input text-sm py-2" />
                </div>
                <div>
                  <label className="input-label text-xs">Min Rating</label>
                  <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="input text-sm py-2">
                    <option value="">Any Rating</option>
                    {[4, 3, 2, 1].map((r) => <option key={r} value={r}>{r}★ & above</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label text-xs">Min Duration (days)</label>
                  <input type="number" value={filters.minDuration} onChange={(e) => handleFilterChange('minDuration', e.target.value)} placeholder="1" className="input text-sm py-2" />
                </div>
                <div>
                  <label className="input-label text-xs">Max Duration (days)</label>
                  <input type="number" value={filters.maxDuration} onChange={(e) => handleFilterChange('maxDuration', e.target.value)} placeholder="No limit" className="input text-sm py-2" />
                </div>
              </div>
              <button onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : packages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-brand-muted hover:bg-brand-bg border border-brand-border'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold text-brand-text mb-2">No packages found</h3>
            <p className="text-brand-muted mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary-navy">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
