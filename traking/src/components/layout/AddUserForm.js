import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
//import axios from 'axios';
import axios from '../../utils/axiosInstance';

export default function AddUserForm() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || 'add';
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    userId: '',
    email: '',
    role: 'VIEWER',
    auth_type: 'LOCAL',
    password: '',
    actif: true,
  });

  const navigate = useNavigate();

  const getTitle = (mode) => {
    switch (mode) {
      case 'edit': return 'Edit User';
      case 'view': return 'User Details';
      default: return 'Add User';
    }
  };

  /* const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }; */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si on change le type d'authentification
    if (name === 'auth_type') {
      setFormData((prev) => ({
        ...prev,
        auth_type: value,
        password: value === 'LDAP' ? '' : prev.password  // On vide le password si on passe à LDAP
      }));
    } else {
      // Comportement normal pour les autres champs
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };


  const { usersId } = useParams();
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && usersId) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/utilisateurs/${usersId}`);
          const user = res.data;

          setFormData({
            nom: user.nom || '',
            userId: user.userId || '',
            email: user.email || '',
            role: user.role || 'VIEWER',
            auth_type: user.auth_type || 'LOCAL',
            password: '', // Facultatif en edit/view
            actif: user.actif ?? true,
          });
        } catch (error) {
          console.error('Erreur de chargement utilisateur :', error);
        }
      };

      fetchUser();
    }
  }, [mode, usersId]);


  /* const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (mode === 'add') {
        await axios.post('http://localhost:5000/utilisateurs', payload);
      } else if (mode === 'edit') {
        await axios.put(`http://localhost:5000/utilisateurs/${usersId}`, payload);
      }
      navigate('/users');
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire', err);
    }
  }; */

  const [modalMessage, setModalMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // 🔒 Ne pas envoyer un champ `password` vide en mode edit LOCAL
      if (mode === 'edit') {
        if (formData.auth_type === 'LOCAL' && !formData.password) {
          delete payload.password;
        }
      }
      if (mode === 'add') {
        await axios.post('/utilisateurs', payload);
        setModalMessage('User added successfully.');
      } else if (mode === 'edit') {
        await axios.put(`/utilisateurs/${usersId}`, payload);
        setModalMessage('User modified successfully.');
      }
      setShowModal(true); // ✅ Affiche la modale
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire', err);
    }
  };
  const closeModalAndRedirect = () => {
    setShowModal(false);
    navigate('/users');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{getTitle(mode)}</h1>
      <div className="flex gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-3xl bg-white rounded-lg shadow-md p-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                readOnly={mode === 'view'}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                readOnly={mode === 'view'}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                readOnly={mode === 'view'}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required={formData.auth_type === 'LOCAL'}
              disabled={formData.auth_type === 'LDAP' || mode === 'view'}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={mode === 'view'}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Authentification</label>
              <select
                name="auth_type"
                value={formData.auth_type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={mode === 'view'}
              >
                <option value="LOCAL">LOCAL</option>
                <option value="LDAP">LDAP</option>
              </select>
            </div>
          </div>

          <div className="flex items-center mt-6 gap-2">
            <input
              type="checkbox"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="h-4 w-4"
            />
            <label className="text-sm">Active</label>
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
            >
              Go back
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-800 text-white hover:bg-blue-700"
              >
                {mode === 'edit' ? 'Save changes' : 'Add'}
              </button>
            )}
          </div>
        </form>
      </div>
      {/* ✅ Modal de confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
            <p className="mb-4 text-gray-700">{modalMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModalAndRedirect}
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
