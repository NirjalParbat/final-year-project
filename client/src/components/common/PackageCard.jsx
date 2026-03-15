import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { packageAPI } from '../../api/index.js';
import { useState } from 'react';

export default function PackageCard({ pkg, onWishlistToggle }) {
  const { user, refreshUser } = useAuth();
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.some((id) => id.toString() === pkg._id.toString()) ?? false
  );
  const [toggling, setToggling] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return (window.location.href = '/login');
    setToggling(true);
    try {
      await packageAPI.toggleWishlist(pkg._id);
      setWishlisted(!wishlisted);
      await refreshUser();
      onWishlistToggle?.();
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const coverImage =
    pkg.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=80';
  const availableSeats = pkg.maxPeople - (pkg.bookedSeats || 0);
  const isLowAvailability = availableSeats <= 5 && availableSeats > 0;

  return (
    <Link to={`/packages/${pkg._id}`} className="card group block">
      {/* ── Image ─────────────────────────────────── */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={coverImage}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-white/92 backdrop-blur-sm text-primary-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {pkg.category}
        </span>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={toggling}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            wishlisted
              ? 'bg-accent-400 text-white shadow-md'
              : 'bg-white/92 backdrop-blur-sm text-brand-muted hover:text-accent-400 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Rating pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/92 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span className="text-xs font-semibold text-brand-text">{pkg.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-brand-muted">({pkg.numReviews || 0})</span>
        </div>

        {/* Low seats warning */}
        {isLowAvailability && (
          <div className="absolute bottom-3 right-3 bg-accent-400 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
            Only {availableSeats} left!
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────── */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-brand-text text-[1.05rem] leading-snug mb-1.5 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {pkg.title}
        </h3>

        <div className="flex items-center gap-1.5 text-brand-muted mb-3">
          <MapPin className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
          <span className="text-sm">{pkg.destination}, {pkg.country}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-brand-muted mb-5">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{pkg.duration} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{availableSeats} seats left</span>
          </div>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <div>
            <span className="text-[10px] text-brand-muted uppercase tracking-wide">From</span>
            <div className="font-bold text-primary-600 text-xl leading-tight">
              {pkg.currency} {pkg.price?.toLocaleString()}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 btn-primary text-xs py-2 px-4">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
