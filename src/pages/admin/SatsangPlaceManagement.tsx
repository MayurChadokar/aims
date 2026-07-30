import React, { useEffect, useState } from 'react';
import { fetchSatsangPlaces, createSatsangPlace, updateSatsangPlace, deleteSatsangPlace } from '../../services/api';
import { SatsangPlace, PlaceStatus } from '../../types';
import { INITIAL_SATSANG_PLACES } from '../../constants';
import { saveStoredPlaces } from '../../utils/storage';
import { Modal } from '../../components/Modal';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit, Trash2, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const SatsangPlaceManagement: React.FC = () => {
  const [places, setPlaces] = useState<SatsangPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SatsangPlace | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PlaceStatus>('POINT');
  const [area, setArea] = useState('Pithampur');

  const loadPlaces = async () => {
    setLoading(true);
    try {
      let data = await fetchSatsangPlaces();
      if (!data || data.length === 0) {
        data = INITIAL_SATSANG_PLACES;
        saveStoredPlaces(INITIAL_SATSANG_PLACES);
      }
      setPlaces(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaultPlaces = () => {
    saveStoredPlaces(INITIAL_SATSANG_PLACES);
    setPlaces(INITIAL_SATSANG_PLACES);
    toast.success('Successfully loaded 29 default Satsang Places!');
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPlace(null);
    setName('');
    setStatus('POINT');
    setArea('Pithampur');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (place: SatsangPlace) => {
    setEditingPlace(place);
    setName(place.name);
    setStatus(place.status);
    setArea(place.area);
    setIsModalOpen(true);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Place Name is required');
      return;
    }

    try {
      if (editingPlace) {
        await updateSatsangPlace(editingPlace.id, { name, status, area });
        toast.success('Satsang Place updated');
      } else {
        await createSatsangPlace({ name, status, area });
        toast.success('New Satsang Place added');
      }
      setIsModalOpen(false);
      loadPlaces();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save place');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Satsang Place?')) {
      try {
        await deleteSatsangPlace(id);
        toast.success('Satsang Place deleted');
        loadPlaces();
      } catch (err) {
        toast.error('Failed to delete place');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-gov border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Satsang Place Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Add new Satsang places, update locations, and assign read-only auto status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaultPlaces}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 shrink-0"
            title="Load default 29 Satsang Places"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Default 29 Places</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gov-blue hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Satsang Place</span>
          </button>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white rounded-2xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Place Name</th>
                <th className="p-3.5">Area</th>
                <th className="p-3.5">Assigned Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Loading Satsang places...
                  </td>
                </tr>
              ) : places.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 space-y-3">
                    <p>No Satsang places configured yet.</p>
                    <button
                      onClick={handleResetDefaultPlaces}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Load 29 Default Satsang Places</span>
                    </button>
                  </td>
                </tr>
              ) : (
                places.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {sp.name}
                    </td>
                    <td className="p-3.5 font-medium">{sp.area}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          sp.status === 'POINT' || sp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sp.status === 'CENTRE'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : sp.status === 'SUB CENTRE'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {sp.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(sp)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="Edit Place"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sp.id)}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg"
                          title="Delete Place"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Place Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlace ? 'Edit Satsang Place' : 'Add New Satsang Place'}
      >
        <form onSubmit={handleSavePlace} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name of Satsang Place *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ANJANIYA or PITHAMPUR"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Area *</label>
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlaceStatus)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
            >
              <option value="POINT">POINT</option>
              <option value="CENTRE">CENTRE</option>
              <option value="SUB CENTRE">SUB CENTRE</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              {editingPlace ? 'Save Changes' : 'Add Place'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
