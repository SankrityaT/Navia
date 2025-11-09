import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import OnboardingStep1 from '../../components/auth/OnboardingStep1';
import OnboardingStep2 from '../../components/auth/OnboardingStep2';
import OnboardingStep3 from '../../components/auth/OnboardingStep3';
import OnboardingStep4 from '../../components/auth/OnboardingStep4';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';

export default function OnboardingScreen() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});

  const handleStep1 = () => {
    setStep(2);
  };

  const handleStep2 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(3);
  };

  const handleStep3 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(4);
  };

  const handleStep4 = async (data: any) => {
    const finalData = { ...onboardingData, ...data };
    
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      // Save directly to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          name: user.firstName || 'User',
          email: user.primaryEmailAddress?.emailAddress,
          neurotypes: finalData.neurotypes || [],
          ef_challenges: finalData.efChallenges || [],
          current_goals: finalData.goals || [],
          onboarded: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to save onboarding data:', error);
      } else {
        console.log('Onboarding data saved successfully!');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.sand]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === step && styles.progressDotActive,
                  i < step && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Step content */}
        <View style={styles.content}>
          {step === 1 && <OnboardingStep1 onNext={handleStep1} />}
          {step === 2 && <OnboardingStep2 onNext={handleStep2} onBack={() => setStep(1)} />}
          {step === 3 && <OnboardingStep3 onNext={handleStep3} onBack={() => setStep(2)} />}
          {step === 4 && <OnboardingStep4 onNext={handleStep4} onBack={() => setStep(3)} />}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.stone,
  },
  progressDotActive: {
    width: 48,
    backgroundColor: Colors.clay500,
  },
  progressDotCompleted: {
    backgroundColor: Colors.sage600,
  },
  content: {
    flex: 1,
  },
});
