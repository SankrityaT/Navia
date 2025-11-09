import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ChatMessage } from '../../types';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Navia, your AI executive function coach. I'm here to help you with career planning, finances, daily tasks, and more. What's on your mind?",
      persona: 'daily_tasks',
      personaIcon: '✅',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getPersonaIcon = (persona?: string) => {
    switch (persona) {
      case 'career': return '💼';
      case 'finance': return '💰';
      case 'daily_tasks': return '✅';
      default: return '🧭';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand you're working on that. Let me help you break it down into smaller, manageable steps.",
        persona: 'career',
        personaIcon: '💼',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={24} color={Colors.cream} />
        </View>
        <View>
          <Text style={styles.title}>AI Coach</Text>
          <Text style={styles.subtitle}>Ask me anything</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.personaIcon}>
                <Text style={styles.personaEmoji}>{getPersonaIcon(message.persona)}</Text>
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              message.role === 'user' ? styles.userBubbleContent : styles.assistantBubbleContent
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
            </View>
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <View style={styles.personaIcon}>
              <Text style={styles.personaEmoji}>🧭</Text>
            </View>
            <View style={styles.loadingBubble}>
              <View style={styles.loadingDots}>
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Navia for help..."
          placeholderTextColor={Colors.charcoal + '60'}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={Colors.cream} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  personaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.clay100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  personaEmoji: {
    fontSize: 16,
  },
  bubbleContent: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userBubbleContent: {
    backgroundColor: Colors.clay500,
  },
  assistantBubbleContent: {
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.clay200,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.cream,
  },
  assistantMessageText: {
    color: Colors.charcoal,
  },
  loadingBubble: {
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.clay200,
    borderRadius: 16,
    padding: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.clay400,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.sand,
    borderTopWidth: 1,
    borderTopColor: Colors.clay200,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.charcoal,
    borderWidth: 2,
    borderColor: Colors.clay200,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.clay500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.clay300,
    opacity: 0.5,
  },
});
