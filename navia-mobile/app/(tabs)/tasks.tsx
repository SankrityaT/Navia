import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';
import { supabase } from '../../services/supabase';

export default function TasksScreen() {
  const { user } = useUser();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID, using mock data');
        setTasks(mockTasks);
        setLoading(false);
        return;
      }

      // Fetch directly from Supabase
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksData && !error && tasksData.length > 0) {
        setTasks(tasksData);
      } else {
        // Use mock data as fallback
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Use mock data as fallback
      setTasks(mockTasks);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  // Mock tasks as fallback
  const mockTasks: Task[] = [
    {
      user_id: 'user_1',
      task_id: 'task_1',
      title: 'Update resume with recent projects',
      status: 'in_progress',
      priority: 'high',
      time_estimate: 45,
      category: 'career',
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_2',
      title: 'Research 5 companies in your field',
      status: 'not_started',
      priority: 'medium',
      time_estimate: 30,
      category: 'career',
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_3',
      title: 'Set up monthly budget tracker',
      status: 'not_started',
      priority: 'high',
      time_estimate: 60,
      category: 'finance',
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_4',
      title: 'Complete job application',
      status: 'completed',
      priority: 'high',
      time_estimate: 90,
      category: 'career',
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.highPriority;
      case 'medium': return Colors.mediumPriority;
      case 'low': return Colors.lowPriority;
      default: return Colors.charcoal;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career': return '💼';
      case 'finance': return '💰';
      case 'daily_life': return '✅';
      case 'social': return '👥';
      default: return '📋';
    }
  };

  const tasksByStatus = {
    not_started: tasks.filter(t => t.status === 'not_started'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.clay500} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.clay500]} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Task Visualizer</Text>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, view === 'kanban' && styles.toggleButtonActive]}
            onPress={() => setView('kanban')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={view === 'kanban' ? Colors.cream : Colors.charcoal} 
            />
            <Text style={[styles.toggleText, view === 'kanban' && styles.toggleTextActive]}>
              Kanban
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, view === 'list' && styles.toggleButtonActive]}
            onPress={() => setView('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={view === 'list' ? Colors.cream : Colors.charcoal} 
            />
            <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kanban View */}
      {view === 'kanban' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kanbanContainer}>
          {/* Not Started Column */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Ionicons name="ellipse-outline" size={20} color={Colors.notStarted} />
              <Text style={styles.columnTitle}>Not Started</Text>
              <View style={styles.columnBadge}>
                <Text style={styles.columnBadgeText}>{tasksByStatus.not_started.length}</Text>
              </View>
            </View>
            <ScrollView style={styles.columnContent}>
              {tasksByStatus.not_started.map(task => (
                <View key={task.task_id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                  <View style={styles.taskFooter}>
                    <View style={styles.taskMeta}>
                      <Ionicons name="time-outline" size={14} color={Colors.charcoal} />
                      <Text style={styles.taskTime}>{task.time_estimate}m</Text>
                    </View>
                    <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* In Progress Column */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Ionicons name="play-circle" size={20} color={Colors.inProgress} />
              <Text style={styles.columnTitle}>In Progress</Text>
              <View style={styles.columnBadge}>
                <Text style={styles.columnBadgeText}>{tasksByStatus.in_progress.length}</Text>
              </View>
            </View>
            <ScrollView style={styles.columnContent}>
              {tasksByStatus.in_progress.map(task => (
                <View key={task.task_id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                  <View style={styles.taskFooter}>
                    <View style={styles.taskMeta}>
                      <Ionicons name="time-outline" size={14} color={Colors.charcoal} />
                      <Text style={styles.taskTime}>{task.time_estimate}m</Text>
                    </View>
                    <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Completed Column */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.completed} />
              <Text style={styles.columnTitle}>Completed</Text>
              <View style={styles.columnBadge}>
                <Text style={styles.columnBadgeText}>{tasksByStatus.completed.length}</Text>
              </View>
            </View>
            <ScrollView style={styles.columnContent}>
              {tasksByStatus.completed.map(task => (
                <View key={task.task_id} style={[styles.taskCard, styles.taskCardCompleted]}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{task.title}</Text>
                  </View>
                  <View style={styles.taskFooter}>
                    <View style={styles.taskMeta}>
                      <Ionicons name="time-outline" size={14} color={Colors.charcoal} />
                      <Text style={styles.taskTime}>{task.time_estimate}m</Text>
                    </View>
                    <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* List View */}
      {view === 'list' && (
        <View style={styles.listContainer}>
          {tasks.map(task => (
            <View key={task.task_id} style={styles.listItem}>
              <Ionicons 
                name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} 
                size={24} 
                color={task.status === 'completed' ? Colors.completed : Colors.clay400} 
              />
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, task.status === 'completed' && styles.listItemTitleCompleted]}>
                  {task.title}
                </Text>
                <View style={styles.listItemMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                    <Text style={[styles.priorityBadgeText, { color: getPriorityColor(task.priority) }]}>
                      {task.priority}
                    </Text>
                  </View>
                  <View style={styles.listItemTime}>
                    <Ionicons name="time-outline" size={14} color={Colors.charcoal} />
                    <Text style={styles.listItemTimeText}>{task.time_estimate}m</Text>
                  </View>
                  <Text style={styles.listItemIcon}>{getCategoryIcon(task.category)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.sand,
    borderBottomWidth: 1,
    borderBottomColor: Colors.clay200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.stone,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.clay500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  toggleTextActive: {
    color: Colors.cream,
  },
  kanbanContainer: {
    flex: 1,
    padding: 16,
  },
  column: {
    width: 280,
    marginRight: 16,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.charcoal,
    flex: 1,
  },
  columnBadge: {
    backgroundColor: Colors.clay100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  columnBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  columnContent: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: Colors.sand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.clay200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.charcoal,
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTime: {
    fontSize: 13,
    color: Colors.charcoal,
    opacity: 0.7,
    fontWeight: '500',
  },
  taskIcon: {
    fontSize: 18,
  },
  listContainer: {
    flex: 1,
    padding: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.sand,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.clay200,
    marginBottom: 12,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  listItemTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemTimeText: {
    fontSize: 13,
    color: Colors.charcoal,
    opacity: 0.7,
  },
  listItemIcon: {
    fontSize: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.charcoal,
    opacity: 0.7,
  },
});
