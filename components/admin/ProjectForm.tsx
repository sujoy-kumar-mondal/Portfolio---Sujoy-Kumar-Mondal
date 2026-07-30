'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import { IDescriptionPart } from '@/models/Project';

interface ProjectFormData {
  name: string;
  slug: string;
  category: string;
  date?: string;
  shortDescription: IDescriptionPart[];
  description: IDescriptionPart[];
  mainImage: string;
  images: string[];
  projectUrl: string;
  tags: string[];
  features: string[];
  workingPrinciple: string;
  accentColor: string;
  order: number;
  isActive: boolean;
}

const defaultData: ProjectFormData = {
  name: '', slug: '', category: '', date: '', shortDescription: [{ text: '' }],
  description: [{ text: '' }], mainImage: '', images: [], projectUrl: '',
  tags: [], features: [], workingPrinciple: '', accentColor: '#5292ff', order: 0, isActive: true,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

interface DescriptionEditorProps {
  label: string;
  parts: IDescriptionPart[];
  onChange: (parts: IDescriptionPart[]) => void;
}

function DescriptionEditor({ label, parts, onChange }: DescriptionEditorProps) {
  const addPart = () => onChange([...parts, { text: '' }]);
  const updateText = (i: number, text: string) => {
    const updated = [...parts];
    updated[i] = { ...updated[i], text };
    onChange(updated);
  };
  const updateUrl = (i: number, url: string) => {
    const updated = [...parts];
    updated[i] = { ...updated[i], url };
    onChange(updated);
  };
  const removePart = (i: number) => onChange(parts.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <button type="button" onClick={addPart} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">+ Add Part</button>
      </div>
      <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
        {parts.map((part, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1.5">
              <input type="text" value={part.text} onChange={e => updateText(i, e.target.value)}
                placeholder="Text" className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              <input type="url" value={part.url || ''} onChange={e => updateUrl(i, e.target.value)}
                placeholder="Hyperlink URL (optional — leave empty if not a link)" className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
            {parts.length > 1 && (
              <button type="button" onClick={() => removePart(i)} className="text-gray-600 hover:text-red-400 transition-colors mt-1">✕</button>
            )}
          </div>
        ))}
        <p className="text-xs text-gray-600 mt-2">💡 Each part is a piece of text. Add a URL to make it a hyperlink.</p>
      </div>
    </div>
  );
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  projectId?: string;
}

export default function ProjectForm({ initialData, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProjectFormData>({ ...defaultData, ...initialData });
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Track session uploads for auto-cleanup on cancel
  const sessionUploadedImagesRef = useRef<string[]>([]);
  const isSavedRef = useRef(false);

  const set = (key: keyof ProjectFormData) => (val: unknown) => setData(d => ({ ...d, [key]: val }));

  const handleNameChange = (name: string) => {
    setData(d => ({ ...d, name, slug: d.slug || slugify(name) }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !data.tags.includes(t) && data.tags.length < 12) {
      setData(d => ({ ...d, tags: [...d.tags, t.startsWith('#') ? t : `#${t}`] }));
      setTagInput('');
    }
  };

  const addFeature = () => {
    const f = featureInput.trim();
    if (f) { setData(d => ({ ...d, features: [...d.features, f] })); setFeatureInput(''); }
  };

  const handleUploadMain = (url: string) => {
    if (url) {
      sessionUploadedImagesRef.current.push(url);
      set('mainImage')(url);
    }
  };

  const handleUploadMultipleExtra = (urls: string[]) => {
    if (urls && urls.length > 0) {
      sessionUploadedImagesRef.current.push(...urls);
      setData(d => ({ ...d, images: [...d.images, ...urls] }));
    }
  };

  const handleCancel = async () => {
    // Delete any session uploaded images that are not saved
    const imagesToDelete = sessionUploadedImagesRef.current;
    sessionUploadedImagesRef.current = [];
    for (const url of imagesToDelete) {
      try {
        await fetch('/api/admin/delete-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
      } catch (e) {
        console.error('Failed to cleanup cancelled upload:', e);
      }
    }
    router.back();
  };

  const save = async () => {
    if (!data.name) { setError('Project name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const url = projectId ? `/api/admin/projects/${projectId}` : '/api/admin/projects';
      const method = projectId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      isSavedRef.current = true;
      sessionUploadedImagesRef.current = []; // Clear so they are not deleted
      router.push('/admin/projects');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const imgUrl = data.images[index];
    setData(d => ({ ...d, images: d.images.filter((_, fi) => fi !== index) }));
    if (imgUrl) {
      try {
        await fetch('/api/admin/delete-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imgUrl }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const removeMainImage = async () => {
    const imgUrl = data.mainImage;
    setData(d => ({ ...d, mainImage: '' }));
    if (imgUrl) {
      try {
        await fetch('/api/admin/delete-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imgUrl }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{projectId ? 'Edit Project' : 'New Project'}</h1>
          <p className="text-gray-500 text-sm">Fill in the project details below</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:border-white/30 transition-colors">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white">
            {saving ? 'Saving...' : projectId ? 'Update' : 'Create Project'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Basic Info */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm text-gray-300 block mb-1.5">Project Name *</label>
            <input type="text" value={data.name} onChange={e => handleNameChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="My Awesome Project" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Slug (URL)</label>
            <input type="text" value={data.slug} onChange={e => set('slug')(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="my-awesome-project" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Category</label>
            <input type="text" value={data.category} onChange={e => set('category')(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="Portfolio, YouTube, etc." />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Date / Period (Optional)</label>
            <input type="text" value={data.date || ''} onChange={e => set('date')(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="e.g. 2024, Jan 2024, etc." />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-300 block mb-1.5">Project URL</label>
            <input type="url" value={data.projectUrl} onChange={e => set('projectUrl')(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="https://yourproject.com" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Accent Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={data.accentColor} onChange={e => set('accentColor')(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              <input type="text" value={data.accentColor} onChange={e => set('accentColor')(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Display Order</label>
            <input type="number" value={data.order} onChange={e => set('order')(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" checked={data.isActive} onChange={e => set('isActive')(e.target.checked)} className="w-4 h-4 accent-pink-500" />
          <label htmlFor="isActive" className="text-sm text-gray-300">Active (visible on public site)</label>
        </div>
      </section>

      {/* Descriptions */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Descriptions</h2>
        <DescriptionEditor label="Short Description (shown in cards)" parts={data.shortDescription} onChange={parts => set('shortDescription')(parts)} />
        <DescriptionEditor label="Full Description (shown on project page)" parts={data.description} onChange={parts => set('description')(parts)} />
        <div>
          <label className="text-sm text-gray-300 block mb-1.5">Working Principle (optional)</label>
          <textarea value={data.workingPrinciple} onChange={e => set('workingPrinciple')(e.target.value)} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
            placeholder="Explain how this project works (optional)..." />
        </div>
      </section>

      {/* Tags */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tags</h2>
          <span className="text-xs text-gray-600">{data.tags.length}/12</span>
        </div>
        <div className="flex gap-2">
          <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="javascript (# added automatically)" disabled={data.tags.length >= 12}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors disabled:opacity-40" />
          <button type="button" onClick={addTag} disabled={data.tags.length >= 12} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors disabled:opacity-40">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 text-xs text-gray-300">
              {tag}
              <button type="button" onClick={() => set('tags')(data.tags.filter(t => t !== tag))} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Features</h2>
        <div className="flex gap-2">
          <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="Describe a key feature"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
          <button type="button" onClick={addFeature} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">Add</button>
        </div>
        <ul className="space-y-2">
          {data.features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-400">{i + 1}</span>
              <span className="flex-1">{f}</span>
              <button type="button" onClick={() => set('features')(data.features.filter((_, fi) => fi !== i))} className="text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Images */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Images</h2>
        <div className="space-y-2">
          <ImageUploader label="Main/Thumbnail Image" currentUrl={data.mainImage} folder="projects" onUpload={handleUploadMain} />
          {data.mainImage && (
            <button
              type="button"
              onClick={removeMainImage}
              className="text-xs text-red-400 hover:underline font-medium"
            >
              Remove Main Image (Deletes from Cloudinary)
            </button>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-3">Additional Gallery Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {data.images.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image from project and Cloudinary"
                >✕</button>
              </div>
            ))}
          </div>
          <ImageUploader label="Upload Additional Image(s)" folder="projects" multiple onUploadMultiple={handleUploadMultipleExtra} />
        </div>
      </section>

      <button type="button" onClick={save} disabled={saving} className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-[1.01] transition-transform text-white">
        {saving ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
      </button>
    </div>
  );
}
