import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp, AdminTabType } from '../../context/AppContext';
import { Clinic, Doctor, DeskStaff, CareService } from '../../types';
import { Icon } from '../../components/common/Icon';
import { DoctorAvatar } from '../../components/common/DoctorAvatar';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';

export const AdminDashboardScreen: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    adminBranches,
    addAdminBranch,
    updateAdminBranch,
    deleteAdminBranch,
    adminDoctors,
    addAdminDoctor,
    updateAdminDoctor,
    deleteAdminDoctor,
    deskStaffList,
    addDeskStaff,
    updateDeskStaff,
    deleteDeskStaff,
    careServices,
    addCareService,
    updateCareService,
    deleteCareService,
    revenueRecords,
    updateRevenueStatus,
    emrLogs,
    openDrawer,
  } = useApp();

  // Search & Filter States
  const [doctorSearch, setDoctorSearch] = useState('');
  const [emrSearch, setEmrSearch] = useState('');
  const [emrFilter, setEmrFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL');

  // Modals States
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Clinic | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    shortName: '',
    address: '',
    city: 'Rajgarh',
    phone: '',
    operatingHours: 'Monday – Saturday: 08:00 AM – 08:00 PM',
    slotIntervalMinutes: '15',
    tokenPrefix: 'BRN',
  });

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    title: 'Consultant Specialist',
    qualification: 'MBBS, MD',
    specialization: 'General Specialist',
    regNumber: 'MP-00000',
    experienceYears: '10',
    consultationFeeClinic: '400',
    consultationFeeOnline: '500',
    opdSchedule: 'Mon-Sat: 09:00 AM - 05:00 PM',
    bio: '',
    selectedBranches: ['rajgarh', 'sarangpur'],
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DeskStaff | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    clinicId: 'rajgarh',
    roleTitle: 'OPD Reception Officer',
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CareService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'DIAGNOSTICS' as CareService['category'],
    price: '300',
    description: '',
    turnaroundTime: '2 Hours',
  });

  // Financial Metrics Calculation
  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);
  const cashRevenue = revenueRecords
    .filter((r) => r.method === 'CASH')
    .reduce((sum, r) => sum + r.amount, 0);
  const onlineRevenue = revenueRecords
    .filter((r) => r.method === 'ONLINE_UPI' || r.method === 'NET_BANKING')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalConsultations = emrLogs.length;

  // --- BRANCH HANDLERS ---
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      shortName: '',
      address: '',
      city: 'Rajgarh',
      phone: '',
      operatingHours: 'Monday – Saturday: 08:00 AM – 08:00 PM',
      slotIntervalMinutes: '15',
      tokenPrefix: 'BRN',
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Clinic) => {
    setEditingBranch(b);
    setBranchForm({
      name: b.name,
      shortName: b.shortName,
      address: b.address,
      city: b.city,
      phone: b.phone,
      operatingHours: b.operatingHours,
      slotIntervalMinutes: String(b.slotIntervalMinutes || 15),
      tokenPrefix: b.tokenPrefix,
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = () => {
    if (!branchForm.name.trim() || !branchForm.shortName.trim()) {
      Alert.alert('Required', 'Please enter branch name and short name.');
      return;
    }
    const branchData: Clinic = {
      id: editingBranch ? editingBranch.id : `branch-${Date.now()}`,
      name: branchForm.name.trim(),
      shortName: branchForm.shortName.trim(),
      fullName: branchForm.name.trim(),
      address: branchForm.address.trim() || 'Hospital Road, MP',
      city: branchForm.city.trim() || 'Rajgarh',
      state: 'Madhya Pradesh',
      pincode: '465661',
      phone: branchForm.phone.trim() || '+91 98260 11223',
      emergencyHelpline: branchForm.phone.trim() || '+91 98260 11223',
      operatingHours: branchForm.operatingHours,
      activeDoctorCount: 2,
      rating: 4.9,
      tokenPrefix: branchForm.tokenPrefix.toUpperCase().trim() || 'BRN',
      slotIntervalMinutes: parseInt(branchForm.slotIntervalMinutes, 10) || 15,
      coordinates: { lat: 24.0, lng: 76.7 },
    };

    if (editingBranch) {
      updateAdminBranch(branchData);
      Alert.alert('Updated', 'Branch information updated successfully.');
    } else {
      addAdminBranch(branchData);
      Alert.alert('Success', 'New hospital branch added.');
    }
    setIsBranchModalOpen(false);
  };

  // --- DOCTOR HANDLERS ---
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      name: '',
      title: 'Consultant Specialist',
      qualification: 'MBBS, MD',
      specialization: 'General Specialist',
      regNumber: 'MP-00000',
      experienceYears: '8',
      consultationFeeClinic: '400',
      consultationFeeOnline: '500',
      opdSchedule: 'Mon-Sat: 09:00 AM - 05:00 PM',
      bio: '',
      selectedBranches: ['rajgarh', 'sarangpur'],
    });
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (d: Doctor) => {
    setEditingDoctor(d);
    setDoctorForm({
      name: d.name,
      title: d.title,
      qualification: d.qualification,
      specialization: d.specialization,
      regNumber: d.regNumber,
      experienceYears: String(d.experienceYears),
      consultationFeeClinic: String(d.consultationFeeClinic),
      consultationFeeOnline: String(d.consultationFeeOnline),
      opdSchedule: d.opdSchedule,
      bio: d.bio,
      selectedBranches: d.clinicsCovered || ['rajgarh'],
    });
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = () => {
    if (!doctorForm.name.trim()) {
      Alert.alert('Required', 'Please enter doctor name.');
      return;
    }
    const cFee = parseInt(doctorForm.consultationFeeClinic, 10) || 400;
    const oFee = parseInt(doctorForm.consultationFeeOnline, 10) || 500;
    const exp = parseInt(doctorForm.experienceYears, 10) || 5;

    const docData: Doctor = {
      id: editingDoctor ? editingDoctor.id : `doc-${Date.now()}`,
      name: doctorForm.name.trim(),
      title: doctorForm.title.trim(),
      qualification: doctorForm.qualification.trim(),
      specialization: doctorForm.specialization.trim(),
      regNumber: doctorForm.regNumber.trim(),
      experienceYears: exp,
      rating: 4.9,
      totalReviews: 120,
      consultationFeeClinic: cFee,
      consultationFeeOnline: oFee,
      clinicsCovered: doctorForm.selectedBranches.length ? doctorForm.selectedBranches : ['rajgarh'],
      awards: ['Specialist Board Certified'],
      languages: ['Hindi', 'English'],
      opdSchedule: doctorForm.opdSchedule,
      bio: doctorForm.bio || 'Consultant Specialist at Janseva Arogyam Healthcare Network.',
      isActive: editingDoctor ? editingDoctor.isActive : true,
      dutyStatus: editingDoctor ? editingDoctor.dutyStatus : 'AVAILABLE',
    };

    if (editingDoctor) {
      updateAdminDoctor(docData);
      Alert.alert('Updated', 'Doctor roster profile updated.');
    } else {
      addAdminDoctor(docData);
      Alert.alert('Success', 'New Doctor registered to Hospital Roster.');
    }
    setIsDoctorModalOpen(false);
  };

  // --- DESK STAFF HANDLERS ---
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      clinicId: 'rajgarh',
      roleTitle: 'OPD Reception Officer',
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (s: DeskStaff) => {
    setEditingStaff(s);
    setStaffForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      clinicId: s.clinicId,
      roleTitle: s.roleTitle,
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      Alert.alert('Required', 'Please enter employee name and email ID.');
      return;
    }
    const branch = adminBranches.find((b) => b.id === staffForm.clinicId);
    const staffData: DeskStaff = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      name: staffForm.name.trim(),
      email: staffForm.email.trim().toLowerCase(),
      phone: staffForm.phone.trim(),
      clinicId: staffForm.clinicId,
      clinicName: branch ? branch.name : 'Rajgarh Branch',
      roleTitle: staffForm.roleTitle.trim(),
      status: editingStaff ? editingStaff.status : 'ACTIVE',
      joinedDate: editingStaff ? editingStaff.joinedDate : 'Today',
    };

    if (editingStaff) {
      updateDeskStaff(staffData);
      Alert.alert('Updated', 'Desk Staff profile updated.');
    } else {
      addDeskStaff(staffData);
      Alert.alert('Success', 'New Reception Staff member registered.');
    }
    setIsStaffModalOpen(false);
  };

  // --- CARE SERVICE HANDLERS ---
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      category: 'DIAGNOSTICS',
      price: '300',
      description: '',
      turnaroundTime: '2 Hours',
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: CareService) => {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      category: s.category,
      price: String(s.price),
      description: s.description,
      turnaroundTime: s.turnaroundTime || '2 Hours',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceForm.name.trim()) {
      Alert.alert('Required', 'Please enter test/service name.');
      return;
    }
    const price = parseInt(serviceForm.price, 10) || 300;
    const srvData: CareService = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      name: serviceForm.name.trim(),
      category: serviceForm.category,
      price,
      description: serviceForm.description.trim() || 'Quality medical care service.',
      turnaroundTime: serviceForm.turnaroundTime.trim(),
      homeCollectionAvailable: serviceForm.category === 'DIAGNOSTICS',
    };

    if (editingService) {
      updateCareService(srvData);
      Alert.alert('Updated', 'Service catalog item updated.');
    } else {
      addCareService(srvData);
      Alert.alert('Success', 'New Test / Service added to catalog.');
    }
    setIsServiceModalOpen(false);
  };

  // ----------------------------------------------------
  // RENDER 1: OVERVIEW TAB
  // ----------------------------------------------------
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* 4 Core Financial & Operational KPI Cards */}
      <View style={styles.kpiGrid}>
        <CompactCard style={styles.kpiCard} borderAccent="#7C3AED">
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>TOTAL NETWORK REVENUE</Text>
            <Icon name="receipt" size={14} color="#7C3AED" />
          </View>
          <Text style={[styles.kpiValue, { color: '#6D28D9' }]}>
            ₹{totalRevenue.toLocaleString()}
          </Text>
          <View style={styles.kpiBreakdownRow}>
            <Text style={styles.kpiSubText}>Online: ₹{onlineRevenue}</Text>
            <Text style={styles.kpiSubText}>• Cash: ₹{cashRevenue}</Text>
          </View>
        </CompactCard>

        <CompactCard style={styles.kpiCard} borderAccent="#0F4C81">
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>TOTAL CONSULTATIONS</Text>
            <Icon name="calendar" size={14} color="#0F4C81" />
          </View>
          <Text style={[styles.kpiValue, { color: '#0F4C81' }]}>
            {totalConsultations}
          </Text>
          <Text style={styles.kpiSubText}>In-Clinic & Video OPDs</Text>
        </CompactCard>

        <CompactCard style={styles.kpiCard} borderAccent="#10B981">
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>ACTIVE BRANCHES</Text>
            <Icon name="hospital" size={14} color="#10B981" />
          </View>
          <Text style={[styles.kpiValue, { color: '#047857' }]}>
            {adminBranches.length}
          </Text>
          <Text style={styles.kpiSubText}>Rajgarh, Sarangpur & Shujalpur</Text>
        </CompactCard>

        <CompactCard style={styles.kpiCard} borderAccent="#F59E0B">
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>DOCTORS ROSTER</Text>
            <Icon name="stethoscope" size={14} color="#F59E0B" />
          </View>
          <Text style={[styles.kpiValue, { color: '#B45309' }]}>
            {adminDoctors.length}
          </Text>
          <Text style={styles.kpiSubText}>Board Certified Specialists</Text>
        </CompactCard>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Admin Actions</Text>
        <Text style={styles.sectionSub}>Instant registration and updates</Text>
      </View>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleOpenAddDoctor}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#EDE9FE' }]}>
            <Icon name="plus" size={14} color="#7C3AED" />
          </View>
          <Text style={styles.quickActionBtnTitle}>Add Doctor</Text>
          <Text style={styles.quickActionBtnSub}>Register Specialist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleOpenAddBranch}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Icon name="hospital" size={14} color="#059669" />
          </View>
          <Text style={styles.quickActionBtnTitle}>Add Branch</Text>
          <Text style={styles.quickActionBtnSub}>New OPD Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleOpenAddService}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="prescription" size={14} color="#D97706" />
          </View>
          <Text style={styles.quickActionBtnTitle}>Add Service</Text>
          <Text style={styles.quickActionBtnSub}>Lab & Care Pack</Text>
        </TouchableOpacity>
      </View>

      {/* Branch Performance Summary Cards */}
      <View style={[styles.sectionHeader, { marginTop: 14 }]}>
        <View style={styles.titleRowBetween}>
          <Text style={styles.sectionTitle}>Branch Performance Summary</Text>
          <TouchableOpacity onPress={() => setActiveAdminTab('admin_branches')}>
            <Text style={styles.viewAllLink}>View All Branches →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {adminBranches.map((branch) => {
        const branchRecords = revenueRecords.filter((r) => r.clinicId === branch.id);
        const branchTotal = branchRecords.reduce((sum, r) => sum + r.amount, 0);
        const branchEmrCount = emrLogs.filter((e) => e.clinicId === branch.id).length;

        return (
          <CompactCard key={branch.id} style={styles.branchSummaryCard}>
            <View style={styles.branchCardTop}>
              <View style={styles.branchIconWrap}>
                <Icon name="hospital" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.branchBadgeRow}>
                  <Text style={styles.branchNameText}>{branch.name}</Text>
                  <Badge label="OPERATIONAL" variant="success" size="sm" />
                </View>
                <View style={styles.branchAddressRow}>
                  <Icon name="map-pin" size={11} color={colors.textMuted} />
                  <Text style={styles.branchAddressText} numberOfLines={1}>
                    {branch.address}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.branchStatsGrid}>
              <View style={styles.branchStatCol}>
                <View style={styles.statIconLabelRow}>
                  <Icon name="credit-card" size={11} color={colors.primary} />
                  <Text style={styles.branchStatLabel}>Revenue</Text>
                </View>
                <Text style={styles.branchStatValue}>₹{branchTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.branchStatDivider} />
              <View style={styles.branchStatCol}>
                <View style={styles.statIconLabelRow}>
                  <Icon name="calendar" size={11} color="#0F4C81" />
                  <Text style={styles.branchStatLabel}>Appointments</Text>
                </View>
                <Text style={[styles.branchStatValue, { color: '#0F4C81' }]}>{branchEmrCount}</Text>
              </View>
              <View style={styles.branchStatDivider} />
              <View style={styles.branchStatCol}>
                <View style={styles.statIconLabelRow}>
                  <Icon name="clock" size={11} color="#D97706" />
                  <Text style={styles.branchStatLabel}>Slot Interval</Text>
                </View>
                <Text style={[styles.branchStatValue, { color: '#D97706' }]}>{branch.slotIntervalMinutes || 15}m</Text>
              </View>
            </View>
          </CompactCard>
        );
      })}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 2: BRANCHES & OPD TAB
  // ----------------------------------------------------
  const renderBranches = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Hospital Branches & OPD Centers</Text>
          <Text style={styles.sectionSub}>
            Manage locations, timings & slot intervals
          </Text>
        </View>
        <Button
          title="Add Branch"
          onPress={handleOpenAddBranch}
          variant="primary"
          size="sm"
          icon="plus"
        />
      </View>

      {adminBranches.map((b) => (
        <CompactCard key={b.id} style={styles.adminBranchCard} borderAccent={colors.primary}>
          <View style={styles.branchCardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.branchTitleRow}>
                <Text style={styles.branchCardTitle}>{b.name}</Text>
                <Badge label={`Prefix: ${b.tokenPrefix}`} variant="neutral" size="sm" />
              </View>
              <Text style={styles.branchAddressFull}>{b.address}</Text>
            </View>
          </View>

          <View style={styles.branchMetaRow}>
            <View style={styles.metaItem}>
              <Icon name="phone" size={11} color={colors.primary} />
              <Text style={styles.metaText}>{b.phone}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="clock" size={11} color={colors.secondaryDark} />
              <Text style={styles.metaText}>{b.slotIntervalMinutes || 15} min slots</Text>
            </View>
          </View>

          <View style={styles.branchHoursBox}>
            <Text style={styles.hoursLabel}>OPD Schedule:</Text>
            <Text style={styles.hoursText}>{b.operatingHours}</Text>
          </View>

          <View style={styles.cardActionsRow}>
            <Button
              title="Edit Details"
              onPress={() => handleOpenEditBranch(b)}
              variant="outline"
              size="sm"
              icon="token"
              style={{ flex: 1 }}
            />
            {adminBranches.length > 1 && (
              <Button
                title="Remove"
                onPress={() => {
                  Alert.alert('Delete Branch', `Are you sure you want to remove ${b.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteAdminBranch(b.id) },
                  ]);
                }}
                variant="danger-outline"
                size="sm"
                icon="trash"
                style={{ flex: 0.8 }}
              />
            )}
          </View>
        </CompactCard>
      ))}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 3: DOCTORS ROSTER TAB
  // ----------------------------------------------------
  const filteredDoctors = adminDoctors.filter((d) =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const renderDoctors = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Specialist Doctors Roster</Text>
          <Text style={styles.sectionSub}>
            Manage doctors, consultation fees & OPD branch coverage
          </Text>
        </View>
        <Button
          title="Add Doctor"
          onPress={handleOpenAddDoctor}
          variant="primary"
          size="sm"
          icon="plus"
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrap}>
        <Icon name="user" size={14} color={colors.textMuted} />
        <TextInput
          placeholder="Search doctor by name or specialty..."
          value={doctorSearch}
          onChangeText={setDoctorSearch}
          style={styles.searchInput}
          placeholderTextColor={colors.textLight}
        />
        {doctorSearch.length > 0 && (
          <TouchableOpacity onPress={() => setDoctorSearch('')}>
            <Icon name="close" size={12} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filteredDoctors.map((doc) => (
        <CompactCard
          key={doc.id}
          style={styles.docRosterCard}
          borderAccent={doc.isHeadSurgeon ? colors.primary : colors.secondary}
        >
          <View style={styles.docHeaderRow}>
            <DoctorAvatar gender="male" size={42} isHeadSurgeon={!!doc.isHeadSurgeon} />
            <View style={styles.docInfoCol}>
              <View style={styles.docNameTitleRow}>
                <Text style={styles.docNameText}>{doc.name}</Text>
                {doc.isHeadSurgeon && <Badge label="Lead" variant="primary" size="sm" />}
              </View>
              <Text style={styles.docSpecText}>{doc.specialization}</Text>
              <Text style={styles.docQualText}>{doc.qualification}</Text>
              <Text style={styles.docRegText}>Reg: {doc.regNumber}</Text>
            </View>
          </View>

          {/* Fee Chips */}
          <View style={styles.docFeesRow}>
            <View style={styles.feeBadgeBox}>
              <Text style={styles.feeBadgeLbl}>Clinic OPD:</Text>
              <Text style={styles.feeBadgeVal}>₹{doc.consultationFeeClinic}</Text>
            </View>
            <View style={styles.feeBadgeBox}>
              <Text style={styles.feeBadgeLbl}>Video OPD:</Text>
              <Text style={styles.feeBadgeVal}>₹{doc.consultationFeeOnline}</Text>
            </View>
            <View style={styles.feeBadgeBox}>
              <Text style={styles.feeBadgeLbl}>Experience:</Text>
              <Text style={styles.feeBadgeVal}>{doc.experienceYears} Years</Text>
            </View>
          </View>

          {/* Assigned Branches */}
          <View style={styles.docBranchList}>
            <Text style={styles.docBranchLbl}>Assigned Centers:</Text>
            <View style={styles.docBranchChips}>
              {doc.clinicsCovered.map((cId) => (
                <View key={cId} style={styles.docBranchChip}>
                  <Text style={styles.docBranchChipText}>
                    {cId.charAt(0).toUpperCase() + cId.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <Button
              title="Edit Profile & Fees"
              onPress={() => handleOpenEditDoctor(doc)}
              variant="outline"
              size="sm"
              icon="token"
              style={{ flex: 1 }}
            />
            <Button
              title="Remove"
              onPress={() => {
                Alert.alert('Remove Doctor', `Delete ${doc.name} from hospital roster?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteAdminDoctor(doc.id) },
                ]);
              }}
              variant="danger-outline"
              size="sm"
              icon="trash"
              style={{ flex: 0.8 }}
            />
          </View>
        </CompactCard>
      ))}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 4: DESK STAFF TAB
  // ----------------------------------------------------
  const renderDeskStaff = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Reception & Desk Employees</Text>
          <Text style={styles.sectionSub}>
            Staff operator credentials, center allotments & permissions
          </Text>
        </View>
        <Button
          title="Register Staff"
          onPress={handleOpenAddStaff}
          variant="primary"
          size="sm"
          icon="plus"
        />
      </View>

      {deskStaffList.map((staff) => (
        <CompactCard key={staff.id} style={styles.staffCard} borderAccent="#F59E0B">
          <View style={styles.staffHeader}>
            <View style={styles.staffAvatar}>
              <Icon name="user" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.staffNameRow}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Badge label={staff.status} variant="success" size="sm" />
              </View>
              <Text style={styles.staffRole}>{staff.roleTitle}</Text>
            </View>
          </View>

          <View style={styles.staffDetailsBox}>
            <View style={styles.staffDetailRow}>
              <Text style={styles.staffDetailLbl}>Login Email:</Text>
              <Text style={styles.staffDetailVal}>{staff.email}</Text>
            </View>
            <View style={styles.staffDetailRow}>
              <Text style={styles.staffDetailLbl}>Phone Number:</Text>
              <Text style={styles.staffDetailVal}>+91 {staff.phone}</Text>
            </View>
            <View style={styles.staffDetailRow}>
              <Text style={styles.staffDetailLbl}>Assigned Center:</Text>
              <Text style={[styles.staffDetailVal, { color: colors.primary, fontWeight: '700' }]}>
                {staff.clinicName}
              </Text>
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <Button
              title="Edit Staff"
              onPress={() => handleOpenEditStaff(staff)}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <Button
              title="Remove"
              onPress={() => {
                Alert.alert('Remove Staff', `Delete ${staff.name} from reception staff?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteDeskStaff(staff.id) },
                ]);
              }}
              variant="danger-outline"
              size="sm"
              icon="trash"
              style={{ flex: 0.8 }}
            />
          </View>
        </CompactCard>
      ))}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 5: LAB & CARE SERVICES TAB
  // ----------------------------------------------------
  const filteredServices = careServices.filter((s) => {
    if (serviceCategoryFilter === 'ALL') return true;
    return s.category === serviceCategoryFilter;
  });

  const categories = ['ALL', 'DIAGNOSTICS', 'PHARMACY', 'LABORATORY', 'CLINICAL'];

  const renderServices = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Lab & Care Services Catalog</Text>
          <Text style={styles.sectionSub}>
            Pathology blood tests, pharmacy kits & OPD review packages
          </Text>
        </View>
        <Button
          title="Add Service"
          onPress={handleOpenAddService}
          variant="primary"
          size="sm"
          icon="plus"
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setServiceCategoryFilter(cat)}
            style={[
              styles.categoryPill,
              serviceCategoryFilter === cat && styles.categoryPillActive,
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                serviceCategoryFilter === cat && styles.categoryPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredServices.map((srv) => (
        <CompactCard key={srv.id} style={styles.serviceCard} borderAccent="#10B981">
          <View style={styles.serviceTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.serviceTitleRow}>
                <Text style={styles.serviceName}>{srv.name}</Text>
                <Text style={styles.servicePrice}>₹{srv.price}</Text>
              </View>
              <View style={styles.serviceBadgeRow}>
                <Badge label={srv.category} variant="primary" size="sm" />
                {srv.turnaroundTime && (
                  <Badge label={srv.turnaroundTime} variant="neutral" size="sm" />
                )}
                {srv.homeCollectionAvailable && (
                  <Badge label="Home Sample" variant="success" size="sm" />
                )}
              </View>
            </View>
          </View>

          <Text style={styles.serviceDesc}>{srv.description}</Text>

          <View style={styles.cardActionsRow}>
            <Button
              title="Edit Service"
              onPress={() => handleOpenEditService(srv)}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <Button
              title="Delete"
              onPress={() => {
                Alert.alert('Delete Service', `Remove ${srv.name} from catalog?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteCareService(srv.id) },
                ]);
              }}
              variant="danger-outline"
              size="sm"
              icon="trash"
              style={{ flex: 0.8 }}
            />
          </View>
        </CompactCard>
      ))}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 6: REVENUE AUDIT TAB
  // ----------------------------------------------------
  const renderRevenue = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hospital Revenue & Collections Audit</Text>
        <Text style={styles.sectionSub}>
          Real-time payment settlements, online UPI and cash register ledger
        </Text>
      </View>

      {/* Audit Stats Banner */}
      <CompactCard style={styles.revenueBannerCard} borderAccent="#7C3AED">
        <View style={styles.revBannerGrid}>
          <View style={styles.revBannerItem}>
            <Text style={styles.revBannerLbl}>GROSS AUDITED</Text>
            <Text style={styles.revBannerVal}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.revDivider} />
          <View style={styles.revBannerItem}>
            <Text style={styles.revBannerLbl}>ONLINE / UPI</Text>
            <Text style={[styles.revBannerVal, { color: colors.secondaryDark }]}>
              ₹{onlineRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.revDivider} />
          <View style={styles.revBannerItem}>
            <Text style={styles.revBannerLbl}>OPD CASH</Text>
            <Text style={[styles.revBannerVal, { color: '#059669' }]}>
              ₹{cashRevenue.toLocaleString()}
            </Text>
          </View>
        </View>
      </CompactCard>

      {/* Transactions List */}
      <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 6 }]}>
        Audit Transaction Records ({revenueRecords.length})
      </Text>

      {revenueRecords.map((rec) => (
        <CompactCard key={rec.id} style={styles.revRecordCard}>
          <View style={styles.revRecordHeader}>
            <View>
              <Text style={styles.revIdText}>{rec.id}</Text>
              <Text style={styles.revPatientText}>{rec.patientName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.revAmountText}>₹{rec.amount}</Text>
              <Badge
                label={rec.status}
                variant={rec.status === 'PAID' || rec.status === 'SETTLED' ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.revRecordDetails}>
            <Text style={styles.revSubText}>
              Doctor: <Text style={styles.boldText}>{rec.doctorName}</Text>
            </Text>
            <Text style={styles.revSubText}>
              Center: {rec.clinicName} • Method: {rec.method}
            </Text>
            <Text style={styles.revDateText}>{rec.date}</Text>
          </View>

          {rec.status === 'PENDING' && (
            <TouchableOpacity
              onPress={() => {
                updateRevenueStatus(rec.id, 'SETTLED');
                Alert.alert('Reconciliation', `Transaction ${rec.id} marked as SETTLED.`);
              }}
              style={styles.settleBtn}
            >
              <Icon name="check" size={12} color="#047857" />
              <Text style={styles.settleBtnText}>Mark Settle & Audited</Text>
            </TouchableOpacity>
          )}
        </CompactCard>
      ))}
    </View>
  );

  // ----------------------------------------------------
  // RENDER 7: EMR LOGS TAB
  // ----------------------------------------------------
  const filteredEmr = emrLogs.filter((e) => {
    const matchSearch =
      e.patientName.toLowerCase().includes(emrSearch.toLowerCase()) ||
      e.tokenNumber.toLowerCase().includes(emrSearch.toLowerCase()) ||
      e.doctorName.toLowerCase().includes(emrSearch.toLowerCase()) ||
      e.clinicName.toLowerCase().includes(emrSearch.toLowerCase());

    if (!matchSearch) return false;
    if (emrFilter === 'CONFIRMED') return e.status === 'CONFIRMED';
    if (emrFilter === 'COMPLETED') return e.status === 'COMPLETED';
    return true;
  });

  const renderEmr = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Electronic Medical Records (EMR) Logs</Text>
        <Text style={styles.sectionSub}>
          Live electronic consultation records, token statuses and doctor chambers
        </Text>
      </View>

      {/* Live Search Bar */}
      <View style={styles.searchBarWrap}>
        <Icon name="calendar" size={14} color={colors.textMuted} />
        <TextInput
          placeholder="Search patient, token (e.g. RAJ-001), doctor or clinic..."
          value={emrSearch}
          onChangeText={setEmrSearch}
          style={styles.searchInput}
          placeholderTextColor={colors.textLight}
        />
        {emrSearch.length > 0 && (
          <TouchableOpacity onPress={() => setEmrSearch('')}>
            <Icon name="close" size={12} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.emrFilterRow}>
        {(['ALL', 'CONFIRMED', 'COMPLETED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setEmrFilter(status)}
            style={[styles.emrFilterPill, emrFilter === status && styles.emrFilterPillActive]}
          >
            <Text
              style={[
                styles.emrFilterPillText,
                emrFilter === status && styles.emrFilterPillTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredEmr.map((emr) => (
        <CompactCard key={emr.id} style={styles.emrCard}>
          <View style={styles.emrTopRow}>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>{emr.tokenNumber}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.emrPatientName}>{emr.patientName}</Text>
              <Text style={styles.emrPatientMeta}>
                {emr.patientAge ? `${emr.patientAge}y • ` : ''}
                {emr.patientGender ? `${emr.patientGender} • ` : ''}
                +91 {emr.patientPhone}
              </Text>
            </View>
            <Badge
              label={emr.status}
              variant={emr.status === 'COMPLETED' ? 'success' : 'primary'}
              size="sm"
            />
          </View>

          <View style={styles.emrDetailsGrid}>
            <Text style={styles.emrDetailLine}>
              Doctor: <Text style={styles.boldText}>{emr.doctorName}</Text>
            </Text>
            <Text style={styles.emrDetailLine}>
              Center: {emr.clinicName} • {emr.mode}
            </Text>
            <View style={styles.emrBottomRow}>
              <Text style={styles.emrDateLine}>
                {emr.date} {emr.timeSlot ? `• Slot: ${emr.timeSlot}` : ''}
              </Text>
              <Text style={styles.emrFeeText}>Fee: ₹{emr.amount}</Text>
            </View>
          </View>
        </CompactCard>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scrollable Screen Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeAdminTab === 'admin_overview' && renderOverview()}
        {activeAdminTab === 'admin_branches' && renderBranches()}
        {activeAdminTab === 'admin_doctors' && renderDoctors()}
        {activeAdminTab === 'admin_staff' && renderDeskStaff()}
        {activeAdminTab === 'admin_services' && renderServices()}
        {activeAdminTab === 'admin_revenue' && renderRevenue()}
        {activeAdminTab === 'admin_emr' && renderEmr()}
      </ScrollView>

      {/* ======================================================= */}
      {/* 1. ADD / EDIT BRANCH MODAL */}
      {/* ======================================================= */}
      <Modal
        visible={isBranchModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBranchModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBranch ? 'Edit Hospital Branch' : 'Add New Hospital Branch'}
              </Text>
              <TouchableOpacity onPress={() => setIsBranchModalOpen(false)}>
                <Icon name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Branch Full Name *</Text>
                <TextInput
                  value={branchForm.name}
                  onChangeText={(t) => setBranchForm({ ...branchForm, name: t })}
                  placeholder="e.g. Rajgarh Multi-Specialty Clinic"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Short Name *</Text>
                  <TextInput
                    value={branchForm.shortName}
                    onChangeText={(t) => setBranchForm({ ...branchForm, shortName: t })}
                    placeholder="e.g. Rajgarh"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Token Prefix *</Text>
                  <TextInput
                    value={branchForm.tokenPrefix}
                    onChangeText={(t) => setBranchForm({ ...branchForm, tokenPrefix: t })}
                    placeholder="e.g. RAJ"
                    autoCapitalize="characters"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Complete Address *</Text>
                <TextInput
                  value={branchForm.address}
                  onChangeText={(t) => setBranchForm({ ...branchForm, address: t })}
                  placeholder="Hospital Road, Shree Krishna Medical Store..."
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Phone / Helpline</Text>
                  <TextInput
                    value={branchForm.phone}
                    onChangeText={(t) => setBranchForm({ ...branchForm, phone: t })}
                    placeholder="+91 8516864268"
                    keyboardType="phone-pad"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Slot Interval (Mins)</Text>
                  <TextInput
                    value={branchForm.slotIntervalMinutes}
                    onChangeText={(t) =>
                      setBranchForm({ ...branchForm, slotIntervalMinutes: t })
                    }
                    placeholder="15 or 20"
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Operating Timings</Text>
                <TextInput
                  value={branchForm.operatingHours}
                  onChangeText={(t) => setBranchForm({ ...branchForm, operatingHours: t })}
                  placeholder="Monday – Saturday: 09:00 AM – 09:00 PM"
                  style={styles.formInput}
                />
              </View>

              <Button
                title={editingBranch ? 'Save Branch Changes' : 'Create Branch'}
                onPress={handleSaveBranch}
                variant="primary"
                size="md"
                style={{ marginTop: 10, marginBottom: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* 2. ADD / EDIT DOCTOR MODAL */}
      {/* ======================================================= */}
      <Modal
        visible={isDoctorModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDoctorModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDoctor ? 'Edit Doctor Profile' : 'Register Doctor in Roster'}
              </Text>
              <TouchableOpacity onPress={() => setIsDoctorModalOpen(false)}>
                <Icon name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Doctor Full Name *</Text>
                <TextInput
                  value={doctorForm.name}
                  onChangeText={(t) => setDoctorForm({ ...doctorForm, name: t })}
                  placeholder="e.g. Dr. Ankur Deshwali"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Specialization *</Text>
                  <TextInput
                    value={doctorForm.specialization}
                    onChangeText={(t) => setDoctorForm({ ...doctorForm, specialization: t })}
                    placeholder="e.g. Pediatric Surgeon"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Reg Number *</Text>
                  <TextInput
                    value={doctorForm.regNumber}
                    onChangeText={(t) => setDoctorForm({ ...doctorForm, regNumber: t })}
                    placeholder="e.g. MP-18824"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Qualifications</Text>
                <TextInput
                  value={doctorForm.qualification}
                  onChangeText={(t) => setDoctorForm({ ...doctorForm, qualification: t })}
                  placeholder="MBBS | MS | MCh"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>In-Clinic Fee (₹) *</Text>
                  <TextInput
                    value={doctorForm.consultationFeeClinic}
                    onChangeText={(t) =>
                      setDoctorForm({ ...doctorForm, consultationFeeClinic: t })
                    }
                    placeholder="300"
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Video Consult Fee (₹) *</Text>
                  <TextInput
                    value={doctorForm.consultationFeeOnline}
                    onChangeText={(t) =>
                      setDoctorForm({ ...doctorForm, consultationFeeOnline: t })
                    }
                    placeholder="500"
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Experience (Years)</Text>
                <TextInput
                  value={doctorForm.experienceYears}
                  onChangeText={(t) => setDoctorForm({ ...doctorForm, experienceYears: t })}
                  placeholder="8"
                  keyboardType="numeric"
                  style={styles.formInput}
                />
              </View>

              <Button
                title={editingDoctor ? 'Save Doctor Profile' : 'Add Doctor to Roster'}
                onPress={handleSaveDoctor}
                variant="primary"
                size="md"
                style={{ marginTop: 10, marginBottom: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* 3. ADD / EDIT DESK STAFF MODAL */}
      {/* ======================================================= */}
      <Modal
        visible={isStaffModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsStaffModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingStaff ? 'Edit Desk Staff' : 'Register Desk Operator'}
              </Text>
              <TouchableOpacity onPress={() => setIsStaffModalOpen(false)}>
                <Icon name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Staff Full Name *</Text>
                <TextInput
                  value={staffForm.name}
                  onChangeText={(t) => setStaffForm({ ...staffForm, name: t })}
                  placeholder="e.g. Ayan"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Login Email Address *</Text>
                <TextInput
                  value={staffForm.email}
                  onChangeText={(t) => setStaffForm({ ...staffForm, email: t })}
                  placeholder="e.g. ayan.08m@outlook.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    value={staffForm.phone}
                    onChangeText={(t) => setStaffForm({ ...staffForm, phone: t })}
                    placeholder="8109493290"
                    keyboardType="phone-pad"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Role Title</Text>
                  <TextInput
                    value={staffForm.roleTitle}
                    onChangeText={(t) => setStaffForm({ ...staffForm, roleTitle: t })}
                    placeholder="Reception Lead"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Assigned Hospital Center:</Text>
                <View style={styles.radioChipRow}>
                  {adminBranches.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => setStaffForm({ ...staffForm, clinicId: b.id })}
                      style={[
                        styles.radioChip,
                        staffForm.clinicId === b.id && styles.radioChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.radioChipText,
                          staffForm.clinicId === b.id && styles.radioChipTextActive,
                        ]}
                      >
                        {b.shortName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button
                title={editingStaff ? 'Update Staff Member' : 'Register Operator'}
                onPress={handleSaveStaff}
                variant="primary"
                size="md"
                style={{ marginTop: 10, marginBottom: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* 4. ADD / EDIT CARE SERVICE MODAL */}
      {/* ======================================================= */}
      <Modal
        visible={isServiceModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsServiceModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add Test / Care Service'}
              </Text>
              <TouchableOpacity onPress={() => setIsServiceModalOpen(false)}>
                <Icon name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Service / Test Name *</Text>
                <TextInput
                  value={serviceForm.name}
                  onChangeText={(t) => setServiceForm({ ...serviceForm, name: t })}
                  placeholder="e.g. Complete Blood Count (CBC)"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price (₹) *</Text>
                  <TextInput
                    value={serviceForm.price}
                    onChangeText={(t) => setServiceForm({ ...serviceForm, price: t })}
                    placeholder="300"
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Turnaround Time</Text>
                  <TextInput
                    value={serviceForm.turnaroundTime}
                    onChangeText={(t) =>
                      setServiceForm({ ...serviceForm, turnaroundTime: t })
                    }
                    placeholder="2 Hours"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Category:</Text>
                <View style={styles.radioChipRow}>
                  {(['DIAGNOSTICS', 'PHARMACY', 'LABORATORY', 'CLINICAL'] as const).map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setServiceForm({ ...serviceForm, category: cat })}
                        style={[
                          styles.radioChip,
                          serviceForm.category === cat && styles.radioChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.radioChipText,
                            serviceForm.category === cat && styles.radioChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={serviceForm.description}
                  onChangeText={(t) =>
                    setServiceForm({ ...serviceForm, description: t })
                  }
                  placeholder="Service description and diagnostic details..."
                  multiline
                  numberOfLines={3}
                  style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>

              <Button
                title={editingService ? 'Save Service Changes' : 'Add to Catalog'}
                onPress={handleSaveService}
                variant="primary"
                size="md"
                style={{ marginTop: 10, marginBottom: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 28,
  },
  tabContent: {
    gap: 8,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  kpiValue: {
    fontSize: 19,
    fontWeight: typography.weights.extraBold,
    marginVertical: 2,
  },
  kpiBreakdownRow: {
    flexDirection: 'row',
    gap: 4,
  },
  kpiSubText: {
    fontSize: 9,
    color: colors.textMuted,
  },

  // Section Headers
  sectionHeader: {
    marginTop: 6,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  titleRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllLink: {
    fontSize: typography.sizes.xxs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },

  // Quick Action Buttons
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.borderRadiusSm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionBtnTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  quickActionBtnSub: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Branch Summary Cards
  branchSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  branchCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  branchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  branchBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  branchNameText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
    marginRight: 6,
  },
  branchAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchAddressText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    flex: 1,
  },
  branchStatsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  branchStatCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  branchStatLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  branchStatValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  branchStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },

  // Branches Tab Cards
  adminBranchCard: {
    marginBottom: 8,
  },
  branchCardHeader: {
    marginBottom: 6,
  },
  branchTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  branchCardTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
    marginRight: 6,
  },
  branchAddressFull: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  branchMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  branchHoursBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 6,
    marginVertical: 4,
  },
  hoursLabel: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  hoursText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },

  // Search Bar
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text,
    paddingVertical: 3,
  },

  // Doctor Roster Cards
  docRosterCard: {
    marginBottom: 8,
  },
  docHeaderRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  docInfoCol: {
    flex: 1,
  },
  docNameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docNameText: {
    fontSize: typography.sizes.sm + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docSpecText: {
    fontSize: typography.sizes.xs,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
  docQualText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  docRegText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  docFeesRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6,
  },
  feeBadgeBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 5,
    alignItems: 'center',
  },
  feeBadgeLbl: {
    fontSize: 8,
    color: colors.textMuted,
  },
  feeBadgeVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: 1,
  },
  docBranchList: {
    marginTop: 2,
    marginBottom: 4,
  },
  docBranchLbl: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 3,
  },
  docBranchChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  docBranchChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  docBranchChipText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },

  // Desk Staff Cards
  staffCard: {
    marginBottom: 8,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  staffRole: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  staffDetailsBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 6,
    gap: 2,
  },
  staffDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  staffDetailLbl: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  staffDetailVal: {
    fontSize: typography.sizes.xxs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },

  // Care Services Cards
  categoryScroll: {
    gap: 6,
    marginBottom: 8,
  },
  categoryPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  categoryPillTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  serviceCard: {
    marginBottom: 8,
  },
  serviceTopRow: {
    marginBottom: 4,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  servicePrice: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.secondaryDark,
  },
  serviceBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  serviceDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    lineHeight: 14,
    marginVertical: 4,
  },

  // Revenue Audit Cards
  revenueBannerCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
    marginBottom: 8,
  },
  revBannerGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  revBannerItem: {
    alignItems: 'center',
  },
  revBannerLbl: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: '#6D28D9',
  },
  revBannerVal: {
    fontSize: 16,
    fontWeight: typography.weights.extraBold,
    color: '#6D28D9',
    marginTop: 2,
  },
  revDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E9D5FF',
  },
  revRecordCard: {
    marginBottom: 6,
  },
  revRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  revIdText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: colors.primary,
  },
  revPatientText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  revAmountText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.secondaryDark,
  },
  revRecordDetails: {
    gap: 1,
  },
  revSubText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  revDateText: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  settleBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#065F46',
  },

  // EMR Log Cards
  emrFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  emrFilterPill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  emrFilterPillActive: {
    backgroundColor: colors.primary,
  },
  emrFilterPillText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  emrFilterPillTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  emrCard: {
    marginBottom: 6,
  },
  emrTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tokenPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  emrPatientName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  emrPatientMeta: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  emrDetailsGrid: {
    gap: 1,
    marginTop: 2,
  },
  emrDetailLine: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  emrBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  emrDateLine: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  emrFeeText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadiusMd,
    borderTopRightRadius: spacing.borderRadiusMd,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#072A4A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  modalScroll: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  formGroup: {
    marginBottom: 8,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  radioChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  radioChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioChipText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  radioChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
});
