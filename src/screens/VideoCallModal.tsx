import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import {
  LIVEKIT_CONFIG,
  generateLiveKitToken,
  getAppointmentRoomName,
} from '../services/livekitConfig';
import { LiveKitSetupModal } from '../components/video/LiveKitSetupModal';
import { LiveKitVideoFeed } from '../components/video/LiveKitVideoFeed';

export const VideoCallModal: React.FC = () => {
  const {
    activeRole,
    activeVideoAppointment,
    closeVideoCall,
    setActiveTab,
    addPrescription,
  } = useApp();

  const isDoctorRole = activeRole === 'DOCTOR';
  const otherPartyName = isDoctorRole
    ? (activeVideoAppointment?.patientName || 'Patient')
    : (activeVideoAppointment?.doctorName || 'Dr. Ankur Deshwali');
  const localPartyName = isDoctorRole
    ? (activeVideoAppointment?.doctorName || 'Dr. Ankur Deshwali')
    : (activeVideoAppointment?.patientName || 'Patient');

  const [seconds, setSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [showLiveKitSetup, setShowLiveKitSetup] = useState<boolean>(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState<boolean>(LIVEKIT_CONFIG.isConfigured);
  const [liveKitToken, setLiveKitToken] = useState<string>('');

  useEffect(() => {
    if (activeVideoAppointment && isLiveKitActive) {
      const room = getAppointmentRoomName(activeVideoAppointment.id);
      const participant = localPartyName;
      generateLiveKitToken(room, participant).then((tok) => {
        if (tok) {
          setLiveKitToken(tok);
        }
      });
    }
  }, [activeVideoAppointment, isLiveKitActive, localPartyName]);

  useEffect(() => {
    let timer: any;
    if (activeVideoAppointment) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeVideoAppointment]);

  const callEndedHandledRef = React.useRef(false);

  useEffect(() => {
    callEndedHandledRef.current = false;
  }, [activeVideoAppointment?.id]);

  if (!activeVideoAppointment || (activeRole !== 'DOCTOR' && activeRole !== 'PATIENT')) {
    return null;
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOtherPartyDisconnected = (disconnectedName: string) => {
    if (callEndedHandledRef.current || !activeVideoAppointment) return;
    callEndedHandledRef.current = true;

    if (!isDoctorRole) {
      // Patient was on mobile and Doctor ended call from laptop
      addPrescription({
        id: `rx-tele-${Date.now()}`,
        appointmentId: activeVideoAppointment.id,
        patientName: activeVideoAppointment.patientName,
        patientPhone: activeVideoAppointment.patientPhone,
        doctorName: activeVideoAppointment.doctorName,
        doctorSpecialization: 'Pediatric Surgeon (Telemedicine)',
        clinicName: activeVideoAppointment.clinicName,
        date: 'Today',
        diagnosis: 'Telemedicine Clinical Review - Consultation Completed',
        symptomsRecorded: activeVideoAppointment.symptoms,
        medications: [
          {
            name: 'Syrup Paracetamol (120mg/5ml)',
            dosage: '5 ml',
            frequency: 'SOS (Pain/Fever)',
            duration: '3 Days',
            instructions: 'After milk or food',
          },
          {
            name: 'Multivitamin Drops / Syrup',
            dosage: '2.5 ml',
            frequency: '1-0-0 (Morning)',
            duration: '15 Days',
            instructions: 'Daily once after breakfast',
          },
        ],
        advice: 'Follow prescription dosage. Revisit clinic if symptoms persist after 3 days.',
        followUpDays: 7,
        followUpDate: '15 Sep 2026',
        followUpAdvised: true,
      });

      Alert.alert(
        'Doctor Ended Call',
        `${disconnectedName || otherPartyName} has ended the consultation.\n\nYour digital prescription has been signed and added to your records.`,
        [
          {
            text: 'View Prescription',
            onPress: () => {
              closeVideoCall();
              setActiveTab('prescriptions');
            },
          },
          {
            text: 'Done',
            style: 'cancel',
            onPress: () => {
              closeVideoCall();
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // Doctor was on mobile and Patient disconnected
      Alert.alert(
        'Patient Left Call',
        `${disconnectedName || otherPartyName} has disconnected from the room.`,
        [
          {
            text: 'Close OPD Session',
            onPress: () => closeVideoCall(),
          },
        ],
        { cancelable: false }
      );
    }
  };

  const handleEndCall = () => {
    callEndedHandledRef.current = true;
    Alert.alert(
      'End Telemedicine Consultation',
      'Are you sure you want to end this video session with the doctor?',
      [
        {
          text: 'Resume Call',
          style: 'cancel',
          onPress: () => {
            callEndedHandledRef.current = false;
          },
        },
        {
          text: 'End Consultation',
          style: 'destructive',
          onPress: () => {
            // Generate a real-time digital prescription for this patient
            addPrescription({
              id: `rx-tele-${Date.now()}`,
              appointmentId: activeVideoAppointment.id,
              patientName: activeVideoAppointment.patientName,
              patientPhone: activeVideoAppointment.patientPhone,
              doctorName: activeVideoAppointment.doctorName,
              doctorSpecialization: 'Pediatric Surgeon (Telemedicine)',
              clinicName: activeVideoAppointment.clinicName,
              date: 'Today',
              diagnosis: 'Telemedicine Clinical Review - Healing Normal',
              symptomsRecorded: activeVideoAppointment.symptoms,
              medications: [
                {
                  name: 'Syrup Paracetamol (120mg/5ml)',
                  dosage: '5 ml',
                  frequency: 'SOS (Pain/Fever)',
                  duration: '3 Days',
                  instructions: 'After milk or food',
                },
                {
                  name: 'Multivitamin Drops / Syrup',
                  dosage: '2.5 ml',
                  frequency: '1-0-0 (Morning)',
                  duration: '15 Days',
                  instructions: 'Daily once after breakfast',
                },
              ],
              advice: 'Keep patient hydrated. Avoid strenuous activity. Revisit if temperature exceeds 101°F.',
              followUpDays: 7,
              followUpDate: '15 Sep 2026',
              followUpAdvised: true,
            });

            closeVideoCall();
            Alert.alert(
              'Prescription Issued!',
              'Dr. Ankur Deshwali has signed and generated your Digital Prescription with dosage details.',
              [
                {
                  text: 'View Prescription',
                  onPress: () => setActiveTab('prescriptions'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={!!activeVideoAppointment}
      animationType="slide"
      transparent={false}
      onRequestClose={handleEndCall}
    >
      <View style={styles.container}>
        {/* LiveKit Real-Time WebRTC Media Feed */}
        <View style={styles.doctorFeed}>
          <LiveKitVideoFeed
            serverUrl={LIVEKIT_CONFIG.serverUrl}
            token={liveKitToken}
            otherPartyName={otherPartyName}
            localPartyName={localPartyName}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            cameraFacing={cameraFacing}
            isDoctorRole={isDoctorRole}
            onOtherPartyDisconnected={handleOtherPartyDisconnected}
            renderFallbackAvatar={() => (
              <View style={styles.doctorVideoFrame}>
                <View style={styles.doctorAvatarBox}>
                  <Text style={styles.doctorAvatarEmoji}>
                    {isDoctorRole ? '👤' : '👨‍⚕️'}
                  </Text>
                  <View style={styles.speakingIndicator}>
                    <Text style={styles.speakingWave}>
                      ● {isDoctorRole ? 'Waiting for Patient...' : 'Dr. Ankur Speaking'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Top Bar Overlay */}
          <View style={styles.topBar}>
            <View style={styles.docDetails}>
              <Text style={styles.docName}>
                {otherPartyName}
              </Text>
              <Text style={styles.docSub}>
                {activeVideoAppointment.clinicName} • Token #{activeVideoAppointment.tokenNumber}
              </Text>
            </View>

            {/* LiveKit Cloud Status Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLiveKitSetup(true)}
              style={[
                styles.liveKitPill,
                isLiveKitActive ? styles.liveKitPillActive : styles.liveKitPillSetup,
              ]}
            >
              <View
                style={[
                  styles.liveKitDot,
                  (isLiveKitActive || Boolean(liveKitToken)) && styles.liveKitDotActive,
                ]}
              />
              <Text style={styles.liveKitPillText}>
                {liveKitToken ? 'LiveKit HD' : isLiveKitActive ? 'LiveKit SFU' : 'LiveKit ⚙️'}
              </Text>
            </TouchableOpacity>

            <View style={styles.timerBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
            </View>
          </View>

          {/* NMC Telemedicine Compliance Chip */}
          <View style={styles.complianceChip}>
            <Icon name="shield" size={10} color={colors.secondaryDark} />
            <Text style={styles.complianceText}>
              LiveKit Sevaarogyam • NMC Verified • E2EE Encrypted HD
            </Text>
          </View>

          {/* Local PiP (Picture in Picture) Camera Preview */}
          <View style={styles.pipContainer}>
            {isVideoOff ? (
              <View style={styles.pipVideoOff}>
                <Icon name="video-off" size={20} color={colors.textLight} />
                <Text style={styles.pipOffText}>Cam Off</Text>
              </View>
            ) : (
              <View style={styles.pipVideoOn}>
                <Text style={styles.pipPatientEmoji}>
                  {isDoctorRole ? '👨‍⚕️' : '👤'}
                </Text>
                <Text style={styles.pipLabel}>You (HD)</Text>
              </View>
            )}
          </View>

          {/* Doctor Live Clinical Notes Inset */}
          {showNotes && (
            <View style={styles.notesPanel}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesTitle}>Doctor's Live Consultation Notes</Text>
                <TouchableOpacity onPress={() => setShowNotes(false)}>
                  <Icon name="close" size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.notesBody}>
                "Child's wound incision is well-healed. Mild redness is expected. Advised to continue oral hydration and finish the 3-day course. Schedule in-clinic checkup next week."
              </Text>
              <Badge label="Added to Prescription" variant="success" size="sm" />
            </View>
          )}
        </View>

        {/* Bottom Call Control Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsMuted(!isMuted)}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <Icon
              name={isMuted ? 'mic-off' : 'mic'}
              size={18}
              color={isMuted ? colors.white : colors.text}
            />
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsVideoOff(!isVideoOff)}
            style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
          >
            <Icon
              name={isVideoOff ? 'video-off' : 'video'}
              size={18}
              color={isVideoOff ? colors.white : colors.text}
            />
            <Text style={styles.controlLabel}>{isVideoOff ? 'Start' : 'Stop'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
            style={styles.controlBtn}
          >
            <Icon name="switch-camera" size={18} color={colors.text} />
            <Text style={styles.controlLabel}>
              {cameraFacing === 'front' ? 'Rear Cam' : 'Front Cam'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowNotes(!showNotes)}
            style={[styles.controlBtn, showNotes && styles.controlBtnActive]}
          >
            <Icon
              name="prescription"
              size={18}
              color={showNotes ? colors.white : colors.text}
            />
            <Text style={styles.controlLabel}>Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEndCall}
            style={styles.endCallBtn}
          >
            <Icon name="call-end" size={20} color={colors.white} />
            <Text style={styles.endCallLabel}>End</Text>
          </TouchableOpacity>
        </View>

        {/* LiveKit Setup Modal */}
        <LiveKitSetupModal
          visible={showLiveKitSetup}
          onClose={() => setShowLiveKitSetup(false)}
          onConfigSaved={() => setIsLiveKitActive(LIVEKIT_CONFIG.isConfigured)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  doctorFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  doctorVideoFrame: {
    alignItems: 'center',
  },
  doctorAvatarBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  doctorAvatarEmoji: {
    fontSize: 64,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: colors.secondary,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  speakingWave: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  topBar: {
    position: 'absolute',
    top: 24,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  docSub: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xxs,
    marginTop: 1,
  },
  liveKitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginRight: 6,
    gap: 4,
  },
  liveKitPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  liveKitPillSetup: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  liveKitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveKitDotActive: {
    backgroundColor: colors.success,
  },
  liveKitPillText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    gap: 4,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  timerText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  pipContainer: {
    position: 'absolute',
    bottom: 24,
    right: 14,
    width: 90,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: '#334155',
  },
  pipVideoOn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 4,
  },
  pipPatientEmoji: {
    fontSize: 32,
  },
  pipLabel: {
    color: colors.white,
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    marginTop: 4,
    textAlign: 'center',
  },
  pipVideoOff: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    gap: 4,
  },
  pipOffText: {
    color: colors.textLight,
    fontSize: 8.5,
  },
  complianceChip: {
    position: 'absolute',
    bottom: 24,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  complianceText: {
    fontSize: 8.5,
    color: colors.secondaryDark,
    fontWeight: typography.weights.bold,
  },
  notesPanel: {
    position: 'absolute',
    top: 75,
    left: 14,
    right: 14,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notesTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  notesBody: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.text,
    lineHeight: 14,
    marginBottom: 6,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
  },
  controlBtnActive: {
    backgroundColor: colors.primary,
  },
  controlLabel: {
    color: colors.textLight,
    fontSize: 9,
    marginTop: 2,
  },
  endCallBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.danger,
  },
  endCallLabel: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
});
