import { useState, useEffect } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { bookingAPI } from '../../api/index.js';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const paymentColors = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchBookings(); }, [statusFilter, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getAll({ status: statusFilter, page, limit: 10 });
      setBookings(data.bookings);
      setPages(data.pages);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, bookingStatus, paymentStatus) => {
    try {
      await bookingAPI.updateStatus(id, { bookingStatus, paymentStatus });
      toast.success('Status updated');
      fetchBookings();
    } catch { toast.error('Update failed'); }
  };

  const filtered = search
    ? bookings.filter((b) =>
        b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.packageId?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">Manage Bookings</h1>
        <p className="text-gray-500 text-sm">View and manage all tour bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..." className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field max-w-xs">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Customer', 'Package', 'Travel Date', 'People', 'Amount', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-4 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{b.userId?.name}</div>
                        <div className="text-xs text-gray-400">{b.userId?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">
                        <div className="truncate">{b.packageId?.title}</div>
                        <div className="text-xs text-gray-400">{b.packageId?.destination}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(b.travelDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{b.numberOfPeople}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        NPR {b.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${paymentColors[b.paymentStatus]}`}>{b.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[b.bookingStatus]}`}>{b.bookingStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusUpdate(b._id, e.target.value, b.paymentStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">No bookings found</div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                {[...Array(pages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium ${page === i + 1 ? 'bg-primary-500 text-white' : 'border border-gray-200 hover:border-primary-400 text-gray-600'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


