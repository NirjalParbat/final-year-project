import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { packageAPI, uploadAPI } from '../../api/index.js';
import toast from 'react-hot-toast';

const categories = ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Wildlife', 'Religious', 'Trekking'];
const currencies = ['NPR', 'USD', 'INR'];

const defaultForm = {
  title: '', destination: '', country: 'Nepal', category: 'Adventure',
  description: '', price: '', currency: 'NPR', duration: '', maxPeople: '',
  images: [], highlights: [''], included: [''], excluded: [''],
  itinerary: [{ day: 1, title: '', description: '', accommodation: '', meals: '' }],
  availableDates: [], isFeatured: false, isActive: true,
};

export default function AdminPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      packageAPI.getById(id)
        .then(({ data }) => {
          const pkg = data.package;
          setForm({
            ...pkg,
            highlights: pkg.highlights?.length ? pkg.highlights : [''],
            included: pkg.included?.length ? pkg.included : [''],
            excluded: pkg.excluded?.length ? pkg.excluded : [''],
            itinerary: pkg.itinerary?.length ? pkg.itinerary : [{ day: 1, title: '', description: '', accommodation: '', meals: '' }],
          });
        })
        .catch(() => navigate('/admin/packages'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const setList = (key, index, value) => {
    setForm((p) => {
      const arr = [...p[key]];
      arr[index] = value;
      return { ...p, [key]: arr };
    });
  };

  const addListItem = (key, defaultVal) => setForm((p) => ({ ...p, [key]: [...p[key], defaultVal] }));
  const removeListItem = (key, index) => setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }));

  const setItinerary = (index, field, value) => {
    setForm((p) => {
      const arr = [...p.itinerary];
      arr[index] = { ...arr[index], [field]: value };
      return { ...p, itinerary: arr };
    });
  };

  const addItinerary = () => setForm((p) => ({
    ...p,
    itinerary: [...p.itinerary, { day: p.itinerary.length + 1, title: '', description: '', accommodation: '', meals: '' }],
  }));

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));
      const { data } = await uploadAPI.uploadImages(formData);
      setForm((p) => ({ ...p, images: [...p.images, ...data.urls] }));
      toast.success('Images uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeImage = (index) => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        maxPeople: Number(form.maxPeople),
        highlights: form.highlights.filter(Boolean),
        included: form.included.filter(Boolean),
        excluded: form.excluded.filter(Boolean),
        itinerary: form.itinerary.filter((i) => i.title),
      };

      if (isEditing) {
        await packageAPI.update(id, payload);
        toast.success('Package updated successfully!');
      } else {
        await packageAPI.create(payload);
        toast.success('Package created successfully!');
      }
      navigate('/admin/packages');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Package' : 'Create New Package'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{isEditing ? 'Update package details' : 'Fill in all required fields'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-5">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Title *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Everest Base Camp Trek" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
              <input type="text" value={form.destination} onChange={set('destination')} placeholder="e.g. Namche Bazaar" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input type="text" value={form.country} onChange={set('country')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select value={form.category} onChange={set('category')} className="input-field" required>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days) *</label>
              <input type="number" value={form.duration} onChange={set('duration')} min={1} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input type="number" value={form.price} onChange={set('price')} min={0} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select value={form.currency} onChange={set('currency')} className="input-field">
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max People *</label>
              <input type="number" value={form.maxPeople} onChange={set('maxPeople')} min={1} className="input-field" required />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 rounded text-primary-500" />
                <span className="text-sm font-medium text-gray-700">Featured Package</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 rounded text-primary-500" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the package in detail..." className="input-field resize-none" required />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-5">Images</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4 hover:border-primary-300 transition-colors">
            <input type="file" id="images" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            <label htmlFor="images" className="cursor-pointer">
              <FiUpload className="text-3xl text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload images (JPG, PNG, WebP)'}</p>
            </label>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* External URL input */}
          <div className="mt-3">
            <label className="block text-sm text-gray-500 mb-2">Or add image URL:</label>
            <div className="flex gap-2">
              <input type="url" placeholder="https://..." id="imgUrl" className="input-field text-sm flex-1" />
              <button type="button" onClick={() => {
                const url = document.getElementById('imgUrl').value;
                if (url) { setForm((p) => ({ ...p, images: [...p.images, url] })); document.getElementById('imgUrl').value = ''; }
              }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>

        {/* Highlights, Included, Excluded */}
        {[
          { key: 'highlights', label: 'Highlights', placeholder: 'e.g. Stunning mountain views' },
          { key: 'included', label: 'What\'s Included', placeholder: 'e.g. Airport transfers' },
          { key: 'excluded', label: 'What\'s Excluded', placeholder: 'e.g. Personal expenses' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-800">{label}</h2>
              <button type="button" onClick={() => addListItem(key, '')}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
                <FiPlus /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form[key].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={item} onChange={(e) => setList(key, i, e.target.value)}
                    placeholder={placeholder} className="input-field text-sm flex-1" />
                  {form[key].length > 1 && (
                    <button type="button" onClick={() => removeListItem(key, i)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Itinerary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-gray-800">Itinerary</h2>
            <button type="button" onClick={addItinerary} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
              <FiPlus /> Add Day
            </button>
          </div>
          <div className="space-y-4">
            {form.itinerary.map((day, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">{day.day}</div>
                  <input type="text" value={day.title} onChange={(e) => setItinerary(i, 'title', e.target.value)}
                    placeholder="Day title (e.g. Kathmandu to Lukla)" className="input-field text-sm flex-1" />
                </div>
                <textarea value={day.description} onChange={(e) => setItinerary(i, 'description', e.target.value)}
                  rows={2} placeholder="What happens this day..." className="input-field text-sm resize-none w-full mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={day.accommodation} onChange={(e) => setItinerary(i, 'accommodation', e.target.value)}
                    placeholder="Accommodation" className="input-field text-sm" />
                  <input type="text" value={day.meals} onChange={(e) => setItinerary(i, 'meals', e.target.value)}
                    placeholder="Meals (e.g. B/L/D)" className="input-field text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => navigate('/admin/packages')}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
            {saving ? 'Saving...' : isEditing ? 'Update Package' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
}


