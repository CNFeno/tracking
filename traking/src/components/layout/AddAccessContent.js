import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Mail } from 'lucide-react';
//import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
//import { jwtDecode } from "jwt-decode"; // assure-toi d'avoir installé cette dépendance
import axios from '../../utils/axiosInstance';



export default function AddAccessContent() {
    const navigate = useNavigate();
    const { accessId } = useParams();
    const location = useLocation();
    const mode = location.state?.mode || 'add'; // fallback au mode ajout
    const [historique, setHistorique] = useState([]);

    const formatDate = (isoString) => {
        // return isoString ? isoString.split('T')[0] : '';
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`; // ✅ format attendu par input[type=date]
    };

    const getTodayDate = () => formatDate(new Date());

    const [formData, setFormData] = useState({
        login: '',
        firstName: '',
        lastName: '',
        email: '',
        platform: '',
        action: '',
        ticket: '',
        date: getTodayDate(),
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData((prev) => ({ ...prev, file: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /* const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                login: formData.login,
                name: `${formData.firstName} ${formData.lastName}`,
                mail: formData.email,
                action: formData.action, // doit correspondre à une valeur de ton ActionEnum
                num_ticket: formData.ticket,
                plateforme_id: parseInt(formData.platformId), // champ à ajouter au formulaire
                utilisateur_id: 1//userIdFromTokenOrContext // à récupérer depuis l'auth ou props
            };

            await axios.post('http://localhost:5000/acces', payload);

            navigate('/access');
        } catch (err) {
            console.error('Erreur lors de la création de l’accès :', err);
        }
    }; */


    const handleSubmit = async (e) => {
        e.preventDefault();

        const utilisateur_id = parseInt(localStorage.getItem('utilisateur_id')); // 🔒 récupération de l'ID utilisateur

        if (!utilisateur_id) {
            alert("Utilisateur non authentifié.");
            return;
        }

        try {
            const payload = {
                login: formData.login,
                name: `${formData.firstName} ${formData.lastName}`,
                mail: formData.email,
                action: formData.action,
                num_ticket: formData.ticket,
                plateforme_id: parseInt(formData.platformId),
                utilisateur_id: utilisateur_id, // ✅ obligatoire pour le backend
            };

            if (mode === 'edit') {
                await axios.put(`/acces/${accessId}`, payload);
                alert('Accès mis à jour avec succès.');
            } else {
                await axios.post('/acces', payload);
                alert('Accès créé avec succès.');
            }

            navigate('/access');
        } catch (err) {
            if (err.response) {
                if (err.response.status === 409) {
                    alert('Un accès avec ce login existe déjà pour cette plateforme.');
                } else {
                    alert(`Erreur serveur : ${err.response.data.message || 'Erreur inconnue'}`);
                }
            } else {
                alert('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
            }

            console.error('Erreur lors de la création/mise à jour de l’accès :', err);
        }
    };



    const [plateformes, setPlateformes] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlateformes = async () => {
            try {
                const res = await axios.get('/plateformes');
                setPlateformes(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Erreur de chargement des plateformes :', error);
                setLoading(false);
            }
        };
        if ((mode === 'edit' || mode === 'view') && accessId) {
            const fetchAccess = async () => {
                try {
                    const res = await axios.get(`/acces/${accessId}`);
                    const data = res.data;
                    //console.log('Date brute de l\'API :', data.date);
                    //console.log('Données complètes reçues :', data);

                    const [firstName, lastName] = data.name.split(' ');
                    const dateValue = data.date_modification || data.date_enregistrement;

                    setFormData({
                        login: data.login,
                        firstName: firstName || '',
                        lastName: lastName || '',
                        email: data.mail,
                        platformId: data.plateforme_id?.toString()||'',
                        action: data.action,
                        ticket: data.num_ticket,
                        date: formatDate(dateValue) || '',
                        file: null
                    });
                } catch (error) {
                    console.error('Erreur lors du chargement des données :', error);
                }
            };
            fetchAccess();
        }

        fetchPlateformes();

        if ((mode === 'view' || mode === 'edit') && accessId) {
            const fetchHistorique = async () => {
                try {
                    const res = await axios.get(`/historique_actions/acces/${accessId}`);
                    setHistorique(res.data);
                } catch (error) {
                    console.error("Erreur lors du chargement de l'historique :", error);
                }
            };
            fetchHistorique();
        }

    }, [accessId, mode]);

    const getTitle = (mode) => {
        switch (mode) {
            case 'edit':
                return 'Edit Access';
            case 'view':
                return 'View Access';
            default:
                return 'Add Access';
        }
    };

    return (
        <div className="p-6">
            {/* Titre principal */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{getTitle(mode)}</h1>

            {/* Conteneur horizontal : Formulaire + Upload/Historique */}
            <div className="flex gap-8 items-start">
                {/* Form Container */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 max-w-3xl bg-white rounded-lg shadow-md p-8"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Login</label>
                            <input
                                type="text"
                                name="login"
                                value={formData.login}
                                onChange={handleChange}
                                placeholder="Login"
                                className="w-full border rounded px-3 py-2"
                                required
                                readOnly={mode === 'view'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">First name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                className="w-full border rounded px-3 py-2"
                                required
                                readOnly={mode === 'view'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Last name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                className="w-full border rounded px-3 py-2"
                                required
                                readOnly={mode === 'view'}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Email</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@domain.com"
                                    className="w-full border rounded pl-10 px-3 py-2"
                                    required
                                    readOnly={mode === 'view'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm mb-1">Platform</label>
                        <select
                            value={formData.platformId}
                            onChange={(e) =>
                                setFormData({ ...formData, platformId: e.target.value })
                            }
                            className="w-full border rounded px-3 py-2"
                            required
                            disabled={mode === 'view'}
                        >
                            <option value="">-- Choisir une plateforme --</option>
                            {plateformes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm mb-2">Action</label>
                        <div className="flex gap-4">
                            {['Creation', 'Update', 'Suspension', 'Deletion'].map((action) => (
                                <label key={action} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="action"
                                        required
                                        value={action.toLowerCase()}
                                        checked={formData.action === action.toLowerCase()}
                                        onChange={handleChange}
                                        disabled={mode === 'view'}
                                    />
                                    {action}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Ticket</label>
                            <input
                                type="text"
                                name="ticket"
                                value={formData.ticket}
                                onChange={handleChange}
                                placeholder="N° Ticket"
                                className="w-full border rounded px-3 py-2"
                                required
                                readOnly={mode === 'view'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <CalendarIcon size={16} />
                                </span>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full border rounded pl-10 px-3 py-2"
                                    required
                                    readOnly={mode === 'view' || mode === 'add'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/access')}
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

                {/* Historique */}
                {(mode === 'view' || mode === 'edit') && (
                    <div className="w-80 bg-white shadow-md rounded-lg p-6 h-fit">
                        <h3 className="text-lg font-semibold mb-4">Actions Logs</h3>
                        {historique.length > 0 ? (
                            <ul className="text-sm space-y-2">
                                {historique.map((item, index) => (
                                    <li key={index} className="border-b pb-2">
                                        <strong>{item.type_action}</strong> — {item.description}
                                        <br />
                                        <span className="text-gray-500 text-xs">
                                            {new Date(item.date_action).toLocaleString()}
                                        </span>
                                        <br />
                                        <strong>performed by</strong> — {item.utilisateur_userId}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No logs on the system</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
