import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // If already signed in, redirect to dashboard
    if (isSignedIn) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isSignedIn]);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // Only set active if there's a session to activate
      if (completeSignIn.createdSessionId) {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to sign in';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In to Navia</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.sand,
    borderWidth: 2,
    borderColor: Colors.clay200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.charcoal,
  },
  button: {
    backgroundColor: Colors.clay500,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.cream,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: Colors.clay600,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});
