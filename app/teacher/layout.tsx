import ProtectedLayout from "@/components/auth/ProtectedLayout";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["teacher"]}>
      {children}
    </ProtectedLayout>
  );
}