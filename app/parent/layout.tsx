import ProtectedLayout from "@/components/auth/ProtectedLayout";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["parent"]}>
      {children}
    </ProtectedLayout>
  );
}