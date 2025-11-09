import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Task } from '../../types';
import { supabase } from '../../services/supabase';

export default function DashboardScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [energyLevel, setEnergyLevel] = useState(70);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const quickWins = [
    { id: '1', title: 'Check LinkedIn messages', time: 5 },
    { id: '2', title: 'Review calendar for tomorrow', time: 3 },
  ];

  const goals = [
    { name: 'Job Search', completed: 6, total: 40 },
    { name: 'Financial Independence', completed: 3, total: 15 },
  ];

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
      } else {
        // Use mock data as fallback
        setTasks([
          {
            user_id: user.id,
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
            user_id: user.id,
            task_id: 'task_2',
            title: 'Research 5 companies in your field',
            status: 'not_started',
            priority: 'medium',
            time_estimate: 30,
            category: 'career',
            created_by: 'system',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data as fallback
      setTasks([
        {
          user_id: user?.id || 'user_123',
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
          user_id: user?.id || 'user_123',
          task_id: 'task_2',
          title: 'Research 5 companies in your field',
          status: 'not_started',
          priority: 'medium',
          time_estimate: 30,
          category: 'career',
          created_by: 'system',
          created_at: new Date().toISOString(),
        },
      ]);
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
              <Ionicons name="target" size={24} color={Colors.cream} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Today's Focus</Text>
              <Text style={styles.cardSubtitle}>Your priority tasks</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tasks.length} tasks</Text>
            </View>
          </View>

          <View style={styles.taskList}>
            {tasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks yet. Pull down to refresh!</Text>
            ) : (
              tasks.map((task: Task) => (
              <View key={task.task_id} style={styles.taskItem}>
                <Ionicons 
                  name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={task.status === 'completed' ? Colors.sage600 : Colors.clay400} 
                />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.taskCategory}>
                      <Text style={styles.taskCategoryText}>{task.category}</Text>
                    </View>
                    <Text style={styles.taskTime}>{task.time_estimate}m</Text>
                  </View>
                </View>
              </View>
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
            {quickWins.map((win) => (
              <View key={win.id} style={styles.quickWinItem}>
                <Ionicons name="ellipse-outline" size={16} color={Colors.sage500} />
                <Text style={styles.quickWinText}>{win.title}</Text>
                <Text style={styles.quickWinTime}>{win.time}m</Text>
              </View>
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
              return (
                <View key={index} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalStats}>{goal.completed}/{goal.total}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{percentage}% complete</Text>
                </View>
              );
            })}
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
});
