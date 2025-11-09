import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function PeersScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock peer data
  const mockPeers = [
    {
      id: '1',
      name: 'Alex Chen',
      months_post_grad: 6,
      neurotype: ['ADHD', 'Anxiety'],
      bio: "Recent CS grad navigating the job search. Love hiking and coffee chats!",
      current_struggles: ['job_searching', 'time_management'],
      offers: ['resume_review', 'interview_prep'],
      seeking: ['accountability', 'career_advice'],
      interests: ['hiking', 'coffee', 'gaming'],
      match_score: 92,
    },
    {
      id: '2',
      name: 'Jordan Lee',
      months_post_grad: 8,
      neurotype: ['Autism', 'ADHD'],
      bio: "Finding my way in the design world. Always happy to chat about creative projects!",
      current_struggles: ['managing_finances', 'social_interaction'],
      offers: ['design_feedback', 'budgeting_tips'],
      seeking: ['social_support', 'networking_help'],
      interests: ['art', 'music', 'reading'],
      match_score: 88,
    },
  ];

  const currentPeer = mockPeers[currentIndex];

  const handlePass = () => {
    if (currentIndex < mockPeers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleConnect = () => {
    // Handle connection
    if (currentIndex < mockPeers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentPeer) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Peer Network</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>You've seen all matches!</Text>
          <Text style={styles.emptyText}>Check back later for more connections</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Peer Network</Text>
        <Text style={styles.subtitle}>Find your accountability partner</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Match Score */}
          <View style={styles.matchBadge}>
            <Ionicons name="heart" size={16} color={Colors.clay500} />
            <Text style={styles.matchText}>{currentPeer.match_score}% Match</Text>
          </View>

          {/* Name & Badge */}
          <Text style={styles.name}>{currentPeer.name}</Text>
          <View style={styles.gradBadge}>
            <Ionicons name="school" size={16} color={Colors.clay700} />
            <Text style={styles.gradText}>{currentPeer.months_post_grad} months post-grad</Text>
          </View>

          {/* Safe Space */}
          {currentPeer.neurotype.length > 0 && (
            <View style={styles.safeSpace}>
              <View style={styles.safeSpaceHeader}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.sage600} />
                <Text style={styles.safeSpaceTitle}>Safe Space</Text>
              </View>
              <View style={styles.tags}>
                {currentPeer.neurotype.map((type, index) => (
                  <View key={index} style={styles.neurotypeBadge}>
                    <Text style={styles.neurotypeBadgeText}>{type}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.safeSpaceNote}>No masking required</Text>
            </View>
          )}

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.bio}>"{currentPeer.bio}"</Text>
          </View>

          {/* We Both */}
          {currentPeer.current_struggles.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={20} color={Colors.clay600} />
                <Text style={styles.sectionTitle}>We Both</Text>
              </View>
              <View style={styles.tags}>
                {currentPeer.current_struggles.map((struggle, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{struggle.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* They Offer */}
          {currentPeer.offers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color={Colors.sage600} />
                <Text style={styles.sectionTitle}>{currentPeer.name} Offers</Text>
              </View>
              <View style={styles.tags}>
                {currentPeer.offers.map((offer, index) => (
                  <View key={index} style={styles.offerTag}>
                    <Text style={styles.offerTagText}>{offer.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* They Need */}
          {currentPeer.seeking.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color={Colors.clay500} />
                <Text style={styles.sectionTitle}>{currentPeer.name} Needs</Text>
              </View>
              <View style={styles.tags}>
                {currentPeer.seeking.map((need, index) => (
                  <View key={index} style={styles.needTag}>
                    <Text style={styles.needTagText}>{need.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Interests */}
          {currentPeer.interests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.tags}>
                {currentPeer.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.passButton} onPress={handlePass}>
            <Ionicons name="close" size={28} color={Colors.charcoal} />
            <Text style={styles.passButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Ionicons name="checkmark" size={28} color={Colors.cream} />
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
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
  },
  subtitle: {
    fontSize: 14,
    color: Colors.charcoal,
    opacity: 0.6,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: Colors.sand,
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
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.clay100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.clay700,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  gradBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.clay200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  gradText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.clay800,
  },
  safeSpace: {
    backgroundColor: Colors.sage400 + '33',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.sage400 + '4D',
    marginBottom: 20,
  },
  safeSpaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  safeSpaceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.sage600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  safeSpaceNote: {
    fontSize: 12,
    color: Colors.charcoal,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 16,
    color: Colors.charcoal,
    opacity: 0.8,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  neurotypeBadge: {
    backgroundColor: Colors.sage500 + '4D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.sage500 + '66',
  },
  neurotypeBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.moss600,
  },
  tag: {
    backgroundColor: Colors.clay100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.clay300,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.clay800,
    textTransform: 'capitalize',
  },
  offerTag: {
    backgroundColor: Colors.sage400 + '4D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.sage400 + '66',
  },
  offerTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.moss600,
    textTransform: 'capitalize',
  },
  needTag: {
    backgroundColor: Colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.clay300,
  },
  needTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.clay700,
    textTransform: 'capitalize',
  },
  interestTag: {
    backgroundColor: Colors.stone,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.clay200,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.charcoal,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.stone,
    borderWidth: 2,
    borderColor: Colors.clay300,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  connectButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.clay500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.cream,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.charcoal,
    opacity: 0.6,
    textAlign: 'center',
  },
});
