/* eslint-disable no-undef */

jest.mock('@livekit/react-native', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    registerGlobals: jest.fn(),
    LiveKitRoom: ({ children }) => mockReact.createElement(View, null, children),
    VideoTrack: () => mockReact.createElement(View, null),
    useTracks: () => [],
    useLocalParticipant: () => ({
      localParticipant: {
        setMicrophoneEnabled: jest.fn().mockResolvedValue(undefined),
        setCameraEnabled: jest.fn().mockResolvedValue(undefined),
      },
      isMicrophoneEnabled: true,
      isCameraEnabled: true,
    }),
    useConnectionState: () => 'connected',
    useRoomContext: () => ({
      localParticipant: {
        setMicrophoneEnabled: jest.fn().mockResolvedValue(undefined),
        setCameraEnabled: jest.fn().mockResolvedValue(undefined),
      },
    }),
  };
});

jest.mock('@livekit/react-native-webrtc', () => ({
  RTCView: 'RTCView',
}));
