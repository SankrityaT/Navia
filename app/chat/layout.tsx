// Chat layout with navbar
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
