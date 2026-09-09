import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LIVEKIT_CONFIG, updateLiveKitConfig } from '../../services/livekitConfig';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

interface LiveKitSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const LiveKitSetupModal: React.FC<LiveKitSetupModalProps> = ({
  visible,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState(LIVEKIT_CONFIG.serverUrl);
  const [key, setKey] = useState(LIVEKIT_CONFIG.apiKey);
  const [secret, setSecret] = useState(LIVEKIT_CONFIG.apiSecret);

  const handleOpenLiveKitCloud = () => {
    Linking.openURL('https://cloud.livekit.io').catch(() => {
      Alert.alert('Open Browser', 'Please visit https://cloud.livekit.io in your browser.');
    });
  };

  const handleSave = () => {
    if (url.trim() && !url.trim().startsWith('wss://') && !url.trim().startsWith('ws://')) {
      Alert.alert('Invalid WebSocket URL', 'LiveKit server URL must start with wss:// (e.g. wss://myproject.livekit.cloud)');
      return;
    }

    updateLiveKitConfig(url, key, secret);
    Alert.alert('LiveKit Config Saved', 'Your LiveKit Cloud credentials have been saved for this session.');
    onConfigSaved();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.liveKitBadge}>LiveKit WebRTC</Text>
              <Text style={styles.title}>Cloud Credentials</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.helperText}>
              LiveKit powers real-time HD video and audio for Dr. Ankur Deshwali's Telemedicine consultations.
            </Text>

            {/* Quick 3-Step Guide */}
            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>Quick Setup (Takes 2 Minutes):</Text>
              <Text style={styles.stepItem}>1. Sign up for free at <Text style={styles.stepLink}>cloud.livekit.io</Text></Text>
              <Text style={styles.stepItem}>2. Create a project named <Text style={styles.stepBold}>Sevasadan</Text></Text>
              <Text style={styles.stepItem}>3. Go to <Text style={styles.stepBold}>Settings → Keys</Text> and paste below:</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenLiveKitCloud}
                style={styles.openCloudBtn}
              >
                <Icon name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.openCloudBtnText}>Open LiveKit Cloud in Browser ↗</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>LiveKit Server WebSocket URL</Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="wss://your-project.livekit.cloud"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>API Key (Optional for Client)</Text>
              <TextInput
                value={key}
                onChangeText={setKey}
                placeholder="APIxxxxxxxxxxxx"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>API Secret / Room Token</Text>
              <TextInput
                value={secret}
                onChangeText={setSecret}
                placeholder="secret_xxxxxxxx or JWT Token"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              size="sm"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Save & Connect"
              variant="primary"
              size="sm"
              icon="check"
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 37, 69, 0.65)',
    justifyContent: 'center',
    padding: spacing.screenPaddingHorizontal,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveKitBadge: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  stepsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 6,
  },
  stepItem: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  stepBold: {
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  stepLink: {
    fontWeight: typography.weights.bold,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  openCloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 6,
  },
  openCloudBtnText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
});
