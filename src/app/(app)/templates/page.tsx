'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema, TemplateInput } from '@/lib/validators';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  html_body: string;
  workspace_id: number | null;
  created_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/templates');
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const onSubmit = async (data: TemplateInput) => {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && selectedTemplate) {
        await api.put(`/api/v1/templates/${selectedTemplate.id}`, data);
      } else {
        await api.post('/api/v1/templates', data);
      }
      setIsModalOpen(false);
      reset();
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template: Template) => {
    if (template.workspace_id === null) {
      alert('Global templates cannot be edited.');
      return;
    }
    setSelectedTemplate(template);
    setIsEditing(true);
    setValue('name', template.name);
    setValue('html_body', template.html_body);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/api/v1/templates/${id}`);
      fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete template.');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Template },
    { 
      header: 'Type', 
      accessor: (t: Template) => (t.workspace_id ? 'Custom' : 'System'),
      className: (t: Template) => t.workspace_id ? 'text-indigo-600' : 'text-gray-500'
    },
    { header: 'Created At', accessor: (t: Template) => new Date(t.created_at).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (t: Template) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedTemplate(t);
              setIsPreviewOpen(true);
            }}
            className="text-gray-600 hover:text-gray-900"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          {t.workspace_id && (
            <>
              <button
                onClick={() => handleEdit(t)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Templates</h1>
          <p className="text-slate-500 mt-1">Manage your email designs and layouts.</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsEditing(false);
            reset();
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </button>
      </div>

      <Table columns={columns} data={templates} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Template' : 'Create New Template'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. Welcome Email"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">HTML Content</label>
            <textarea
              {...register('html_body')}
              rows={12}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="<html>...</html>"
            />
            {errors.html_body && <p className="mt-1 text-xs text-red-600">{errors.html_body.message}</p>}
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
              {submitting ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Preview: ${selectedTemplate?.name}`}
      >
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-[600px] overflow-auto">
          <div 
            dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_body || '' }} 
            className="prose max-w-none"
          />
        </div>
      </Modal>
    </div>
  );
}
