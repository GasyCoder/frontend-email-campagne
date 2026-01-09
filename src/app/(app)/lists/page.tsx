'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listSchema, ListInput } from '@/lib/validators';
import { Plus, Trash2, Users } from 'lucide-react';

interface List {
  id: number;
  name: string;
  description: string | null;
  contacts_count: number;
}

interface Contact {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListInput>({
    resolver: zodResolver(listSchema),
  });

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/lists');
      setLists(response.data.lists || []);
    } catch (err) {
      console.error('Failed to fetch lists', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContacts = async () => {
    try {
      const response = await api.get('/api/v1/contacts?per_page=100'); // Get more for selection
      setContacts(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchAllContacts();
  }, []);

  const onSubmit = async (data: ListInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/v1/lists', data);
      setIsModalOpen(false);
      reset();
      fetchLists();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/api/v1/lists/${id}`);
      fetchLists();
    } catch (err) {
      alert('Failed to delete list.');
    }
  };

  const handleBulkAdd = async () => {
    if (!selectedList || selectedContacts.length === 0) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/lists/${selectedList}/contacts`, {
        contact_ids: selectedContacts,
      });
      setIsBulkOpen(false);
      setSelectedContacts([]);
      fetchLists();
    } catch (err) {
      alert('Failed to add contacts to list.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof List, className: 'max-w-[200px] break-words' },
    {
      header: 'Description',
      accessor: (l: List) => l.description || '-',
      className: 'max-w-[320px] break-words',
    },
    { header: 'Contacts', accessor: (l: List) => l.contacts_count ?? 0 },
    {
      header: 'Actions',
      accessor: (l: List) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedList(l.id);
              setIsBulkOpen(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
            title="Add Contacts"
          >
            <Users className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(l.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Lists</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize your contacts into segments.
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>

      <Table columns={columns} data={lists} loading={loading} />

      {/* Create List Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New List"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <Input
            label="Name"
            placeholder="e.g. Newsletter Subscribers"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-offset-slate-950"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create List'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Add Contacts to List"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select contacts to add to this list.
          </p>
          <div className="max-h-60 divide-y overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            {contacts.map((contact) => (
              <label
                key={contact.id}
                className="flex cursor-pointer items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/70"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedContacts([...selectedContacts, contact.id]);
                    } else {
                      setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                    }
                  }}
                />
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                    {contact.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {contact.first_name} {contact.last_name}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsBulkOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAdd}
              disabled={submitting || selectedContacts.length === 0}
            >
              {submitting ? 'Adding...' : `Add ${selectedContacts.length} Contacts`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
