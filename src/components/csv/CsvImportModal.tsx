import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Check,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { Lead } from '../../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'complete';

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { leads, importLeads } = useLeads();

  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');

  // Column mappings
  const [columnMapping, setColumnMapping] = useState<{
    businessName: string;
    industry: string;
    city: string;
    country: string;
    website: string;
    email: string;
    phone: string;
    contactPerson: string;
    companySize: string;
  }>({
    businessName: '',
    industry: '',
    city: '',
    country: '',
    website: '',
    email: '',
    phone: '',
    contactPerson: '',
    companySize: '',
  });

  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number }>({
    imported: 0,
    duplicates: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse simple RFC-compliant CSV text
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvString(text);
    };
    reader.readAsText(file);
  };

  const parseCsvString = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      alert('CSV must contain at least a header row and one data row.');
      return;
    }

    // Parse header
    const headers = splitCsvLine(lines[0]);
    const dataRows = lines.slice(1).map(splitCsvLine);

    setCsvHeaders(headers);
    setParsedRows(dataRows);

    // Auto-detect columns intelligently
    const mapping = { ...columnMapping };
    headers.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.includes('business') || lower.includes('company') || lower.includes('name')) {
        if (!mapping.businessName) mapping.businessName = h;
      } else if (lower.includes('industry') || lower.includes('category') || lower.includes('sector')) {
        if (!mapping.industry) mapping.industry = h;
      } else if (lower.includes('city') || lower.includes('town')) {
        if (!mapping.city) mapping.city = h;
      } else if (lower.includes('country') || lower.includes('nation')) {
        if (!mapping.country) mapping.country = h;
      } else if (lower.includes('web') || lower.includes('domain') || lower.includes('url')) {
        if (!mapping.website) mapping.website = h;
      } else if (lower.includes('email') || lower.includes('mail')) {
        if (!mapping.email) mapping.email = h;
      } else if (lower.includes('phone') || lower.includes('tel') || lower.includes('mobile')) {
        if (!mapping.phone) mapping.phone = h;
      } else if (lower.includes('contact') || lower.includes('person') || lower.includes('lead')) {
        if (!mapping.contactPerson) mapping.contactPerson = h;
      } else if (lower.includes('size') || lower.includes('headcount') || lower.includes('employee')) {
        if (!mapping.companySize) mapping.companySize = h;
      }
    });

    setColumnMapping(mapping);
    setStep('mapping');
  };

  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Convert parsed rows into lead candidates
  const mappedCandidates = useMemo(() => {
    const getVal = (row: string[], header: string) => {
      const idx = csvHeaders.indexOf(header);
      return idx >= 0 && row[idx] ? row[idx].trim() : '';
    };

    const existingNames = new Set(leads.map((l) => l.businessName.toLowerCase().trim()));
    const existingWebs = new Set(
      leads.map((l) => (l.website ? l.website.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '') : ''))
    );

    return parsedRows.map((row, index) => {
      const bName = getVal(row, columnMapping.businessName);
      const web = getVal(row, columnMapping.website);
      const normWeb = web ? web.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '') : '';

      const isDuplicate = existingNames.has(bName.toLowerCase()) || (normWeb && existingWebs.has(normWeb));

      return {
        id: `row_${index}`,
        businessName: bName,
        industry: getVal(row, columnMapping.industry) || 'General B2B',
        city: getVal(row, columnMapping.city),
        country: getVal(row, columnMapping.country),
        website: web,
        email: getVal(row, columnMapping.email),
        phone: getVal(row, columnMapping.phone),
        contactPerson: getVal(row, columnMapping.contactPerson),
        companySize: getVal(row, columnMapping.companySize) || '11-50',
        isDuplicate,
      };
    });
  }, [parsedRows, csvHeaders, columnMapping, leads]);

  const validCandidates = mappedCandidates.filter((c) => Boolean(c.businessName));
  const duplicateCount = validCandidates.filter((c) => c.isDuplicate).length;
  const newCount = validCandidates.length - duplicateCount;

  const handleExecuteImport = async () => {
    setIsProcessing(true);
    const toImport: Partial<Lead>[] = validCandidates
      .filter((c) => !c.isDuplicate)
      .map((c) => ({
        businessName: c.businessName,
        industry: c.industry,
        city: c.city,
        country: c.country,
        location: [c.city, c.country].filter(Boolean).join(', ') || 'Global',
        website: c.website,
        email: c.email,
        phone: c.phone,
        contactPerson: c.contactPerson,
        companySize: c.companySize,
        dataSource: 'csv_import',
        status: 'new',
      }));

    const result = await importLeads(toImport);
    setImportResult({ imported: result.imported, duplicates: duplicateCount });
    setIsProcessing(false);
    setStep('complete');
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Company Name,Industry,City,Country,Website,Work Email,Phone,Contact Person,Size
Acme Digital Labs,Digital Marketing,London,United Kingdom,https://acmedigitallabs.co.uk,contact@acmedigitallabs.co.uk,+44 20 7946 0192,John Davies,11-50
Pinnacle SaaS,Software Development,Austin,USA,https://pinnaclesoftware.io,team@pinnaclesoftware.io,+1 512 555 0199,Sarah Vance,51-200
Pacific Health Care,Healthcare,Toronto,Canada,https://pacifichealth.ca,clinic@pacifichealth.ca,+1 416 555 0122,Dr. Alan Ross,1-10`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leadpilot-sample-import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F5F7FA] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#3563E9]">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#101828]">CSV Lead Import Engine</h2>
              <p className="text-[11px] text-gray-400">
                Upload business lists with column mapping & duplicate prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="p-6 space-y-6">
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-[#F5F7FA] p-8 text-center hover:border-[#3563E9] transition-colors">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-[#101828]">
                Select or drag a CSV file from your computer
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Standard comma-separated format (.csv). First row will be parsed as headers.
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3563E9] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs">
                Browse Files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
              <span>Need a reference template?</span>
              <button
                onClick={handleDownloadSampleCsv}
                className="inline-flex items-center gap-1 font-bold text-[#3563E9] hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#101828]">
                  Map CSV Columns to Lead Fields ({fileName})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Match your CSV column headers with LeadPilot fields.
                </p>
              </div>
              <span className="text-xs font-bold text-[#3563E9] bg-blue-50 px-2.5 py-1 rounded-lg">
                {parsedRows.length} Rows Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {[
                { field: 'businessName', label: 'Business / Company Name *', required: true },
                { field: 'industry', label: 'Industry Vertical' },
                { field: 'city', label: 'City / Region' },
                { field: 'country', label: 'Country' },
                { field: 'website', label: 'Official Website / URL' },
                { field: 'email', label: 'Work Email' },
                { field: 'phone', label: 'Phone Number' },
                { field: 'contactPerson', label: 'Contact Person Name' },
                { field: 'companySize', label: 'Headcount Size' },
              ].map(({ field, label, required }) => (
                <div key={field} className="rounded-xl border border-gray-200 bg-[#F5F7FA] p-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label}
                  </label>
                  <select
                    value={columnMapping[field as keyof typeof columnMapping]}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [field]: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
                  >
                    <option value="">— Skip Field —</option>
                    {csvHeaders.map((header) => (
                      <option key={header} value={header}>
                        Column: {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep('upload')}
                className="text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Back to Upload
              </button>
              <button
                onClick={() => {
                  if (!columnMapping.businessName) {
                    alert('Please map the Business Name column to continue.');
                    return;
                  }
                  setStep('preview');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-5 py-2 text-xs font-bold text-white hover:bg-[#284fcd] transition-all"
              >
                Preview & Validate <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Duplicate Detection */}
        {step === 'preview' && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-3 border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-500">Total Valid</span>
                <p className="text-xl font-extrabold text-[#101828] mt-0.5">
                  {validCandidates.length}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800">New to Import</span>
                <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{newCount}</p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800">Duplicates Skipped</span>
                <p className="text-xl font-extrabold text-amber-900 mt-0.5">{duplicateCount}</p>
              </div>
            </div>

            {duplicateCount > 0 && (
              <div className="rounded-xl bg-amber-50/80 p-3 text-xs text-amber-800 border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {duplicateCount} duplicates were detected based on company name or website domain match in your existing pipeline and will not be overwritten.
                </span>
              </div>
            )}

            {/* Preview sample rows */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <p className="bg-[#F5F7FA] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                Data Sample Preview (First 4 rows)
              </p>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {validCandidates.slice(0, 4).map((c, i) => (
                  <div key={i} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#101828]">{c.businessName}</p>
                      <p className="text-[11px] text-gray-500">
                        {c.industry} • {c.city || c.country || 'Global'} • {c.website || 'No website'}
                      </p>
                    </div>
                    {c.isDuplicate ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Duplicate
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Valid
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep('mapping')}
                className="text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing || newCount === 0}
                className="rounded-xl bg-[#3563E9] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#284fcd] disabled:opacity-50 transition-all shadow-xs"
              >
                {isProcessing ? 'Importing Leads...' : `Confirm & Import ${newCount} Leads`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-[#16A34A]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[#101828]">CSV Import Complete!</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Successfully imported <strong>{importResult.imported}</strong> new leads into your sales pipeline.
              {importResult.duplicates > 0 && ` ${importResult.duplicates} duplicates were skipped.`}
            </p>

            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-[#3563E9] px-6 py-2 text-xs font-bold text-white hover:bg-[#284fcd]"
            >
              Done & View Leads
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
