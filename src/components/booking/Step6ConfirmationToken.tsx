import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Appointment } from '../../types';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface Step6Props {
  appointment: Appointment;
  onJoinVideo?: () => void;
  onFinish: () => void;
}

export const Step6ConfirmationToken: React.FC<Step6Props> = ({
  appointment,
  onJoinVideo,
  onFinish,
}) => {
  const isOnline = appointment.consultationMode === 'ONLINE_VIDEO';

  const handleShare = () => {
    Share.share({
      message: `SEVASADAN Super Specialty OPD Token Pass\nToken: ${appointment.tokenNumber}\nDoctor: ${appointment.doctorName}\nClinic: ${appointment.clinicName}\nDate/Time: ${appointment.date} at ${appointment.timeSlot}\nPatient: ${appointment.patientName}`,
    }).catch(() => {});
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Reminder Saved',
      `Reminder set for ${appointment.date} at ${appointment.timeSlot} with 30-min advance alert.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Success Banner */}
      <View style={styles.successBadge}>
        <View style={styles.successIconBox}>
          <Icon name="check" size={16} color={colors.white} />
        </View>
        <Text style={styles.successTitle}>
          {isOnline ? 'Tele-OPD Confirmed!' : 'Token Allotted Successfully!'}
        </Text>
        <Text style={styles.successSubtitle}>
          Sent to registered phone +91 {appointment.patientPhone}
        </Text>
      </View>

      {/* Main Digital Token Pass (Card with Ticket Look) */}
      <View style={styles.passCard}>
        {/* Pass Header */}
        <View style={styles.passTop}>
          <View>
            <Text style={styles.passBrand}>SEVASADAN SUPER SPECIALTY OPD</Text>
            <Text style={styles.passBranch}>{appointment.clinicName}</Text>
          </View>
          <Badge
            label={isOnline ? 'Video OPD' : 'In-Clinic Pass'}
            variant={isOnline ? 'accent' : 'success'}
            size="sm"
          />
        </View>

        {/* Token Big Callout */}
        <View style={styles.tokenSection}>
          <Text style={styles.tokenLabel}>
            {isOnline ? 'TELE-OPD ACCESS CODE' : 'OFFICIAL OPD TOKEN NUMBER'}
          </Text>
          <Text style={styles.tokenNumber}>{appointment.tokenNumber}</Text>
          <View style={styles.queueMeta}>
            <Icon name="clock" size={11} color={colors.primary} />
            <Text style={styles.queueMetaText}>
              Queue Priority #{appointment.tokenIndex} • Estimated wait: ~15 mins
            </Text>
          </View>
        </View>

        {/* Perforated ticket divider */}
        <View style={styles.ticketDivider}>
          <View style={styles.notchLeft} />
          <View style={styles.dashLine} />
          <View style={styles.notchRight} />
        </View>

        {/* Pass Details */}
        <View style={styles.passBody}>
          <View style={styles.passRow}>
            <View style={styles.passCol}>
              <Text style={styles.colLabel}>PATIENT</Text>
              <Text style={styles.colVal}>{appointment.patientName}</Text>
              <Text style={styles.colSub}>
                {appointment.patientAge} yrs • {appointment.patientGender}
              </Text>
            </View>
            <View style={styles.passColRight}>
              <Text style={styles.colLabel}>CONSULTANT</Text>
              <Text style={styles.colVal}>{appointment.doctorName}</Text>
              <Text style={styles.colSub}>Pediatric & Laparoscopic</Text>
            </View>
          </View>

          <View style={[styles.passRow, { marginTop: 8 }]}>
            <View style={styles.passCol}>
              <Text style={styles.colLabel}>APPOINTMENT SLOT</Text>
              <Text style={styles.colVal}>
                {appointment.date} • {appointment.timeSlot}
              </Text>
            </View>
            <View style={styles.passColRight}>
              <Text style={styles.colLabel}>PAYMENT STATUS</Text>
              <Badge
                label={appointment.paymentMethod === 'ONLINE_UPI' ? 'PAID ONLINE (₹400)' : 'PAY AT COUNTER'}
                variant={appointment.paymentMethod === 'ONLINE_UPI' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </View>

          {/* QR Code Graphic Simulation */}
          <View style={styles.qrContainer}>
            <View style={styles.qrMock}>
              <Text style={styles.qrGlyphs}>█▀▀▀█ ▄ █▀▀▀█{'\n'}█ █ █ █ █ █ █{'\n'}█▄▄▄█ ▄ █▄▄▄█{'\n'}▄▄▄▄▄ ▄▄ ▄▄ ▄{'\n'}█▀▀▀█ █ ▄█▄ █{'\n'}█▄▄▄█ █▄█ ▄▀▄</Text>
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.qrCodeTitle}>Instant Scanner Pass</Text>
              <Text style={styles.qrCodeDesc}>
                Show this barcode at Sarangpur/Rajgarh reception counter or scan to check in
              </Text>
            </View>
          </View>
        </View>

        {/* 30-Min Reminder Banner */}
        <View style={styles.reminderBanner}>
          <Icon name="check" size={12} color={colors.secondaryDark} />
          <Text style={styles.reminderText}>
            30-Minute SMS & WhatsApp alert activated for {appointment.patientPhone}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isOnline && onJoinVideo && (
          <Button
            title="Join Video OPD Room Now"
            onPress={onJoinVideo}
            variant="secondary"
            size="md"
            icon="video"
            fullWidth
            style={styles.joinBtn}
          />
        )}

        <View style={styles.secondaryActions}>
          <Button
            title="Calendar Reminder"
            onPress={handleAddToCalendar}
            variant="outline"
            size="sm"
            icon="calendar"
            style={styles.halfBtn}
          />
          <Button
            title="Share Pass"
            onPress={handleShare}
            variant="outline"
            size="sm"
            icon="receipt"
            style={styles.halfBtn}
          />
        </View>

        <Button
          title="Done & View in My Visits"
          onPress={onFinish}
          variant="primary"
          size="md"
          fullWidth
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  successBadge: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.primaryDark,
  },
  successSubtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  passCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    overflow: 'hidden',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  passBrand: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  passBranch: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  tokenSection: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FAFCFF',
  },
  tokenLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  tokenNumber: {
    fontSize: typography.sizes.huge + 4,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    letterSpacing: 1.5,
    marginVertical: 2,
  },
  queueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  queueMetaText: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryDeep,
    fontWeight: typography.weights.medium,
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 16,
    backgroundColor: colors.white,
  },
  notchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.background,
    marginLeft: -7,
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
  },
  notchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.background,
    marginRight: -7,
  },
  passBody: {
    padding: 10,
  },
  passRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passCol: {
    flex: 1,
  },
  passColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  colLabel: {
    fontSize: 8.5,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  colVal: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 1,
  },
  colSub: {
    fontSize: 9,
    color: colors.textMuted,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    marginTop: 10,
    gap: 8,
  },
  qrMock: {
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrGlyphs: {
    fontFamily: 'monospace',
    fontSize: 7,
    lineHeight: 8,
    color: '#000',
  },
  qrInfo: {
    flex: 1,
  },
  qrCodeTitle: {
    fontSize: typography.sizes.xxs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  qrCodeDesc: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 1,
    lineHeight: 11,
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
    gap: 6,
  },
  reminderText: {
    fontSize: 9.5,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
  actionButtons: {
    marginTop: 10,
    gap: 6,
  },
  joinBtn: {
    marginBottom: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  halfBtn: {
    flex: 1,
  },
});
