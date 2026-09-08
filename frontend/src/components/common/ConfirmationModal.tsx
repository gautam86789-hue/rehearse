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
  const isDanger = type === 'danger';

  const renderIcon = () => {
    switch (icon) {
      case 'logout':
        return <LogOut size={22} color={isDanger ? '#E06D53' : '#C8AA6A'} strokeWidth={2} />;
      case 'reset':
        return <RotateCcw size={22} color={isDanger ? '#E06D53' : '#C8AA6A'} strokeWidth={2} />;
      case 'info':
        return <Info size={22} color="#C8AA6A" strokeWidth={2} />;
      case 'warning':
      default:
        return <AlertTriangle size={22} color={isDanger ? '#E06D53' : '#C8AA6A'} strokeWidth={2} />;
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
            <View style={styles.cardContainer}>
              {/* Subtle top close button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onCancel}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#6B7569" />
              </TouchableOpacity>

              {/* Minimal Frosted Icon Capsule */}
              <View
                style={[
                  styles.iconCapsule,
                  {
                    backgroundColor: isDanger ? 'rgba(200, 75, 49, 0.1)' : 'rgba(200, 170, 106, 0.1)',
                    borderColor: isDanger ? 'rgba(200, 75, 49, 0.22)' : 'rgba(200, 170, 106, 0.22)'
                  }
                ]}
              >
                {renderIcon()}
              </View>

              {/* Title & Message with Modern Sans Typography */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Sleek Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={isLoading}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor: isDanger ? '#B93826' : '#C8AA6A'
                    }
                  ]}
                  onPress={onConfirm}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.confirmText,
                        { color: isDanger ? '#FFFFFF' : '#07100D' }
                      ]}
                    >
                      {confirmText}
                    </Text>
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
  default: 'HankenGrotesk-Regular'
});

const fontSansBold = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  default: 'HankenGrotesk-Bold'
});

const fontSansMedium = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  default: 'HankenGrotesk-Medium'
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 4, 0.88)',
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
    backgroundColor: '#091510',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
    fontFamily: fontSansBold,
    fontWeight: '600',
    color: '#F3EFE5',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2
  },
  message: {
    fontSize: 13.5,
    fontFamily: fontSans,
    fontWeight: '400',
    color: '#9CA39E',
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
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 13.5,
    fontFamily: fontSansMedium,
    fontWeight: '500',
    color: '#A7AEA6'
  },
  confirmButton: {
    flex: 1.1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B93826',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  confirmText: {
    fontSize: 13.5,
    fontFamily: fontSansBold,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});
