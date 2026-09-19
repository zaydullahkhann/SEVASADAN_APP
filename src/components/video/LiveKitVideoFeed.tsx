import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useLocalParticipant,
  useConnectionState,
  useRoomContext,
  useRemoteParticipants,
} from '@livekit/react-native';
import { Track, ConnectionState, RoomEvent } from 'livekit-client';
import { mediaDevices } from '@livekit/react-native-webrtc';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Icon } from '../common/Icon';
import { DoctorAvatar } from '../common/DoctorAvatar';

interface LiveKitRoomContentProps {
  otherPartyName: string;
  localPartyName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  cameraFacing: 'front' | 'back';
  renderFallbackAvatar: () => React.ReactNode;
  onOtherPartyDisconnected?: (name: string) => void;
  isDoctorRole?: boolean;
}

const RoomContent: React.FC<LiveKitRoomContentProps> = ({
  otherPartyName,
  localPartyName,
  isMuted,
  isVideoOff,
  cameraFacing,
  renderFallbackAvatar,
  onOtherPartyDisconnected,
  isDoctorRole,
}) => {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const room = useRoomContext();
  const hasHadRemoteRef = React.useRef(false);
  const [hasRemoteLeft, setHasRemoteLeft] = React.useState(false);

  // Enumerate available camera devices on device
  useEffect(() => {
    (async () => {
      try {
        const devList = await ((mediaDevices as any)?.enumerateDevices?.() || []);
        console.log('SEVASADAN_CAM_DEVICES:', JSON.stringify(devList));
      } catch (e) {
        console.log('SEVASADAN_CAM_DEVICES_ERR:', e);
      }
    })();
  }, []);

  // Detect when remote party drops out after joining
  useEffect(() => {
    if (remoteParticipants.length > 0) {
      hasHadRemoteRef.current = true;
      setHasRemoteLeft(false);
    } else if (hasHadRemoteRef.current && remoteParticipants.length === 0) {
      setHasRemoteLeft(true);
      onOtherPartyDisconnected?.(otherPartyName);
    }
  }, [remoteParticipants, otherPartyName, onOtherPartyDisconnected]);

  // LiveKit Room Event listeners for instantaneous disconnect detection
  useEffect(() => {
    if (!room) return;

    const handleParticipantDisconnected = (participant: any) => {
      setHasRemoteLeft(true);
      const name = participant?.name || participant?.identity || otherPartyName;
      onOtherPartyDisconnected?.(name);
    };

    const handleRoomDisconnected = () => {
      if (hasHadRemoteRef.current) {
        setHasRemoteLeft(true);
        onOtherPartyDisconnected?.(otherPartyName);
      }
    };

    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.Disconnected, handleRoomDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.Disconnected, handleRoomDisconnected);
    };
  }, [room, otherPartyName, onOtherPartyDisconnected]);

  // Support both Camera and Screen Share from remote doctor/patient
  const remoteScreenShareTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.ScreenShare
  );
  const remoteCameraTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.Camera
  );
  const activeRemoteTrack = remoteScreenShareTrack || remoteCameraTrack;
  const isScreenSharing = Boolean(remoteScreenShareTrack);

  const localTrack = tracks.find(
    (t) => t.participant.isLocal && t.source === Track.Source.Camera
  );

  // Sync mic state with user toggle
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMuted).catch(() => {});
    }
  }, [isMuted, localParticipant]);

  // Sync camera state with user toggle
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(!isVideoOff).catch(() => {});
    }
  }, [isVideoOff, localParticipant]);

  // Physical camera hardware switch (Front vs Rear)
  const prevFacingRef = React.useRef<'front' | 'back'>(cameraFacing);
  useEffect(() => {
    if (!localParticipant) return;
    if (prevFacingRef.current !== cameraFacing) {
      prevFacingRef.current = cameraFacing;

      (async () => {
        try {
          const targetFacing = cameraFacing === 'front' ? 'user' : 'environment';
          const pubs = Array.from(localParticipant.videoTrackPublications.values());
          for (const pub of pubs) {
            const vTrack = (pub as any).videoTrack || pub.track;
            if (!vTrack) continue;

            const msTrack = (vTrack as any).mediaStreamTrack;
            if (msTrack) {
              if (typeof msTrack.applyConstraints === 'function') {
                await msTrack.applyConstraints({ facingMode: targetFacing });
              } else if (typeof msTrack._switchCamera === 'function') {
                msTrack._switchCamera();
              }
            }
          }
        } catch (err) {
          console.log('Camera switch error:', err);
        }
      })();
    }
  }, [cameraFacing, localParticipant]);

  return (
    <View style={styles.feedRoot}>
      {/* Remote Video Stream (Camera or Screen Share), Audio-Only Stream, or Waiting Screen */}
      {activeRemoteTrack && !hasRemoteLeft ? (
        <View style={styles.remoteVideoWrapper}>
          <VideoTrack
            trackRef={activeRemoteTrack}
            style={styles.remoteVideo}
            objectFit={isScreenSharing ? 'contain' : 'cover'}
          />
          <View
            style={[
              styles.remoteNameTag,
              isScreenSharing && styles.screenShareTag,
            ]}
          >
            <View
              style={[
                styles.liveIndicatorDot,
                isScreenSharing && styles.screenShareDot,
              ]}
            />
            <Text style={styles.remoteNameText}>
              {isScreenSharing
                ? `${otherPartyName}'s Screen`
                : `${otherPartyName} (Live HD)`}
            </Text>
          </View>
        </View>
      ) : remoteParticipants.length > 0 && !hasRemoteLeft ? (
        <View style={styles.waitingContainer}>
          <View style={styles.doctorAvatarCircle}>
            {isDoctorRole ? (
              <Icon name="user" size={40} color={colors.primary} />
            ) : (
              <DoctorAvatar gender="male" size={64} isHeadSurgeon={true} />
            )}
            <View style={styles.audioActivePulse}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.audioActiveText}>Audio Connected</Text>
            </View>
          </View>
          <Text style={styles.waitingTitle}>{otherPartyName}</Text>
          <Text style={styles.waitingSubtitle}>
            {isDoctorRole
              ? 'Patient has joined consultation (Camera Off)'
              : 'Doctor has joined consultation (Camera Off)'}
          </Text>
          <View style={styles.roomBadge}>
            <Icon name="mic" size={12} color={colors.secondary} />
            <Text style={styles.roomBadgeText}>LiveKit HD Audio Stream</Text>
          </View>
        </View>
      ) : hasRemoteLeft ? (
        <View style={styles.waitingContainer}>
          <View style={[styles.waitingPulseCircle, styles.disconnectedCircle]}>
            <Icon name="call-end" size={32} color={colors.danger} />
          </View>
          <Text style={[styles.waitingTitle, { color: colors.danger }]}>
            {isDoctorRole ? 'Patient Left Call' : 'Doctor Ended Call'}
          </Text>
          <Text style={styles.waitingSubtitle}>
            {otherPartyName} has ended this video consultation.
          </Text>
          <View style={styles.disconnectedBadge}>
            <Text style={styles.disconnectedBadgeText}>Call Concluded</Text>
          </View>
        </View>
      ) : connectionState === ConnectionState.Connected ? (
        <View style={styles.waitingContainer}>
          <View style={styles.waitingPulseCircle}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
          <Text style={styles.waitingTitle}>Room Connected</Text>
          <Text style={styles.waitingSubtitle}>
            Waiting for {otherPartyName} to join this consultation...
          </Text>
          <View style={styles.roomBadge}>
            <Icon name="shield" size={12} color={colors.secondary} />
            <Text style={styles.roomBadgeText}>LiveKit WebRTC Secured</Text>
          </View>
        </View>
      ) : connectionState === ConnectionState.Connecting ? (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.waitingTitle}>Connecting to LiveKit SFU...</Text>
          <Text style={styles.waitingSubtitle}>Negotiating WebRTC peer tracks</Text>
        </View>
      ) : (
        renderFallbackAvatar()
      )}

      {/* Local PIP Video Stream */}
      <View style={styles.pipWrapper}>
        {localTrack && !isVideoOff ? (
          <View style={styles.pipVideoBox}>
            <VideoTrack
              trackRef={localTrack}
              style={styles.pipVideo}
              objectFit="cover"
              mirror={cameraFacing === 'front'}
            />
            <View style={styles.pipBadge}>
              <Text style={styles.pipBadgeText} numberOfLines={1}>
                {cameraFacing === 'front' ? `${localPartyName} (Front)` : 'Wound Cam (Rear)'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.pipOffBox}>
            <Icon name="video-off" size={14} color={colors.white} />
            <Text style={styles.pipOffText}>Cam Off</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export interface LiveKitVideoFeedProps {
  serverUrl: string;
  token: string;
  otherPartyName: string;
  localPartyName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  cameraFacing: 'front' | 'back';
  renderFallbackAvatar: () => React.ReactNode;
  onOtherPartyDisconnected?: (name: string) => void;
  isDoctorRole?: boolean;
}

export const LiveKitVideoFeed: React.FC<LiveKitVideoFeedProps> = ({
  serverUrl,
  token,
  otherPartyName,
  localPartyName,
  isMuted,
  isVideoOff,
  cameraFacing,
  renderFallbackAvatar,
  onOtherPartyDisconnected,
  isDoctorRole,
}) => {
  if (!serverUrl || !token) {
    return (
      <View style={styles.feedRoot}>
        {renderFallbackAvatar()}
        <View style={styles.pipWrapper}>
          {isVideoOff ? (
            <View style={styles.pipOffBox}>
              <Icon name="video-off" size={14} color={colors.white} />
              <Text style={styles.pipOffText}>Cam Off</Text>
            </View>
          ) : (
            <View style={styles.pipOffBox}>
              <Icon
                name={cameraFacing === 'front' ? 'user' : 'camera'}
                size={20}
                color={colors.white}
              />
              <Text style={styles.pipBadgeText} numberOfLines={1}>
                {cameraFacing === 'front' ? 'You (Front)' : 'Wound Cam'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={!isMuted}
      video={!isVideoOff}
    >
      <RoomContent
        otherPartyName={otherPartyName}
        localPartyName={localPartyName}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        cameraFacing={cameraFacing}
        renderFallbackAvatar={renderFallbackAvatar}
        onOtherPartyDisconnected={onOtherPartyDisconnected}
        isDoctorRole={isDoctorRole}
      />
    </LiveKitRoom>
  );
};

const styles = StyleSheet.create({
  feedRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  remoteVideoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  remoteNameTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  screenShareTag: {
    backgroundColor: 'rgba(2, 132, 199, 0.9)',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  screenShareDot: {
    backgroundColor: colors.accent,
  },
  remoteNameText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  waitingPulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  doctorAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  doctorAvatarBigEmoji: {
    fontSize: 54,
  },
  audioActivePulse: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  audioActiveText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  disconnectedCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  waitingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: 4,
  },
  waitingSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  disconnectedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.danger,
    marginTop: 4,
  },
  disconnectedBadgeText: {
    color: colors.danger,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  roomBadgeText: {
    color: colors.secondary,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  pipWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 12,
    width: 105,
    height: 145,
    borderRadius: spacing.borderRadiusMd,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 10,
  },
  pipVideoBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  pipVideo: {
    width: '100%',
    height: '100%',
  },
  pipBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  pipBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  pipOffBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  pipOffText: {
    color: colors.textLight,
    fontSize: typography.sizes.xxs,
  },
  pipAvatarEmoji: {
    fontSize: 24,
  },
});
