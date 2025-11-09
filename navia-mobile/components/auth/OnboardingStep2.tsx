import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep2({ onNext, onBack }: Step2Props) {
  const [neurotypes, setNeurotypes] = useState({
    adhd: false,
    autism: false,
    dyslexia: false,
    anxiety_depression: false,
    other: false,
    prefer_not_to_say: false,
    not_sure: false,
  });

  const [otherText, setOtherText] = useState('');

  const [efChallenges, setEfChallenges] = useState({
    starting_tasks: false,
    time_management: false,
    organization: false,
    decision_making: false,
    emotional_regulation: false,
    social_interaction: false,
    focus: false,
  });

  const neurotypesOptions = [
    { key: 'adhd', label: 'ADHD' },
    { key: 'autism', label: 'Autism' },
    { key: 'dyslexia', label: 'Dyslexia' },
    { key: 'anxiety_depression', label: 'Anxiety/Depression' },
    { key: 'other', label: 'Other' },
    { key: 'prefer_not_to_say', label: 'Prefer not to say' },
    { key: 'not_sure', label: "Not sure / I'm exploring" },
  ];

  const efOptions = [
    { key: 'starting_tasks', label: 'Starting tasks / Getting started' },
    { key: 'time_management', label: 'Time management / Deadlines' },
    { key: 'organization', label: 'Organization / Remembering details' },
    { key: 'decision_making', label: 'Decision-making / Analysis paralysis' },
    { key: 'emotional_regulation', label: 'Emotional regulation / Stress' },
    { key: 'social_interaction', label: 'Social interaction' },
    { key: 'focus', label: 'Focus / Concentration' },
  ];

  const toggleNeurotype = (key: string) => {
    setNeurotypes({ ...neurotypes, [key]: !neurotypes[key as keyof typeof neurotypes] });
  };

  const toggleEfChallenge = (key: string) => {
    const selectedCount = Object.values(efChallenges).filter(Boolean).length;
    const isCurrentlySelected = efChallenges[key as keyof typeof efChallenges];
    
    if (isCurrentlySelected || selectedCount < 3) {
      setEfChallenges({ ...efChallenges, [key]: !efChallenges[key as keyof typeof efChallenges] });
    }
  };

  const handleSubmit = () => {
    onNext({ 
      neurotypes,
      other_neurotype: otherText,
      ef_challenges: efChallenges 
    });
  };

  const selectedEfCount = Object.values(efChallenges).filter(Boolean).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>How do you describe yourself?</Text>
      <Text style={styles.subtitle}>Pick all that apply</Text>

      <View style={styles.section}>
        {neurotypesOptions.map((option) => (
          <View key={option.key}>
            <TouchableOpacity
              style={[
                styles.option,
                neurotypes[option.key as keyof typeof neurotypes] && styles.optionSelected
              ]}
              onPress={() => toggleNeurotype(option.key)}
            >
              <View style={[
                styles.checkbox,
                neurotypes[option.key as keyof typeof neurotypes] && styles.checkboxSelected
              ]}>
                {neurotypes[option.key as keyof typeof neurotypes] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
            
            {option.key === 'other' && neurotypes.other && (
              <TextInput
                style={styles.input}
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Please specify..."
                placeholderTextColor={Colors.charcoal + '60'}
              />
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>What's hardest for you?</Text>
        <Text style={styles.subtitle}>
          Pick up to 3 {selectedEfCount > 0 && `(${selectedEfCount}/3 selected)`}
        </Text>

        {efOptions.map((option) => {
          const isSelected = efChallenges[option.key as keyof typeof efChallenges];
          const isDisabled = !isSelected && selectedEfCount >= 3;
          
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isDisabled && styles.optionDisabled
              ]}
              onPress={() => toggleEfChallenge(option.key)}
              disabled={isDisabled}
            >
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
              ]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 32,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.stone,
    backgroundColor: Colors.sand + '66',
    gap: 12,
  },
  optionSelected: {
    borderColor: Colors.clay500,
    backgroundColor: Colors.clay50,
  },
  optionDisabled: {
    opacity: 0.5,
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
  optionText: {
    fontSize: 16,
    color: Colors.charcoal,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    marginTop: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.clay300,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    fontSize: 16,
    color: Colors.charcoal,
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
