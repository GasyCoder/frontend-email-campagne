'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactInput } from '@/lib/validators';
import { Plus, Upload, Trash2 } from 'lucide-react';

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
    { header: 'Email', accessor: 'email' as keyof Contact, className: 'max-w-[240px] break-words' },
    { header: 'First Name', accessor: (c: Contact) => c.first_name || '-' },
    { header: 'Last Name', accessor: (c: Contact) => c.last_name || '-' },
    {
      header: 'Created At',
      accessor: (c: Contact) => new Date(c.created_at).toLocaleDateString(),
    },
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
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your subscribers and audience segments.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            onClick={() => {
              setError(null);
              reset();
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
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
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <Input
            label="Email Address"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First Name" {...register('first_name')} />
            <Input label="Last Name" {...register('last_name')} />
          </div>
          <Input label="Phone Number" placeholder="+261 ..." {...register('phone')} />
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-[140px]">
              {submitting ? 'Adding...' : 'Add Contact'}
            </Button>
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
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center transition-all group hover:border-indigo-400 hover:bg-indigo-50/10 dark:border-slate-700 dark:hover:border-indigo-400">
            <input
              type="file"
              name="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              required
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 transition-transform group-hover:scale-110 dark:bg-slate-900">
                <Upload className="h-8 w-8 text-indigo-500" />
              </div>
              <span className="block text-base font-semibold text-slate-900 dark:text-slate-100">
                Choose a CSV file
              </span>
              <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                or drag and drop it here
              </span>
              <div className="mt-6 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/70">
                Max size: 5MB
              </div>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-[160px]">
              {submitting ? 'Processing...' : 'Start Import'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
