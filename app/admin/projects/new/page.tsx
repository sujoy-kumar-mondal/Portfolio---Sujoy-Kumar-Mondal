import AdminSidebar from '@/components/admin/Sidebar';
import ProjectForm from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden overflow-y-auto">
        <ProjectForm />
      </main>
    </div>
  );
}
