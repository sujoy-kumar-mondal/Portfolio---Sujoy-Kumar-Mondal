import AdminSidebar from '@/components/admin/Sidebar';
import ProjectForm from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <ProjectForm />
      </main>
    </div>
  );
}
