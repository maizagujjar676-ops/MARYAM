import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, Mail, Phone, MapPin, User, DollarSign } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { calculateLeadScore } from '../../lib/scoring';
import { Lead, LeadStatus } from '../../types';

interface LeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  isOpen,
  onClose,
  leadToEdit,
}) => {
  if (!isOpen) return null;

  const { addLead, updateLead } = useLeads();

  const [businessName, setBusinessName] = useState(leadToEdit?.businessName || '');
  const [industry, setIndustry] = useState(leadToEdit?.industry || 'Digital Marketing & PPC');
  const [location, setLocation] = useState(leadToEdit?.location || '');
  const [city, setCity] = useState(leadToEdit?.city || '');
  const [country, setCountry] = useState(leadToEdit?.country || '');
  const [website, setWebsite] = useState(leadToEdit?.website || '');
  const [contactPerson, setContactPerson] = useState(leadToEdit?.contactPerson || '');
  const [email, setEmail] = useState(leadToEdit?.email || '');
  const [phone, setPhone] = useState(leadToEdit?.phone || '');
  const [companySize, setCompanySize] = useState(leadToEdit?.companySize || '11-50');
  const [status, setStatus] = useState<LeadStatus>(leadToEdit?.status || 'new');
  const [estimatedDealValue, setEstimatedDealValue] = useState(
    leadToEdit?.estimatedDealValue || 3500
  );
  const [notes, setNotes] = useState(leadToEdit?.notes || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leadToEdit) {
      setBusinessName(leadToEdit.businessName);
      setIndustry(leadToEdit.industry);
      setLocation(leadToEdit.location || '');
      setCity(leadToEdit.city || '');
      setCountry(leadToEdit.country || '');
      setWebsite(leadToEdit.website || '');
      setContactPerson(leadToEdit.contactPerson || '');
      setEmail(leadToEdit.email || '');
      setPhone(leadToEdit.phone || '');
      setCompanySize(leadToEdit.companySize || '11-50');
      setStatus(leadToEdit.status);
      setEstimatedDealValue(leadToEdit.estimatedDealValue || 3500);
      setNotes(leadToEdit.notes || '');
    } else {
      setBusinessName('');
      setIndustry('Digital Marketing & PPC');
      setLocation('');
      setCity('');
      setCountry('');
      setWebsite('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setCompanySize('11-50');
      setStatus('new');
      setEstimatedDealValue(3500);
      setNotes('');
    }
    setError(null);
  }, [leadToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Business Name is required.');
      return;
    }

    const calculated = calculateLeadScore({
      businessName,
      industry,
      location: location || city,
      city,
      website,
      email,
      phone,
      contactPerson,
      companySize,
    });

    if (leadToEdit) {
      await updateLead(leadToEdit.id, {
        businessName: businessName.trim(),
        industry,
        location: location.trim() || city.trim(),
        city: city.trim(),
        country: country.trim(),
        website: website.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companySize,
        status,
        estimatedDealValue: Number(estimatedDealValue) || 0,
        notes: notes.trim(),
        leadScore: calculated.score,
        scoreExplanation: calculated.explanation,
        scoreFactors: calculated.factors,
      });
    } else {
      await addLead({
        businessName: businessName.trim(),
        industry,
        location: location.trim() || city.trim() || 'Unspecified',
        city: city.trim(),
        country: country.trim(),
        website: website.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companySize,
        dataSource: 'manual',
        isDemoData: false,
        verifiedDate: new Date().toISOString().slice(0, 10),
        leadScore: calculated.score,
        scoreExplanation: calculated.explanation,
        scoreFactors: calculated.factors,
        status,
        tags: ['Manual Entry'],
        assignedTo: 'Unassigned',
        estimatedDealValue: Number(estimatedDealValue) || 0,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 my-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F5F7FA] px-6 py-4">
          <h2 className="font-bold text-base text-[#101828]">
            {leadToEdit ? `Edit: ${leadToEdit.businessName}` : 'Add New Business Lead'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Media Group Ltd"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="Digital Marketing & PPC">Digital Marketing & PPC</option>
                <option value="Software Development">Software Development & SaaS</option>
                <option value="Healthcare & Medical">Healthcare & Medical</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                <option value="Real Estate & Property">Real Estate & Property</option>
                <option value="Manufacturing & Supply Chain">Manufacturing & Supply Chain</option>
                <option value="Professional & Legal Services">Professional & Legal Services</option>
                <option value="Hospitality & Dining">Hospitality & Dining</option>
                <option value="Education & EdTech">Education & EdTech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Website
              </label>
              <input
                type="url"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. London, Austin, Toronto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. United Kingdom, USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe (Managing Partner)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                placeholder="partnerships@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555 0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Company Headcount
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estimated Deal Value ($)
              </label>
              <input
                type="number"
                placeholder="4000"
                value={estimatedDealValue}
                onChange={(e) => setEstimatedDealValue(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Initial Notes / Context
              </label>
              <textarea
                rows={3}
                placeholder="Context about project need, observed website gaps, or client goals..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] p-3 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#3563E9] px-5 py-2 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
            >
              {leadToEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
