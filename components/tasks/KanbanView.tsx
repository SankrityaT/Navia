// FRONTEND: ADHD-Friendly Kanban Board with Drag & Drop
// Research-based: High contrast, color-coded priorities, generous whitespace

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types';
import { Clock, Circle, CheckCircle2, Timer, MoreHorizontal, GripVertical } from 'lucide-react';
import TaskModal from './TaskModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface KanbanViewProps {
  tasks: Task[];
}

// Droppable Column Component
function DroppableColumn({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className="space-y-4 flex-1 min-h-[200px] p-2 rounded-2xl transition-colors"
    >
      {children}
    </div>
  );
}

// Draggable Task Card Component
function DraggableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.task_id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return '💼';
      case 'finance':
        return '💰';
      case 'daily_life':
        return '✅';
      case 'social':
        return '👥';
      default:
        return '📋';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-[var(--clay-300)]/30 hover:border-[var(--clay-400)]/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="w-4 h-4 text-[var(--charcoal)]/40" strokeWidth={2} />
        </button>

        {/* Card Content */}
        <div className="flex-1" onClick={onClick}>
          {/* Priority Dot + Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(task.priority)}`} />
            <h4 className="font-semibold text-[var(--charcoal)] leading-snug flex-1">
              {task.title}
            </h4>
          </div>

          {/* Time + Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
              <Clock className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">{task.time_estimate} min</span>
              <span className="text-[var(--charcoal)]/40">|</span>
              <span className="text-lg">{getCategoryIcon(task.category)}</span>
            </div>
            
            {/* Expand indicator */}
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-5 h-5 text-[var(--clay-500)]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanView({ tasks: initialTasks }: KanbanViewProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync tasks when initialTasks changes (e.g., after page refresh)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];
    
    // Find the task to get its old status
    const taskToUpdate = tasks.find(t => t.task_id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const oldStatus = taskToUpdate.status;

    // Optimistic update - immediately update UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.task_id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // Call API to update task status in Pinecone
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      console.log(`✅ Task ${taskId} status updated: ${oldStatus} → ${newStatus}`);
      
      // Keep the optimistic update - task stays in new column
      // No refresh needed, state is already updated
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === taskId ? { ...task, status: oldStatus } : task
        )
      );
    }
  };
  
  const columns = [
    { 
      status: 'not_started', 
      title: 'Not Started', 
      icon: Circle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700'
    },
    { 
      status: 'in_progress', 
      title: 'In Progress', 
      icon: Timer,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700'
    },
    { 
      status: 'completed', 
      title: 'Complete', 
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700'
    },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return '💼';
      case 'finance':
        return '💰';
      case 'daily_life':
        return '✅';
      case 'social':
        return '👥';
      default:
        return '📋';
    }
  };

  // Empty state check
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-[var(--sage-400)]/20 flex items-center justify-center mb-6">
          <Circle className="w-10 h-10 text-[var(--sage-600)]" strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>
          No tasks yet!
        </h3>
        <p className="text-[var(--charcoal)]/60 mb-6 max-w-md text-center">
          Go to Chat and ask Navia to break down a task.
        </p>
        <a
          href="/chat"
          className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg"
        >
          Open Chat
        </a>
      </div>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t.task_id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-2xl p-4 mb-4`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${column.textColor}`} strokeWidth={2.5} />
                  <div>
                    <h3 className={`text-lg font-serif font-bold ${column.textColor}`} style={{fontFamily: 'var(--font-fraunces)'}}>
                      {column.title}
                    </h3>
                    <p className="text-sm text-[var(--charcoal)]/60">
                      {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop Zone */}
              <DroppableColumn id={column.status}>
                {columnTasks.map((task) => (
                  <DraggableTaskCard
                    key={task.task_id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-12 text-[var(--charcoal)]/40 text-sm italic">
                    Drag tasks here
                  </div>
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="bg-[var(--sand)] rounded-2xl p-5 border-2 border-[var(--clay-500)] shadow-2xl opacity-90">
            <h4 className="font-semibold text-[var(--charcoal)]">{activeTask.title}</h4>
          </div>
        ) : null}
      </DragOverlay>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </DndContext>
  );
}
