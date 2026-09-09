/**
 * LiveKit Cloud Configuration & Token Helper for SEVASADAN Telemedicine
 * 
 * Configured Project: Sevaarogyam
 */

import CryptoJS from 'crypto-js';

export interface LiveKitConfig {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  isConfigured: boolean;
}

// In-memory runtime configuration with Sevaarogyam credentials
export const LIVEKIT_CONFIG: LiveKitConfig = {
  serverUrl: 'wss://sevaarogyam-oig6k5o0.livekit.cloud',
  apiKey: 'APICwm3tRgzjvyo',
  apiSecret: 'ijiJ7ha8H7zr8C6b9gz8jmVb9rG0Pfy2EWXeXnYkbdH',
  get isConfigured(): boolean {
    return Boolean(
      this.serverUrl &&
      this.serverUrl.startsWith('wss://') &&
      this.apiKey &&
      this.apiSecret
    );
  },
};

/**
 * Update runtime LiveKit configuration
 */
export const updateLiveKitConfig = (url: string, key?: string, secret?: string) => {
  LIVEKIT_CONFIG.serverUrl = url.trim();
  if (key) LIVEKIT_CONFIG.apiKey = key.trim();
  if (secret) LIVEKIT_CONFIG.apiSecret = secret.trim();
};

/**
 * Generate a room name for a given appointment
 */
export const getAppointmentRoomName = (appointmentId: string): string => {
  return `sevasadan-tele-${appointmentId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
};

const base64UrlEncode = (str: string): string => {
  const words = CryptoJS.enc.Utf8.parse(str);
  return CryptoJS.enc.Base64.stringify(words)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Generate a signed LiveKit JWT Access Token in pure JS for React Native Hermes
 */
export const generateLiveKitToken = async (
  roomName: string,
  participantName: string
): Promise<string> => {
  try {
    if (!LIVEKIT_CONFIG.apiKey || !LIVEKIT_CONFIG.apiSecret) {
      return '';
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 24 * 60 * 60; // 24 hours validity

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      iss: LIVEKIT_CONFIG.apiKey,
      sub: participantName,
      name: participantName,
      nbf: now - 60,
      exp: exp,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

    const signature = CryptoJS.HmacSHA256(unsignedToken, LIVEKIT_CONFIG.apiSecret);
    const signatureEncoded = CryptoJS.enc.Base64.stringify(signature)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const token = `${unsignedToken}.${signatureEncoded}`;
    return token;
  } catch (error) {
    console.warn('[LiveKit] Token generation error:', error);
    return '';
  }
};
