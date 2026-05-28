// app/(dashboard)/subjects/page.tsx
import { SubjectsManagement } from "@/components/subjects/SubjectsManagement";
import AuthGuard from '@/components/auth/AuthGuard';

export default function SubjectsPage() {
  return (
    <AuthGuard allowRoles={["parent"]}>
      <SubjectsManagement />
    </AuthGuard>
  );
}