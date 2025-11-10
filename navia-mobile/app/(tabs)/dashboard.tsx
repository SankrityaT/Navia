import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';
import { supabase } from '../../services/supabase';

type FilterType = 'all' | 'career' | 'finance' | 'daily_life';
type SortType = 'priority' | 'time' | 'category';

interface Goal {
  name: string;
  completed: number;
  total: number;
  color: string;
}

interface QuickWin {
  task_id: string;
  title: string;
  time_estimate: number;
  status: 'not_started' | 'in_progress' | 'completed';
  category: string;
  priority: string;
}

export default function DashboardScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [energyLevel, setEnergyLevel] = useState(70);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('priority');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [animValues] = useState(
    [...Array(5)].map(() => new Animated.Value(0))
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const mockQuickWins: QuickWin[] = [
    {
      task_id: 'quick_1',
      title: 'Check LinkedIn messages',
      time_estimate: 5,
      status: 'not_started',
      category: 'career',
      priority: 'low'
    },
    {
      task_id: 'quick_2',
      title: 'Review calendar for tomorrow',
      time_estimate: 3,
      status: 'not_started',
      category: 'daily_life',
      priority: 'low'
    },
  ];

  const goals: Goal[] = [
    { name: 'Job Search', completed: 6, total: 40, color: Colors.clay500 },
    { name: 'Financial Independence', completed: 3, total: 15, color: Colors.sage500 },
  ];

  // AI Integration Point: Generate motivational messages
  useEffect(() => {
    generateAIMotivationalMessage();
  }, [tasks]);

  // AI Integration Point: AI-powered motivational message generation
  const generateAIMotivationalMessage = async () => {
    // TODO: Call AI API to generate personalized motivational message
    const messages = [
      "You're making great progress. Remember, small steps lead to big achievements. 💚",
      "Every task completed is a step toward your goals. Keep up the momentum! 🌟",
      "Your dedication is inspiring. Focus on one thing at a time, and you'll succeed. 🎯",
      "Progress over perfection. You're doing amazing! 💪",
      "Remember why you started. You've got this! ✨"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  };

  // Handle task completion toggle with optimistic UI update
  const handleToggleTask = async (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.task_id === taskId
          ? { ...task, status: task.status === 'completed' ? 'not_started' : 'completed' }
          : task
      )
    );

    // TODO: Call API to update task status
    try {
      // await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', ... });
    } catch (error) {
      // Revert on error
      console.error('Failed to update task:', error);
    }
  };

  // Handle quick win completion
  const handleToggleQuickWin = async (taskId: string) => {
    setQuickWins(prevTasks =>
      prevTasks.map(task =>
        task.task_id === taskId
          ? { ...task, status: task.status === 'completed' ? 'not_started' : 'completed' }
          : task
      )
    );

    // TODO: Call API to update task status
    try {
      // await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', ... });
    } catch (error) {
      console.error('Failed to update quick win:', error);
    }
  };

  // Filter tasks based on category
  const getFilteredTasks = () => {
    let filtered = tasks;
    if (filter !== 'all') {
      filtered = tasks.filter(task => {
        if (filter === 'daily_life') return task.category === 'daily_life';
        return task.category === filter;
      });
    }
    return filtered;
  };

  // Sort tasks
  const getSortedTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sort === 'time') {
        return (a.time_estimate || 0) - (b.time_estimate || 0);
      } else {
        return a.category.localeCompare(b.category);
      }
    });
  };

  const fetchDashboardData = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID, skipping fetch');
        setLoading(false);
        return;
      }

      // Fetch directly from Supabase (no backend needed!)
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData && !profileError) {
        setProfile(profileData);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (tasksData && !tasksError) {
        setTasks(tasksData);
        // Set quick wins from tasks with time_estimate <= 10
        setQuickWins(tasksData.filter(task => task.time_estimate <= 10).slice(0, 3));
      } else {
        // Use mock data as fallback
        const mockTasks = [
          {
            user_id: user.id,
            task_id: 'task_1',
            title: 'Update resume with recent projects',
            status: 'in_progress' as const,
            priority: 'high' as const,
            time_estimate: 45,
            category: 'career' as const,
            created_by: 'system',
            created_at: new Date().toISOString(),
          },
          {
            user_id: user.id,
            task_id: 'task_2',
            title: 'Research 5 companies in your field',
            status: 'not_started' as const,
            priority: 'medium' as const,
            time_estimate: 30,
            category: 'career' as const,
            created_by: 'system',
            created_at: new Date().toISOString(),
          },
        ];
        setTasks(mockTasks);
        setQuickWins(mockQuickWins);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data as fallback
      const mockTasks = [
        {
          user_id: user?.id || 'user_123',
          task_id: 'task_1',
          title: 'Update resume with recent projects',
          status: 'in_progress' as const,
          priority: 'high' as const,
          time_estimate: 45,
          category: 'career' as const,
          created_by: 'system',
          created_at: new Date().toISOString(),
        },
        {
          user_id: user?.id || 'user_123',
          task_id: 'task_2',
          title: 'Research 5 companies in your field',
          status: 'not_started' as const,
          priority: 'medium' as const,
          time_estimate: 30,
          category: 'career' as const,
          created_by: 'system',
          created_at: new Date().toISOString(),
        },
      ];
      setTasks(mockTasks);
      setQuickWins(mockQuickWins);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Animate task items on mount
  useEffect(() => {
    const filteredAndSortedTasks = getSortedTasks(getFilteredTasks());
    const todayTasks = filteredAndSortedTasks.filter((t) => t.status !== 'completed').slice(0, 5);
    
    todayTasks.forEach((_, index) => {
      Animated.timing(animValues[index], {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [tasks, filter, sort]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredAndSortedTasks = getSortedTasks(getFilteredTasks());
  const todayTasks = filteredAndSortedTasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.clay500} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.clay500]} />
      }
    >
      <LinearGradient
        colors={[Colors.cream, Colors.sand, Colors.clay100]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={24} color={Colors.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting()}, {user?.firstName || 'there'}</Text>
              <Text style={styles.subtitle}>Let's make today productive</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.charcoal} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Focus */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="flag" size={24} color={Colors.cream} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Today's Focus</Text>
              <Text style={styles.cardSubtitle}>AI-prioritized tasks</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{todayTasks.length} tasks</Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[
                styles.filterButton,
                filter === 'all' && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('career')}
              style={[
                styles.filterButton,
                filter === 'career' && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'career' && styles.filterButtonTextActive
              ]}>💼 Career</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('finance')}
              style={[
                styles.filterButton,
                filter === 'finance' && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'finance' && styles.filterButtonTextActive
              ]}>💰 Finance</Text>
            </TouchableOpacity>
          </View>

          {/* Sort Buttons */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              onPress={() => setSort('priority')}
              style={[
                styles.sortButton,
                sort === 'priority' && styles.sortButtonActive
              ]}
            >
              <Text style={[
                styles.sortButtonText,
                sort === 'priority' && styles.sortButtonTextActive
              ]}>Priority</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSort('time')}
              style={[
                styles.sortButton,
                sort === 'time' && styles.sortButtonActive
              ]}
            >
              <Text style={[
                styles.sortButtonText,
                sort === 'time' && styles.sortButtonTextActive
              ]}>Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSort('category')}
              style={[
                styles.sortButton,
                sort === 'category' && styles.sortButtonActive
              ]}
            >
              <Text style={[
                styles.sortButtonText,
                sort === 'category' && styles.sortButtonTextActive
              ]}>Category</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskList}>
            {todayTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.sage500} />
                <Text style={styles.emptyStateTitle}>All caught up! 🎉</Text>
                <Text style={styles.emptyStateText}>You've completed all your tasks for today.</Text>
                <TouchableOpacity style={styles.askAIButton}>
                  <Ionicons name="sparkles" size={16} color={Colors.cream} />
                  <Text style={styles.askAIText}>Ask AI for suggestions</Text>
                </TouchableOpacity>
              </View>
            ) : (
              todayTasks.map((task: Task, index) => (
                <Animated.View
                  key={task.task_id}
                  style={[
                    styles.taskItem,
                    {
                      opacity: animValues[index],
                      transform: [
                        {
                          translateY: animValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleToggleTask(task.task_id)}
                    style={styles.taskCheckbox}
                  >
                    <Ionicons
                      name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={task.status === 'completed' ? Colors.sage600 : Colors.clay400}
                    />
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <Text style={[
                      styles.taskTitle,
                      task.status === 'completed' && styles.taskTitleCompleted
                    ]}>{task.title}</Text>
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.taskCategory,
                        task.category === 'career' && styles.taskCategoryCareer,
                        task.category === 'finance' && styles.taskCategoryFinance,
                      ]}>
                        <Text style={styles.taskCategoryText}>
                          {task.category === 'career' ? '💼' : task.category === 'finance' ? '💰' : '✅'} {task.category}
                        </Text>
                      </View>
                      <View style={styles.taskTimeContainer}>
                        <Ionicons name="time-outline" size={12} color={Colors.charcoal} />
                        <Text style={styles.taskTime}>{task.time_estimate}m</Text>
                      </View>
                      <View style={[
                        styles.taskPriority,
                        task.priority === 'high' && styles.taskPriorityHigh,
                        task.priority === 'medium' && styles.taskPriorityMedium,
                        task.priority === 'low' && styles.taskPriorityLow,
                      ]}>
                        <Text style={styles.taskPriorityText}>{task.priority}</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </View>

        {/* Quick Wins */}
        <View style={[styles.card, styles.quickWinsCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, styles.quickWinsIcon]}>
              <Ionicons name="flash" size={24} color={Colors.cream} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Quick Wins</Text>
              <Text style={styles.cardSubtitle}>Under 10 minutes</Text>
            </View>
          </View>

          <View style={styles.quickWinsList}>
            {quickWins.slice(0, 3).map((win) => (
              <TouchableOpacity
                key={win.task_id}
                style={styles.quickWinItem}
                onPress={() => handleToggleQuickWin(win.task_id)}
              >
                <TouchableOpacity
                  onPress={() => handleToggleQuickWin(win.task_id)}
                  style={styles.quickWinCheckbox}
                >
                  <Ionicons
                    name={win.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={win.status === 'completed' ? Colors.sage600 : Colors.sage500}
                  />
                </TouchableOpacity>
                <View style={styles.quickWinContent}>
                  <Text style={[
                    styles.quickWinText,
                    win.status === 'completed' && styles.quickWinTextCompleted
                  ]}>{win.title}</Text>
                  <View style={styles.quickWinTimeContainer}>
                    <Ionicons name="time-outline" size={12} color={Colors.charcoal} />
                    <Text style={styles.quickWinTime}>{win.time_estimate}m</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, styles.progressIcon]}>
              <Ionicons name="trending-up" size={24} color={Colors.cream} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Goal Progress</Text>
              <Text style={styles.cardSubtitle}>Track your journey</Text>
            </View>
          </View>

          <View style={styles.goalsList}>
            {goals.map((goal, index) => {
              const percentage = Math.round((goal.completed / goal.total) * 100);
              // AI Integration Point: Predict completion date
              const daysToComplete = Math.ceil((goal.total - goal.completed) / (goal.completed / 7 || 1));
              
              return (
                <View key={index} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalStats}>{goal.completed}/{goal.total}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: goal.color
                      }
                    ]} />
                  </View>
                  <View style={styles.goalFooter}>
                    <Text style={styles.progressText}>{percentage}% complete</Text>
                    {/* AI Prediction */}
                    <Text style={styles.aiPrediction}>📊 Est. {daysToComplete} days</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, styles.statsCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="flash" size={24} color={Colors.cream} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Today's Stats</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedToday}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayTasks.length}</Text>
              <Text style={styles.statLabel}>Tasks Remaining</Text>
            </View>
          </View>
        </View>

        {/* AI-Generated Motivational Card */}
        <View style={[styles.card, styles.aiCard]}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color={Colors.cream} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Insight</Text>
              <Text style={styles.aiMessage}>
                {motivationalMessage || "You're making great progress. Remember, small steps lead to big achievements. 💚"}
              </Text>
            </View>
          </View>
        </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.clay200,
  },
  headerContent: {
    gap: 16,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.6,
    fontWeight: '500',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: Colors.cream + 'CC',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.clay200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickWinsCard: {
    backgroundColor: Colors.sage400 + '33',
    borderColor: Colors.sage400 + '4D',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  quickWinsIcon: {
    backgroundColor: Colors.sage500,
  },
  progressIcon: {
    backgroundColor: Colors.sage500,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.6,
  },
  badge: {
    backgroundColor: Colors.sage100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.sage300,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.sage700,
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.cream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.clay200,
    gap: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCategory: {
    backgroundColor: Colors.clay100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  taskTime: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.6,
  },
  quickWinsList: {
    gap: 12,
  },
  quickWinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.sage300,
    gap: 12,
  },
  quickWinText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  quickWinTime: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.6,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    padding: 16,
    backgroundColor: Colors.cream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.clay200,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  goalStats: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.clay100,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.clay500,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.6,
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
  emptyText: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.6,
    textAlign: 'center',
    padding: 24,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.cream + '80',
  },
  // Filter styles
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.sand,
  },
  filterButtonActive: {
    backgroundColor: Colors.clay500,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    opacity: 0.7,
  },
  filterButtonTextActive: {
    color: Colors.cream,
  },
  // Sort styles
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.sand,
  },
  sortButtonActive: {
    backgroundColor: Colors.clay500,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    opacity: 0.7,
  },
  sortButtonTextActive: {
    color: Colors.cream,
  },
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  askAIButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.clay500,
    borderRadius: 12,
  },
  askAIText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.cream,
  },
  // Enhanced task styles
  taskCheckbox: {
    marginTop: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskCategoryCareer: {
    backgroundColor: Colors.clay100,
  },
  taskCategoryFinance: {
    backgroundColor: Colors.sage100,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskPriority: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taskPriorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  taskPriorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  taskPriorityLow: {
    backgroundColor: '#DBEAFE',
  },
  taskPriorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  // Quick wins enhanced styles
  quickWinCheckbox: {
    marginTop: 2,
  },
  quickWinContent: {
    flex: 1,
  },
  quickWinTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  quickWinTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  // Goal progress enhanced styles
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  aiPrediction: {
    fontSize: 12,
    color: Colors.sage600,
    fontWeight: '600',
  },
  // Stats card styles
  statsCard: {
    backgroundColor: Colors.clay200 + '33',
    borderColor: Colors.clay300 + '66',
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    backgroundColor: Colors.cream + 'CC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.clay200,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.7,
  },
  // AI card styles
  aiCard: {
    backgroundColor: Colors.cream,
    borderColor: Colors.charcoal,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  aiMessage: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.7,
    lineHeight: 20,
  },
});
