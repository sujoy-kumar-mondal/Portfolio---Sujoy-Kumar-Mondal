import { notFound } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import ProjectForm from '@/components/admin/ProjectForm';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

async function getProject(id: string) {
  await connectDB();
  try {
    const project = await Project.findById(id).lean();
    return project;
  } catch {
    return null;
  }
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return notFound();

  return (
    <div className="flex flex-col md:flex-row bg-[#0a0a0a] min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
        <ProjectForm
          projectId={id}
          initialData={{
            name: project.name,
            slug: project.slug,
            category: project.category,
            date: project.date || '',
            shortDescription: project.shortDescription,
            description: project.description,
            mainImage: project.mainImage,
            images: project.images,
            projectUrl: project.projectUrl,
            tags: project.tags,
            features: project.features,
            workingPrinciple: project.workingPrinciple,
            accentColor: project.accentColor,
            order: project.order,
            isActive: project.isActive,
          }}
        />
      </main>
    </div>
  );
}
