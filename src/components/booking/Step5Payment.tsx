import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ConsultationMode, PaymentMethod } from '../../types';
import { DOCTORS } from '../../data/doctors';
import { CLINICS } from '../../data/clinics';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface Step5Props {
  consultationMode: ConsultationMode;
  clinicId: string;
  doctorId: string;
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
}

export const Step5Payment: React.FC<Step5Props> = ({
  consultationMode,
  clinicId,
  doctorId,
  paymentMethod,
  onSelectPaymentMethod,
}) => {
  const isOnline = consultationMode === 'ONLINE_VIDEO';
  const doctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
  const clinic = CLINICS.find((c) => c.id === clinicId) || CLINICS[0];
  const fee = isOnline ? doctor.consultationFeeOnline : doctor.consultationFeeClinic;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payment & Fee Summary</Text>
      <Text style={styles.subheading}>
        Review consultation charges and select your preferred payment mode:
      </Text>

      {/* Bill Breakdown Card */}
      <View style={styles.billCard}>
        <View style={styles.doctorSummary}>
          <View style={styles.docMiniAvatar}>
            <Icon name="stethoscope" size={16} color={colors.primary} />
          </View>
          <View style={styles.docMiniDetails}>
            <Text style={styles.docSummaryName}>{doctor.name}</Text>
            <Text style={styles.docSummaryClinic}>
              {clinic.name} • {isOnline ? 'Telemedicine Video' : 'In-Clinic OPD'}
            </Text>
          </View>
        </View>

        <View style={styles.billDivider} />

        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Specialist Consultation Fee</Text>
          <Text style={styles.billValue}>₹{fee}.00</Text>
        </View>

        <View style={styles.billRow}>
          <View style={styles.freeLabelRow}>
            <Text style={styles.billLabel}>Digital Token & OPD Registration</Text>
            <Badge label="FREE" variant="success" size="sm" />
          </View>
          <Text style={styles.billStrikethrough}>₹50.00</Text>
        </View>

        <View style={styles.billDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalAmount}>₹{fee}.00</Text>
        </View>
      </View>

      {/* Payment Modes */}
      <Text style={styles.paymentModeTitle}>Select Payment Method</Text>

      {/* Option 1: Online UPI / Razorpay */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectPaymentMethod('ONLINE_UPI')}
        style={[
          styles.payMethodCard,
          paymentMethod === 'ONLINE_UPI' && styles.payMethodCardSelected,
        ]}
      >
        <View style={styles.payMethodLeft}>
          <View
            style={[
              styles.methodIconBox,
              paymentMethod === 'ONLINE_UPI' && styles.methodIconBoxSelected,
            ]}
          >
            <Icon name="receipt" size={16} color={colors.primary} />
          </View>
          <View>
            <View style={styles.payNameRow}>
              <Text style={styles.payMethodName}>Online UPI / QR / Cards</Text>
              <Badge label="Instant Pass" variant="success" size="sm" />
            </View>
            <Text style={styles.payMethodDesc}>
              Google Pay, PhonePe, Paytm, BHIM UPI or Cards
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.radio,
            paymentMethod === 'ONLINE_UPI' && styles.radioSelected,
          ]}
        >
          {paymentMethod === 'ONLINE_UPI' && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      {/* Option 2: Pay at Clinic Counter (Only for In-Clinic) */}
      {!isOnline ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectPaymentMethod('CASH_COUNTER')}
          style={[
            styles.payMethodCard,
            paymentMethod === 'CASH_COUNTER' && styles.payMethodCardSelected,
          ]}
        >
          <View style={styles.payMethodLeft}>
            <View
              style={[
                styles.methodIconBox,
                paymentMethod === 'CASH_COUNTER' && styles.methodIconBoxSelected,
              ]}
            >
              <Icon name="hospital" size={16} color={colors.secondaryDark} />
            </View>
            <View>
              <View style={styles.payNameRow}>
                <Text style={styles.payMethodName}>
                  Pay at Clinic OPD Counter
                </Text>
                <Badge label="Cash / Desk UPI" variant="neutral" size="sm" />
              </View>
              <Text style={styles.payMethodDesc}>
                Pay cash or scan clinic QR at reception on arrival
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.radio,
              paymentMethod === 'CASH_COUNTER' && styles.radioSelected,
            ]}
          >
            {paymentMethod === 'CASH_COUNTER' && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.onlineNotice}>
          <Icon name="info" size={12} color={colors.accent} />
          <Text style={styles.onlineNoticeText}>
            Virtual Video Consultations require online payment verification to activate the secure room link.
          </Text>
        </View>
      )}

      {/* Trust Guarantee */}
      <View style={styles.trustRow}>
        <Icon name="shield" size={12} color={colors.secondary} />
        <Text style={styles.trustText}>
          100% Encrypted & NMC Medical Council of India compliant
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  heading: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subheading: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  billCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docMiniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docMiniDetails: {
    flex: 1,
  },
  docSummaryName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docSummaryClinic: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.surfaceSecondary,
    marginVertical: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  freeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text,
  },
  billStrikethrough: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  totalAmount: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  paymentModeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 6,
  },
  payMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 8,
  },
  payMethodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  payMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  methodIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconBoxSelected: {
    backgroundColor: colors.white,
  },
  payNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payMethodName: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  payMethodDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  onlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: spacing.borderRadiusSm,
    gap: 6,
    marginBottom: 8,
  },
  onlineNoticeText: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryDeep,
    flex: 1,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  trustText: {
    fontSize: 9.5,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
});
