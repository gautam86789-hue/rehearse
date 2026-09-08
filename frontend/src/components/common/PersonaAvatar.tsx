import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, HeartCrack, Scale, SmilePlus, Eye, User } from 'lucide-react-native';
import { ArchetypeId } from '../../types';
import { archetypeColors } from '../../theme/colors';

interface PersonaAvatarProps {
  archetypeId: ArchetypeId | string;
  size?: number;
  showBadge?: boolean;
}

export const PersonaAvatar: React.FC<PersonaAvatarProps> = ({
  archetypeId,
  size = 44,
  showBadge = false
}) => {
  const color = (archetypeColors as any)[archetypeId] || '#3B82F6';

  const renderIcon = (iconSize: number) => {
    switch (archetypeId) {
      case 'defensive_boss':
        return <ShieldAlert size={iconSize} color="#FFFFFF" />;
      case 'guilt_tripper':
        return <HeartCrack size={iconSize} color="#FFFFFF" />;
      case 'hard_negotiator':
        return <Scale size={iconSize} color="#FFFFFF" />;
      case 'passive_aggressive_peer':
        return <SmilePlus size={iconSize} color="#FFFFFF" />;
      case 'micromanager':
        return <Eye size={iconSize} color="#FFFFFF" />;
      default:
        return <User size={iconSize} color="#FFFFFF" />;
    }
  };

  const getArchetypeShortLabel = () => {
    switch (archetypeId) {
      case 'defensive_boss':
        return 'Defensive Boss';
      case 'guilt_tripper':
        return 'Guilt-Tripper';
      case 'hard_negotiator':
        return 'Hard Negotiator';
      case 'passive_aggressive_peer':
        return 'Passive-Aggressive';
      case 'micromanager':
        return 'Micromanager';
      default:
        return 'Counterpart';
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }
        ]}
      >
        {renderIcon(size * 0.5)}
      </View>
      {showBadge && (
        <View style={[styles.badgeTag, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{getArchetypeShortLabel()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  badgeTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  }
});
