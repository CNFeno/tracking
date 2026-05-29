import { Calendar, MoreVertical, SquarePlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from '../ui/SearchBar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';
import { isSameDay } from 'date-fns';
import axios from '../../utils/axiosInstance';
import AccessImportExport from './AccessImportExport';

export default function AccessManagementContent() {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const role = localStorage.getItem('userRole');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [plateformes, setPlateformes] = useState([]);

  const fetchAccessData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/acces');
      setAccessData(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des accès :', err);
      if (err.response) {
        console.error('Message:', err.response.data?.message);
        console.error('Status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessData();
  }, []);

  useEffect(() => {
    const fetchPlateformes = async () => {
      try {
        const response = await axios.get('/plateformes');
        setPlateformes(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des plateformes", error);
      }
    };
    fetchPlateformes();
  }, []);

  const getPlatformName = (id) => {
    const p = plateformes.find((plat) => plat.id === id);
    return p ? p.nom : "Inconnu";
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const colorClasses = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-red-100 text-red-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-gray-100 text-gray-700',
    'bg-orange-100 text-orange-700',
  ];

  const getDynamicColorClass = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorClasses.length;
    return colorClasses[index];
  };

  const filteredData = accessData.filter((item) => {
    const matchesSearch =
      item.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.num_ticket.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform =
      selectedPlatform === '' || item.plateforme_id === parseInt(selectedPlatform);

    const matchesDate = selectedDate
      ? isSameDay(new Date(item.date_enregistrement), selectedDate)
      : true;


    return matchesSearch && matchesPlatform && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPlatform, selectedDate]);

  const columns = [
    { key: 'id', label: 'Id', getValue: (item) => item.id },
    { key: 'login', label: 'Login', getValue: (item) => item.login },
    { key: 'name', label: 'Name', getValue: (item) => item.name },
    {
      key: 'modifyDate',
      label: 'Modify Date',
      getValue: (item) => new Date(item.date_modification || item.date_enregistrement).getTime(),
    },
    { key: 'ticket', label: 'Ticket', getValue: (item) => item.num_ticket },
    { key: 'platform', label: 'Platform', getValue: (item) => getPlatformName(item.plateforme_id) },
    { key: 'lastAction', label: 'Last Action', getValue: (item) => item.action },
  ];

  const getSortValue = (item) => {
    const column = columns.find((col) => col.key === sortBy);
    return column ? column.getValue(item) : null;
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    const valA = getSortValue(a);
    const valB = getSortValue(b);

    if (valA === null || valA === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (valB === null || valB === undefined) return sortOrder === 'asc' ? 1 : -1;

    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(String(valB))
        : String(valB).localeCompare(valA);
    }

    if (typeof valA === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const getCompactPages = (currentPage, totalPages) => {
    const pages = [];
    const delta = 1;

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) {
      pages.push(1, '...');
    } else {
      pages.push(1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...', totalPages);
    } else if (totalPages > 1) {
      pages.push(totalPages);
    }

    return [...new Set(pages)];
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchBar
          placeholder="Search by login, name or ticket..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {role === 'ADMIN' && (
          <button onClick={() => navigate('/access/add')} className="bg-blue-800 text-white px-4 py-2 rounded-md flex items-center">
            <SquarePlus className="mr-2" size={16} />
            <span>Add To List</span>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Access Management</h1>
          <p className="text-gray-500">Display all the Access registered</p>
        </div>
        <div className="flex items-center gap-4">
          {role === 'ADMIN' && (
            <AccessImportExport
              accessData={sortedData}
              plateformes={plateformes}
              getPlatformName={getPlatformName}
              onImportComplete={fetchAccessData}
            />
          )}
          <div className="text-sm">
            Total <span className="font-bold">{filteredData.length}</span> Access
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="">Platform</option>
              {plateformes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="relative inline-block">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center bg-white border rounded-md px-4 py-2 text-gray-700 shadow-sm"
            >
              <span>
                {selectedDate ? selectedDate.toDateString() : "Select a date"}
              </span>
              <Calendar className="ml-2" size={16} />
            </button>

            {showCalendar && (
              <div className="absolute z-50 mt-2 border bg-white rounded-lg shadow-lg right-0">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  inline
                  calendarStartDay={1}
                />
                <div className="flex justify-end p-2">
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setShowCalendar(false);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="min-w-full relative">
            <thead>
              <tr className="border-b">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="py-3 px-4 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}{renderSortIcon(col.key)}
                  </th>
                ))}
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 relative">
                  <td className="py-3 px-4 text-sm text-gray-700">{item.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.login}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.date_modification || item.date_enregistrement}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.num_ticket}</td>
                  <td className="py-3 px-4">
                    {getPlatformName(item.plateforme_id) && (
                      <span className={`px-2 py-1 text-xs rounded ${getDynamicColorClass(getPlatformName(item.plateforme_id))}`}>
                        {getPlatformName(item.plateforme_id)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded ${getDynamicColorClass(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 relative">
                    <button onClick={() => toggleMenu(index)}>
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {openMenuIndex === index && (
                      <div className="absolute right-4 top-8 bg-white border rounded shadow z-10 text-sm">
                        <button
                          onClick={() => navigate(`/access/${item.id}`, { state: { mode: 'view' } })}
                          className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
                          View
                        </button>
                        {role === 'ADMIN' && (
                          <button
                            onClick={() => navigate(`/access/${item.id}`, { state: { mode: 'edit' } })}
                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex flex-wrap justify-center items-center gap-2 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded border disabled:opacity-50 whitespace-nowrap"
          >
            Previous
          </button>

          {getCompactPages(currentPage, totalPages).map((page, index) =>
            page === '...' ? (
              <span
                key={index}
                className="px-2 text-gray-500 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm rounded border ${currentPage === page
                    ? 'bg-blue-800 text-white'
                    : 'bg-white text-gray-800'
                  }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded border disabled:opacity-50 whitespace-nowrap"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
