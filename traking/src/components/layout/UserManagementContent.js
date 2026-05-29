import { useEffect, useState } from 'react';
import { Pencil, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import SearchBar from '../ui/SearchBar';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/utilisateurs');
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  const handleView = (id) => {
    navigate(`/users/${id}?mode=view`);
  };

  const handleEdit = (id) => {
    navigate(`/users/${id}?mode=edit`);
  };

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.auth_type?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /* const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setShowModal(true);
  }; */

  const confirmDelete = async () => {
    try {
      await axios.delete(`/utilisateurs/${selectedUserId}`);
      setShowModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      console.error('Erreur suppression utilisateur:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users list</h1>
          <p className="text-sm text-gray-500">
            Total <span className="font-semibold">{filteredUsers.length}</span> users
          </p>
        </div>
        <button
          onClick={() => navigate('/users/add')}
          className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search by name, email, role or auth..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Name</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Email</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Role</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Auth</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500">Date</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            paginatedUsers.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{u.nom}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{u.email}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{u.role}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{u.auth_type}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{u.date_Creation}</td>
                <td className="py-3 px-4 text-sm text-gray-700 text-center">
                  <button className="text-blue-600 mr-2" onClick={() => handleEdit(u.id)}>
                    <Pencil size={18} />
                  </button>
                  <button className="text-gray-600 mr-2" onClick={() => handleView(u.id)}>
                    <Eye size={18} />
                  </button>
                  {/* <button className="text-red-600" onClick={() => handleDeleteClick(u.id)}>
                    <Trash2 size={18} />
                  </button> */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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

      {/* ✅ Modale de confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
