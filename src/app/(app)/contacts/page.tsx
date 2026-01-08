'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactInput } from '@/lib/validators';
import { Plus, Upload, Trash2, Edit } from 'lucide-react';

interface Contact {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const fetchContacts = async (p: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/contacts?page=${p}`);
      // Assuming Laravel standard pagination structure
      setContacts(response.data.data || []);
      setTotalPage(response.data.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  const onSubmit = async (data: ContactInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/v1/contacts', data);
      setIsModalOpen(false);
      reset();
      fetchContacts(page);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setError('Failed to create contact.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/api/v1/contacts/${id}`);
      fetchContacts(page);
    } catch (err) {
      alert('Failed to delete contact.');
    }
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    if (!file) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/v1/contacts/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsImportOpen(false);
      fetchContacts(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Email', accessor: 'email' as keyof Contact },
    { header: 'First Name', accessor: (c: Contact) => c.first_name || '-' },
    { header: 'Last Name', accessor: (c: Contact) => c.last_name || '-' },
    { header: 'Created At', accessor: (c: Contact) => new Date(c.created_at).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (c: Contact) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDelete(c.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Contacts</h1>
          <p className="text-slate-500 mt-1">Manage your subscribers and audience segments.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn-secondary"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={() => {
              setError(null);
              reset();
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={contacts} loading={loading} />
        <Pagination currentPage={page} totalPage={totalPage} onPageChange={setPage} />
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Contact"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <input
              {...register('email')}
              className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11"
              placeholder="email@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 ml-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
              <input
                {...register('first_name')}
                className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
              <input
                {...register('last_name')}
                className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
            <input
              {...register('phone')}
              className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11"
              placeholder="+261 ..."
            />
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-w-[120px]"
            >
              {submitting ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Contacts from CSV"
      >
        <form onSubmit={handleImport} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-primary-400 hover:bg-primary-50/10 transition-all group">
            <input
              type="file"
              name="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              required
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-primary-500" />
              </div>
              <span className="block text-base font-semibold text-slate-900">
                Choose a CSV file
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                or drag and drop it here
              </span>
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:border-primary-200">
                Max size: 5MB
              </div>
            </label>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsImportOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-w-[140px]"
            >
              {submitting ? 'Processing...' : 'Start Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
