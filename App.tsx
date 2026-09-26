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
import { DrawerNavigation } from './src/components/navigation/DrawerNavigation';

// Patient Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { PrescriptionsScreen } from './src/screens/PrescriptionsScreen';
import { CareServicesScreen } from './src/screens/CareServicesScreen';
import { ClinicsScreen } from './src/screens/ClinicsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Role-Specific Screens
import { DoctorQueueScreen } from './src/screens/doctor/DoctorQueueScreen';
import { DoctorArticlesScreen } from './src/screens/doctor/DoctorArticlesScreen';
import { FrontDeskScreen } from './src/screens/desk/FrontDeskScreen';
import { DoctorChamberScreen } from './src/screens/desk/DoctorChamberScreen';
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';

// Modals
import { BookingModal } from './src/components/booking/BookingModal';
import { WalkInModal } from './src/components/desk/WalkInModal';
import { VideoCallModal } from './src/screens/VideoCallModal';
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
    // 1. Hospital Super Admin Portal
    if (activeRole === 'ADMIN') {
      return <AdminDashboardScreen />;
    }

    // 2. Front Desk (Reception & Employee) Portal
    if (activeRole === 'FRONT_DESK') {
      switch (activeTab) {
        case 'clinics':
          return <DoctorChamberScreen />;
        case 'profile':
          return <ProfileScreen />;
        case 'home':
        default:
          return <FrontDeskScreen />;
      }
    }

    // 3. Doctor Portal View (OPD Chamber 101)
    if (activeRole === 'DOCTOR') {
      switch (activeTab) {
        case 'home':
          return <DoctorQueueScreen />;
        case 'appointments':
          return <AppointmentsScreen />;
        case 'prescriptions':
          return <PrescriptionsScreen />;
        case 'articles':
          return <DoctorArticlesScreen />;
        case 'clinics':
          return <ClinicsScreen />;
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
      case 'care_services':
      case 'lab':
      case 'pharmacy':
        return <CareServicesScreen />;
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
      {/* Dynamic Brand Header */}
      <Header />

      {/* Main Screen Content */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Bottom Footer Tab Navigation (Hidden in ADMIN mode, rendered for other roles) */}
      <BottomTabBar />

      {/* Sliding Sidebar Drawer Navigation */}
      <DrawerNavigation />

      {/* Full 6-Step Booking Modal */}
      <BookingModal />

      {/* Reception Desk Walk-In Allotment Modal */}
      <WalkInModal />

      {/* Live Telemedicine Video Consultation Room */}
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
