import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep3({ onNext, onBack }: Step3Props) {
  const [goals, setGoals] = useState({
    job_searching: false,
    managing_finances: false,
    independent_living: false,
    building_social_connections: false,
  });

  const goalsOptions = [
    { key: 'job_searching', label: 'Finding a job', icon: '💼' },
    { key: 'managing_finances', label: 'Managing finances', icon: '💰' },
    { key: 'independent_living', label: 'Independent living', icon: '🏠' },
    { key: 'building_social_connections', label: 'Building social connections', icon: '👥' },
  ];

  const toggleGoal = (key: string) => {
    setGoals({ ...goals, [key]: !goals[key as keyof typeof goals] });
  };

  const handleSubmit = () => {
    onNext({ current_goals: goals });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What are you working on?</Text>
      <Text style={styles.subtitle}>Pick all that apply</Text>

      <View style={styles.section}>
        {goalsOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              goals[option.key as keyof typeof goals] && styles.optionSelected
            ]}
            onPress={() => toggleGoal(option.key)}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <Text style={styles.optionText}>{option.label}</Text>
            <View style={[
              styles.checkbox,
              goals[option.key as keyof typeof goals] && styles.checkboxSelected
            ]}>
              {goals[option.key as keyof typeof goals] && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.charcoal,
    opacity: 0.7,
    marginBottom: 24,
  },
  section: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.stone,
    backgroundColor: Colors.sand + '66',
    gap: 16,
  },
  optionSelected: {
    borderColor: Colors.clay500,
    backgroundColor: Colors.clay50,
  },
  icon: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 16,
    color: Colors.charcoal,
    fontWeight: '500',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.charcoal + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.clay500,
    backgroundColor: Colors.clay500,
  },
  checkmark: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: Colors.sand,
    borderWidth: 2,
    borderColor: Colors.clay300 + '66',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.cream,
  },
});
