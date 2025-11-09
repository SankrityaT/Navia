import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

interface Step4Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep4({ onNext, onBack }: Step4Props) {
  const router = useRouter();

  const handleComplete = async () => {
    await onNext({});
    router.replace('/(tabs)/dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      
      <Text style={styles.title}>You're all set!</Text>
      
      <Text style={styles.text}>
        Navia is ready to help you navigate this next chapter.
      </Text>
      
      <Text style={styles.text}>
        Let's start by breaking down your goals into manageable steps.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleComplete}>
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: Colors.charcoal,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 48,
    width: '100%',
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
    flex: 2,
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
