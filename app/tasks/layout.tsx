// Tasks layout with navbar
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
