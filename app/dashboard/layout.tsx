// Dashboard layout with navbar
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
