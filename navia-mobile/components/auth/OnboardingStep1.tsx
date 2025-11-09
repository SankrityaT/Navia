import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Step1Props {
  onNext: () => void;
}

export default function OnboardingStep1({ onNext }: Step1Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚀</Text>
      
      <Text style={styles.title}>Welcome to Navia</Text>
      
      <View style={styles.textContainer}>
        <Text style={styles.text}>You just graduated. That's huge.</Text>
        <Text style={styles.text}>Now comes the hard part: figuring out what's next.</Text>
        <Text style={[styles.text, styles.textSpaced]}>
          We're here to help. Navia is your AI coach{'\n'}
          for finding a job, managing money, and staying sane.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>
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
  textContainer: {
    marginBottom: 48,
    gap: 16,
  },
  text: {
    fontSize: 18,
    color: Colors.charcoal,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 26,
  },
  textSpaced: {
    marginTop: 16,
  },
  button: {
    backgroundColor: Colors.clay500,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.cream,
    fontSize: 18,
    fontWeight: '600',
  },
});
