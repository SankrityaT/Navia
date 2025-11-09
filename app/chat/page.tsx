// FRONTEND: Chat page
// TODO: Fetch user context from API

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  // TODO: Fetch user's EF profile and goals from Pinecone
  const userContext = {
    ef_profile: ['task_initiation', 'time_management'],
    current_goals: ['job_searching', 'managing_finances'],
    energy_level: 70,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--sand)] to-[var(--clay-50)] relative overflow-hidden">
      {/* Floating decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[var(--sage-400)] rounded-full blur-[100px] opacity-15"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--clay-600)] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back to Dashboard
          </Link>
        </div>

      <div className="h-[calc(100vh-120px)]">
        <ChatInterface userContext={userContext} />
      </div>
      </div>
    </div>
  );
}
