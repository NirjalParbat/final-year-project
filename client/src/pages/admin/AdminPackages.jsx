import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiMapPin, FiSearch } from 'react-icons/fi';
import { packageAPI } from '../../api/index.js';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&q=60';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await packageAPI.getAdminAll();
      setPackages(data.packages);
    } catch { toast.error('Failed to load packages'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await packageAPI.delete(id);
      toast.success('Package deleted');
      fetchPackages();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = packages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.destination.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Manage Packages</h1>
          <p className="text-gray-500 text-sm">{packages.length} total packages</p>
        </div>
        <Link to="/admin/packages/new" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus /> Add Package
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packages..."
          className="input-field pl-10 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Package</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Seats</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Rating</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((pkg) => (
                <tr key={pkg._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={pkg.images?.[0] || PLACEHOLDER} alt="" className="w-12 h-9 rounded-lg object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                      <div>
                        <div className="font-semibold text-gray-800 line-clamp-1">{pkg.title}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <FiMapPin className="text-primary-400" /> {pkg.destination}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge bg-gray-100 text-gray-600">{pkg.category}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{pkg.currency} {pkg.price?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-600">{pkg.maxPeople - pkg.bookedSeats}/{pkg.maxPeople}</td>
                  <td className="px-5 py-4">
                    {pkg.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
                        <span className="font-medium text-gray-700">{pkg.rating}</span>
                      </div>
                    ) : <span className="text-gray-300 text-xs">No ratings</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin/packages/edit/${pkg._id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(pkg._id, pkg.title)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiSearch className="text-4xl mx-auto mb-3 text-gray-300" />
            <p>No packages found</p>
          </div>
        )}
      </div>
    </div>
  );
}


