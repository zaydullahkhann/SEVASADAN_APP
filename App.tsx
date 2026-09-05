import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { colors } from './src/theme/colors';

// Auth Screen (Login & Sign-Up)
import { AuthScreen } from './src/screens/auth/AuthScreen';

// Navigation & Common
import { Header } from './src/components/common/Header';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';

// Patient Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { PrescriptionsScreen } from './src/screens/PrescriptionsScreen';
import { ClinicsScreen } from './src/screens/ClinicsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Role-Specific Screens
import { DoctorQueueScreen } from './src/screens/doctor/DoctorQueueScreen';
import { FrontDeskScreen } from './src/screens/desk/FrontDeskScreen';
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';

// Modals
import { BookingModal } from './src/components/booking/BookingModal';
import { WalkInModal } from './src/components/desk/WalkInModal';
import { VideoCallModal } from './src/screens/VideoCallModal';
import { RoleSwitcherModal } from './src/components/common/RoleSwitcherModal';
import { WritePrescriptionModal } from './src/screens/doctor/WritePrescriptionModal';

function AppContent() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, activeRole, activeTab } = useApp();

  // If not authenticated, display Login & Sign-Up Screen
  if (!isAuthenticated) {
    return (
      <View style={[styles.authRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <AuthScreen />
      </View>
    );
  }

  const renderActiveScreen = () => {
    // 1. Doctor Portal View
    if (activeRole === 'DOCTOR') {
      switch (activeTab) {
        case 'home':
          return <DoctorQueueScreen />;
        case 'prescriptions':
          return <PrescriptionsScreen />;
        case 'appointments':
          return <AppointmentsScreen />;
        case 'clinics':
          return <ClinicsScreen />;
        case 'profile':
        default:
          return <ProfileScreen />;
      }
    }

    // 2. Front Desk Portal View
    if (activeRole === 'FRONT_DESK') {
      switch (activeTab) {
        case 'home':
          return <FrontDeskScreen />;
        case 'appointments':
          return <AppointmentsScreen />;
        case 'prescriptions':
          return <PrescriptionsScreen />;
        case 'clinics':
          return <ClinicsScreen />;
        case 'profile':
        default:
          return <ProfileScreen />;
      }
    }

    // 3. Hospital Admin Portal View
    if (activeRole === 'ADMIN') {
      switch (activeTab) {
        case 'home':
        case 'prescriptions':
          return <AdminDashboardScreen />;
        case 'clinics':
          return <ClinicsScreen />;
        case 'appointments':
          return <AppointmentsScreen />;
        case 'profile':
        default:
          return <ProfileScreen />;
      }
    }

    // 4. Patient Portal View (Default)
    switch (activeTab) {
      case 'appointments':
        return <AppointmentsScreen />;
      case 'prescriptions':
        return <PrescriptionsScreen />;
      case 'clinics':
        return <ClinicsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.appRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Dynamic Brand Header with Role Switcher & Emergency Shortcut */}
      <Header />

      {/* Main Tab Screen Content (Role-Aware) */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Dynamic Bottom Navigation (Role-Aware) */}
      <BottomTabBar />

      {/* Role Switcher Modal (Patient, Doctor, Front Desk, Admin) */}
      <RoleSwitcherModal />

      {/* Full 6-Step Booking Modal */}
      <BookingModal />

      {/* Reception Desk Walk-In Allotment Modal (Journey 5) */}
      <WalkInModal />

      {/* Live Telemedicine Video Consultation Room (Journey 2) */}
      <VideoCallModal />

      {/* Doctor's Digital Prescription Authoring Modal */}
      <WritePrescriptionModal />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authRoot: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  appRoot: {
    flex: 1,
    backgroundColor: colors.primary, // Matches top header & status bar
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
