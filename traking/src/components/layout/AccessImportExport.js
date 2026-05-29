import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import axios from '../../utils/axiosInstance';

const EXPORT_COLUMNS = [
  'id',
  'login',
  'name',
  'mail',
  'action',
  'num_ticket',
  'platform',
  'plateforme_id',
  'date_enregistrement',
  'date_modification',
  'actif',
  'utilisateur_id',
];

const REQUIRED_IMPORT_FIELDS = ['login', 'name', 'mail', 'action', 'num_ticket', 'date_modification'];
const ACTIONS = ['creation', 'update', 'suspension', 'deletion'];

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const detectDelimiter = (content) => {
  const firstLine = content.split(/\r?\n/, 1)[0] || '';
  return firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
};

const parseCsv = (content) => {
  const delimiter = detectDelimiter(content);
  const rows = [];
  let row = [];
  let value = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(value);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
};

const normalizeHeader = (header) => header.replace(/^\uFEFF/, '').trim().toLowerCase();

const normalizeAction = (action) => action.trim().toLowerCase();

export default function AccessImportExport({ accessData, plateformes, getPlatformName, onImportComplete }) {
  const inputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState('');

  const platformByName = plateformes.reduce((acc, platform) => {
    acc[platform.nom.trim().toLowerCase()] = platform.id;
    return acc;
  }, {});

  const downloadTemplate = () => {
    const csv = [
      REQUIRED_IMPORT_FIELDS.concat(['platform', 'plateforme_id']).join(','),
      ['jdoe', 'John Doe', 'john.doe@example.com', 'creation', 'TICKET-001', '2026-05-28 10:30:00', 'Nom plateforme', ''].map(escapeCsvValue).join(','),
    ].join('\n');
    downloadCsv(csv, 'access_import_template.csv');
  };

  const downloadCsv = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const rows = accessData.map((item) => ({
      ...item,
      platform: getPlatformName(item.plateforme_id),
    }));

    const csv = [
      EXPORT_COLUMNS.join(','),
      ...rows.map((row) => EXPORT_COLUMNS.map((column) => escapeCsvValue(row[column])).join(',')),
    ].join('\n');

    downloadCsv(csv, `access_export_${new Date().toISOString().slice(0, 10)}.csv`);
    setStatus(`${rows.length} accès exporté(s).`);
  };

  const buildPayload = (record, rowNumber) => {
    const missingFields = REQUIRED_IMPORT_FIELDS.filter((field) => !record[field]);
    if (missingFields.length > 0) {
      throw new Error(`Ligne ${rowNumber}: champ(s) manquant(s): ${missingFields.join(', ')}`);
    }

    const action = normalizeAction(record.action);
    if (!ACTIONS.includes(action)) {
      throw new Error(`Ligne ${rowNumber}: action invalide "${record.action}".`);
    }

    const plateformeId = record.plateforme_id
      ? parseInt(record.plateforme_id, 10)
      : platformByName[(record.platform || '').trim().toLowerCase()];

    if (!plateformeId) {
      throw new Error(`Ligne ${rowNumber}: plateforme introuvable.`);
    }

    return {
      login: record.login,
      name: record.name,
      mail: record.mail,
      action,
      num_ticket: record.num_ticket,
      date_modification: record.date_modification,
      plateforme_id: plateformeId,
    };
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatus('');

    try {
      const content = await file.text();
      const rows = parseCsv(content);

      if (rows.length < 2) {
        throw new Error('Le fichier CSV ne contient aucune donnée à importer.');
      }

      const headers = rows[0].map(normalizeHeader);
      const records = rows.slice(1).map((row) =>
        headers.reduce((acc, header, index) => {
          acc[header] = (row[index] || '').trim();
          return acc;
        }, {})
      );

      const payloads = records.map((record, index) => buildPayload(record, index + 2));
      const response = await axios.post('/acces/import', { records: payloads });
      const result = response.data;

      await onImportComplete();

      const errors = result.errors || [];
      const baseStatus = `${result.created || 0} créé(s), ${result.updated || 0} modifié(s), ${result.history_only || 0} historique seul.`;
      setStatus(errors.length > 0 ? `${baseStatus} ${errors.length} erreur(s). Ligne ${errors[0].row}: ${errors[0].message}` : baseStatus);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="flex items-center border rounded-md px-3 py-2 text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
      >
        <Download className="mr-2" size={16} />
        Export CSV
      </button>

      <button
        type="button"
        onClick={downloadTemplate}
        className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
      >
        Template
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImport}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="flex items-center bg-blue-800 text-white px-3 py-2 rounded-md text-sm disabled:opacity-60"
      >
        <Upload className="mr-2" size={16} />
        {importing ? 'Import...' : 'Import CSV'}
      </button>

      {status && <span className="text-xs text-gray-500 max-w-xl">{status}</span>}
    </div>
  );
}
