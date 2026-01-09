'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
    { header: 'Name', accessor: 'name' as keyof Template, className: 'max-w-[260px] break-words' },
    {
      header: 'Type',
      accessor: (t: Template) => (t.workspace_id ? 'Custom' : 'System'),
      className: (t: Template) =>
        t.workspace_id
          ? 'text-indigo-600 dark:text-indigo-300'
          : 'text-slate-500 dark:text-slate-400',
    },
    {
      header: 'Created At',
      accessor: (t: Template) => new Date(t.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (t: Template) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedTemplate(t);
              setIsPreviewOpen(true);
            }}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
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
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Templates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your email designs and layouts.
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setIsEditing(false);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <Table columns={columns} data={templates} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Template' : 'Create New Template'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <Input
            label="Name"
            placeholder="e.g. Welcome Email"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              HTML Content
            </label>
            <textarea
              {...register('html_body')}
              rows={12}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950 font-mono whitespace-pre-wrap break-words"
              placeholder="<html>...</html>"
            />
            {errors.html_body && (
              <p className="text-xs text-rose-600 dark:text-rose-300">
                {errors.html_body.message}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Preview: ${selectedTemplate?.name}`}
      >
        <div className="max-h-[600px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div
            dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_body || '' }}
            className="prose max-w-none dark:prose-invert"
          />
        </div>
      </Modal>
    </div>
  );
}
