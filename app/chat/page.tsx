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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
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
