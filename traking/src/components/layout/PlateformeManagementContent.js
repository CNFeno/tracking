import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import axios from '../../utils/axiosInstance'; // 🔹 Ajustez le chemin selon votre structure
import SearchBar from '../ui/SearchBar';

export default function PlateformeManagementContent() {
  const [plateformes, setPlateformes] = useState([]);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_ENDPOINT = '/plateformes';

  // Charger les plateformes
  useEffect(() => {
    loadPlateformes();
  }, []);

  const loadPlateformes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINT);
      setPlateformes(response.data);
    } catch (err) {
      console.error('Loading error:', err);
      setError('Error loading platforms');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre (création ou mise à jour)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      if (editingId) {
        // Mise à jour
        await axios.put(`${API_ENDPOINT}/${editingId}`, formData);
      } else {
        // Création
        await axios.post(API_ENDPOINT, formData);
      }
      
      setFormData({ nom: '', description: '' });
      setEditingId(null);
      await loadPlateformes(); // Recharger la liste
      
    } catch (err) {
      console.error('Error during the submission:', err);
      setError(err.response?.data?.message || 'Error during the submission');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this platform ?')) return;
    
    try {
      setError('');
      setLoading(true);
      await axios.delete(`${API_ENDPOINT}/${id}`);
      await loadPlateformes(); // Recharger la liste
    } catch (err) {
      console.error('Error while deleting it:', err);
      setError(err.response?.data?.message || 'Error while deleting it');
    } finally {
      setLoading(false);
    }
  };

  // Préparer l'édition
  const handleEdit = (plateforme) => {
    setFormData({ nom: plateforme.nom, description: plateforme.description });
    setEditingId(plateforme.id);
    setError(''); // Reset error
  };

  // Annuler l'édition
  const handleCancel = () => {
    setFormData({ nom: '', description: '' });
    setEditingId(null);
    setError('');
  };

  const filteredPlateformes = plateformes.filter((plateforme) => {
    const query = searchTerm.toLowerCase();
    return (
      plateforme.nom?.toLowerCase().includes(query) ||
      plateforme.description?.toLowerCase().includes(query) ||
      (plateforme.actif ? 'active' : 'inactive').includes(query)
    );
  });

  const totalPages = Math.ceil(filteredPlateformes.length / itemsPerPage);
  const paginatedPlateformes = filteredPlateformes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plateformes Management</h1>
          <p className="text-sm text-gray-500">
            Total <span className="font-semibold">{filteredPlateformes.length}</span> plateformes
          </p>
        </div>
        <SearchBar
          placeholder="Search by name, description or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Description"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white rounded px-4 py-2 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} className="mr-1" />
          {loading ? 'Loading...' : (editingId ? 'Modify' : 'Add')}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      )}

      {/* Liste des plateformes */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Platform Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">State</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlateformes.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                  {loading ? 'Chargement...' : 'Aucune plateforme trouvée'}
                </td>
              </tr>
            ) : (
              paginatedPlateformes.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">{p.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{p.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(p.date_creation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      p.actif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => handleEdit(p)}
                        disabled={loading}
                        title="Modify"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 p-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm rounded border disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 text-sm rounded border ${
              currentPage === page ? 'bg-blue-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-sm rounded border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
