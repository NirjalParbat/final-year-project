import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { authAPI } from '../api/index.js';
import PackageCard from '../components/common/PackageCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    authAPI.getMe()
      .then(({ data }) => setWishlist(data.user.wishlist || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-red-500 fill-current" />
          <h1 className="font-display text-3xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} onWishlistToggle={fetchWishlist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Explore packages and save your favorites here</p>
            <Link to="/packages" className="btn-primary">Browse Packages</Link>
          </div>
        )}
      </div>
    </div>
  );
}
