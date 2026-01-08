'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
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
    { header: 'Name', accessor: 'name' as keyof List },
    { header: 'Description', accessor: (l: List) => l.description || '-' },
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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lists</h1>
          <p className="text-slate-500 mt-1">Organize your contacts into segments.</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            reset();
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New List
        </button>
      </div>

      <Table columns={columns} data={lists} loading={loading} />

      {/* Create List Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New List"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. Newsletter Subscribers"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create List'}
            </button>
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
          <p className="text-sm text-gray-500">Select contacts to add to this list.</p>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y">
            {contacts.map((contact) => (
              <label key={contact.id} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedContacts([...selectedContacts, contact.id]);
                    } else {
                      setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                    }
                  }}
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                  <p className="text-xs text-gray-500">
                    {contact.first_name} {contact.last_name}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAdd}
              disabled={submitting || selectedContacts.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : `Add ${selectedContacts.length} Contacts`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
