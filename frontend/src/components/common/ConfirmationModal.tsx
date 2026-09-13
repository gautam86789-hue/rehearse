import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LogOut, RotateCcw, AlertTriangle, Info, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export type ConfirmationType = 'danger' | 'warning' | 'primary';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  icon?: 'logout' | 'reset' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon = 'warning',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const isDanger = type === 'danger';
  const accent = isDanger ? colors.error : colors.primary;

  const renderIcon = () => {
    switch (icon) {
      case 'logout':
        return <LogOut size={22} color={accent} strokeWidth={2} />;
      case 'reset':
        return <RotateCcw size={22} color={accent} strokeWidth={2} />;
      case 'info':
        return <Info size={22} color={colors.primary} strokeWidth={2} />;
      case 'warning':
      default:
        return <AlertTriangle size={22} color={accent} strokeWidth={2} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.cardContainer, { backgroundColor: colors.surfaceCard }]}>
              {/* Subtle top close button */}
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.surfaceHighlight }]}
                onPress={onCancel}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Minimal icon capsule */}
              <View
                style={[
                  styles.iconCapsule,
                  {
                    backgroundColor: isDanger ? colors.rubySubtle : colors.primarySubtle,
                    borderColor: isDanger ? colors.error : colors.primaryLight
                  }
                ]}
              >
                {renderIcon()}
              </View>

              {/* Title & Message */}
              <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

              {/* Action buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder }]}
                  onPress={onCancel}
                  disabled={isLoading}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: accent, shadowColor: accent }]}
                  onPress={onConfirm}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>{confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const fontSans = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  default: 'System'
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 31, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          zIndex: 9999
        }
      : {})
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 0
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCapsule: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontFamily: fontSans,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2
  },
  message: {
    fontSize: 13.5,
    fontFamily: fontSans,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 19.5,
    marginBottom: 24,
    paddingHorizontal: 6
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%'
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 13.5,
    fontFamily: fontSans,
    fontWeight: '600'
  },
  confirmButton: {
    flex: 1.1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 0
  },
  confirmText: {
    fontSize: 13.5,
    fontFamily: fontSans,
    fontWeight: '700',
    letterSpacing: 0.2
  }
});
