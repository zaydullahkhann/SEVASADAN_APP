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
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { CARE_SERVICES_DATA, CareServiceItem } from '../data/careServicesData';
import { CLINICS } from '../data/clinics';
import { Icon, IconName } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

type CategoryFilter = 'ALL' | 'LABORATORY' | 'DIAGNOSTICS' | 'PHARMACY';

export const CareServicesScreen: React.FC = () => {
  const { authUser, currentUserPhone } = useApp();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<CareServiceItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState<boolean>(false);

  // Booking Form State
  const [orderType, setOrderType] = useState<'HOME' | 'CLINIC'>('HOME');
  const [selectedBranch, setSelectedBranch] = useState<string>('sarangpur');
  const [patientName, setPatientName] = useState<string>(authUser?.name || 'Aarav Sharma');
  const [patientPhone, setPatientPhone] = useState<string>(currentUserPhone || '9826000000');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Civil Hospital Road, Sarangpur, MP');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');

  // Filtered Services
  const filteredServices = CARE_SERVICES_DATA.filter((srv) => {
    const matchesCategory =
      activeCategory === 'ALL' || srv.category === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.tag && srv.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (cat: CategoryFilter) => {
    if (cat === 'ALL') return CARE_SERVICES_DATA.length;
    return CARE_SERVICES_DATA.filter((s) => s.category === cat).length;
  };

  const handleOpenBooking = (service: CareServiceItem) => {
    setSelectedService(service);
    setOrderType(service.homeCollectionAvailable ? 'HOME' : 'CLINIC');
    setIsOrderModalOpen(true);
  };

  const handleConfirmOrder = () => {
    if (!selectedService) return;
    const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setIsOrderModalOpen(false);

    Alert.alert(
      'Order Confirmed! 🎉',
      `Thank you, ${patientName}!\n\nService: ${selectedService.name}\nTotal: ₹${selectedService.price}\nOrder Ref: ${orderRef}\nMode: ${
        orderType === 'HOME' ? 'Doorstep Sample Collection / Delivery' : 'In-Clinic Hospital Visit'
      }\nBranch: ${CLINICS.find((c) => c.id === selectedBranch)?.name || 'Sarangpur'}\nPayment: ${
        paymentMode === 'CASH' ? 'Cash on Delivery / Counter' : 'Online UPI'
      }\n\nOur healthcare team will contact +91 ${patientPhone} shortly.`,
      [{ text: 'Great, Thanks!' }]
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:18007382723').catch(() => {
      Alert.alert('Helpline', 'Call Toll-Free: 1800-7382-723');
    });
  };

  const handleUploadRx = () => {
    setIsRxModalOpen(false);
    Alert.alert(
      'Prescription Uploaded! 📋',
      'Your digital prescription has been sent to Janseva Arogyam Pharmacy. Our licensed pharmacist will review and verify within 15 minutes.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Category Filter Header */}
      <View style={styles.topFilterHeader}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lab tests, diagnostics, medicines..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Icon name="close" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3 Main Categories + All Tab */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setActiveCategory('ALL')}
            style={[
              styles.categoryPill,
              activeCategory === 'ALL' && styles.categoryPillActive,
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'ALL' && styles.categoryPillTextActive,
              ]}
            >
              All Care ({getCategoryCount('ALL')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setActiveCategory('LABORATORY')}
            style={[
              styles.categoryPill,
              activeCategory === 'LABORATORY' && styles.categoryPillActive,
            ]}
          >
            <Icon
              name="activity"
              size={13}
              color={activeCategory === 'LABORATORY' ? colors.white : '#059669'}
            />
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'LABORATORY' && styles.categoryPillTextActive,
              ]}
            >
              Laboratory ({getCategoryCount('LABORATORY')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setActiveCategory('DIAGNOSTICS')}
            style={[
              styles.categoryPill,
              activeCategory === 'DIAGNOSTICS' && styles.categoryPillActive,
            ]}
          >
            <Icon
              name="stethoscope"
              size={13}
              color={activeCategory === 'DIAGNOSTICS' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'DIAGNOSTICS' && styles.categoryPillTextActive,
              ]}
            >
              Diagnostics ({getCategoryCount('DIAGNOSTICS')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setActiveCategory('PHARMACY')}
            style={[
              styles.categoryPill,
              activeCategory === 'PHARMACY' && styles.categoryPillActive,
            ]}
          >
            <Icon
              name="pill"
              size={13}
              color={activeCategory === 'PHARMACY' ? colors.white : '#D97706'}
            />
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'PHARMACY' && styles.categoryPillTextActive,
              ]}
            >
              Pharmacy ({getCategoryCount('PHARMACY')})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Service Action Cards */}
        <View style={styles.promoRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsRxModalOpen(true)}
            style={styles.promoCardRx}
          >
            <View style={styles.promoIconCircle}>
              <Icon name="prescription" size={16} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Upload Prescription</Text>
              <Text style={styles.promoSub}>Instant medicine refill & doorstep delivery</Text>
            </View>
            <Icon name="arrow-right" size={13} color="#0284C7" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCallSupport}
            style={styles.promoCardLab}
          >
            <View style={[styles.promoIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="phone" size={15} color="#15803D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.promoTitle, { color: '#15803D' }]}>Home Sample Pickup</Text>
              <Text style={styles.promoSub}>Free blood sample collection at home</Text>
            </View>
            <Icon name="arrow-right" size={13} color="#15803D" />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'ALL'
              ? 'Available Care & Medical Services'
              : activeCategory === 'LABORATORY'
              ? 'Pathology Lab Tests & Health Packages'
              : activeCategory === 'DIAGNOSTICS'
              ? 'Advanced Clinical Diagnostics & Imaging'
              : 'Hospital Pharmacy & Medicine Kits'}
          </Text>
          <Text style={styles.sectionCount}>
            {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Service Cards */}
        {filteredServices.map((service) => {
          const isLab = service.category === 'LABORATORY';
          const isPharma = service.category === 'PHARMACY';
          const isDiag = service.category === 'DIAGNOSTICS';

          return (
            <CompactCard key={service.id} style={styles.serviceCard}>
              {/* Card Header */}
              <View style={styles.serviceCardTop}>
                <View style={styles.serviceTitleCol}>
                  <View style={styles.tagRow}>
                    <Badge
                      label={
                        isLab ? 'LAB TEST' : isPharma ? 'PHARMACY' : 'DIAGNOSTICS'
                      }
                      variant={isLab ? 'success' : isPharma ? 'accent' : 'primary'}
                      size="sm"
                    />
                    {service.tag && (
                      <View style={styles.featurePill}>
                        <Text style={styles.featurePillText}>{service.tag}</Text>
                      </View>
                    )}
                    {service.homeCollectionAvailable && (
                      <View style={styles.homeBadge}>
                        <Icon name="check" size={10} color="#047857" />
                        <Text style={styles.homeBadgeText}>Home Collection</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>

                {/* Price Display */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceCurrency}>₹</Text>
                  <Text style={styles.priceValue}>{service.price}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.serviceDescription}>{service.description}</Text>

              {/* Meta Specs */}
              <View style={styles.serviceSpecsRow}>
                {service.turnaroundTime && (
                  <View style={styles.specItem}>
                    <Icon name="clock" size={12} color={colors.textMuted} />
                    <Text style={styles.specText}>Report: {service.turnaroundTime}</Text>
                  </View>
                )}

                {service.sampleType && (
                  <View style={styles.specItem}>
                    <Icon name="activity" size={12} color={colors.textMuted} />
                    <Text style={styles.specText}>Sample: {service.sampleType}</Text>
                  </View>
                )}

                {service.fastingRequired !== undefined && (
                  <View style={styles.specItem}>
                    <Icon name="info" size={12} color={colors.textMuted} />
                    <Text style={styles.specText}>
                      {service.fastingRequired ? '10-12h Fasting' : 'No Fasting'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <Button
                  title={
                    isPharma
                      ? 'Order Medicine'
                      : isLab
                      ? 'Book Lab Test'
                      : 'Book Diagnostic'
                  }
                  onPress={() => handleOpenBooking(service)}
                  variant="primary"
                  size="sm"
                  icon={isPharma ? 'pill' : isLab ? 'activity' : 'stethoscope'}
                  style={{ flex: 1.2 }}
                />

                <Button
                  title="Helpline"
                  onPress={handleCallSupport}
                  variant="outline"
                  size="sm"
                  icon="phone"
                  style={{ flex: 0.8 }}
                />
              </View>
            </CompactCard>
          );
        })}
      </ScrollView>

      {/* 1. Interactive Order / Booking Modal */}
      {isOrderModalOpen && selectedService && (
        <Modal
          visible={isOrderModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsOrderModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon
                    name={
                      selectedService.category === 'PHARMACY'
                        ? 'pill'
                        : selectedService.category === 'LABORATORY'
                        ? 'activity'
                        : 'stethoscope'
                    }
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.modalTitle}>Confirm Service Booking</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsOrderModalOpen(false)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Service Summary Card */}
                <View style={styles.modalSummaryBox}>
                  <Text style={styles.modalServiceName}>{selectedService.name}</Text>
                  <Text style={styles.modalServiceSub}>{selectedService.description}</Text>
                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalPriceLabel}>Payable Total:</Text>
                    <Text style={styles.modalPriceVal}>₹{selectedService.price}</Text>
                  </View>
                </View>

                {/* Mode of Fulfillment */}
                {selectedService.homeCollectionAvailable && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Select Service Mode</Text>
                    <View style={styles.toggleRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setOrderType('HOME')}
                        style={[
                          styles.toggleOption,
                          orderType === 'HOME' && styles.toggleOptionActive,
                        ]}
                      >
                        <Icon
                          name="home"
                          size={14}
                          color={orderType === 'HOME' ? colors.primary : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.toggleText,
                            orderType === 'HOME' && styles.toggleTextActive,
                          ]}
                        >
                          Home Sample / Delivery
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setOrderType('CLINIC')}
                        style={[
                          styles.toggleOption,
                          orderType === 'CLINIC' && styles.toggleOptionActive,
                        ]}
                      >
                        <Icon
                          name="hospital"
                          size={14}
                          color={orderType === 'CLINIC' ? colors.primary : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.toggleText,
                            orderType === 'CLINIC' && styles.toggleTextActive,
                          ]}
                        >
                          In-Hospital Visit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Assigned Hospital Branch */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Hospital Processing Branch</Text>
                  <View style={styles.branchSelectRow}>
                    {CLINICS.map((clinic) => (
                      <TouchableOpacity
                        key={clinic.id}
                        activeOpacity={0.75}
                        onPress={() => setSelectedBranch(clinic.id)}
                        style={[
                          styles.branchChip,
                          selectedBranch === clinic.id && styles.branchChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.branchChipText,
                            selectedBranch === clinic.id && styles.branchChipTextActive,
                          ]}
                        >
                          {clinic.shortName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Patient Details */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Patient Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter Patient Name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mobile Number (for SMS & WhatsApp Report)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    keyboardType="phone-pad"
                    placeholder="10-digit mobile number"
                  />
                </View>

                {orderType === 'HOME' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Doorstep Collection / Delivery Address</Text>
                    <TextInput
                      style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                      multiline
                      placeholder="Enter complete street address and landmark"
                    />
                  </View>
                )}

                {/* Payment Option */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Payment Method</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setPaymentMode('CASH')}
                      style={[
                        styles.toggleOption,
                        paymentMode === 'CASH' && styles.toggleOptionActive,
                      ]}
                    >
                      <Icon
                        name="receipt"
                        size={14}
                        color={paymentMode === 'CASH' ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          paymentMode === 'CASH' && styles.toggleTextActive,
                        ]}
                      >
                        Pay on Collection / Counter
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setPaymentMode('UPI')}
                      style={[
                        styles.toggleOption,
                        paymentMode === 'UPI' && styles.toggleOptionActive,
                      ]}
                    >
                      <Icon
                        name="credit-card"
                        size={14}
                        color={paymentMode === 'UPI' ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          paymentMode === 'UPI' && styles.toggleTextActive,
                        ]}
                      >
                        UPI / Online
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title={`Confirm Order • ₹${selectedService.price}`}
                  onPress={handleConfirmOrder}
                  variant="primary"
                  size="md"
                  icon="check"
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 2. Upload Prescription Modal */}
      {isRxModalOpen && (
        <Modal
          visible={isRxModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsRxModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon name="prescription" size={18} color={colors.primary} />
                  <Text style={styles.modalTitle}>Upload Digital Prescription</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsRxModalOpen(false)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.rxUploadBox}>
                  <Icon name="camera" size={36} color={colors.primary} />
                  <Text style={styles.rxUploadTitle}>Take Photo or Select from Gallery</Text>
                  <Text style={styles.rxUploadSub}>
                    Clear photo of doctor prescription with medications and doctor stamp
                  </Text>
                  <View style={styles.rxActionBtns}>
                    <TouchableOpacity style={styles.rxBtnCamera} activeOpacity={0.8}>
                      <Icon name="camera" size={14} color={colors.white} />
                      <Text style={styles.rxBtnText}>Open Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rxBtnGallery} activeOpacity={0.8}>
                      <Icon name="file-text" size={14} color={colors.primary} />
                      <Text style={[styles.rxBtnText, { color: colors.primary }]}>Upload PDF / Image</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.rxGuaranteeBox}>
                  <Icon name="shield-check" size={16} color="#059669" />
                  <Text style={styles.rxGuaranteeText}>
                    100% genuine medications directly from Janseva Arogyam Hospital Pharmacy. Verified by licensed pharmacists.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Submit Prescription"
                  onPress={handleUploadRx}
                  variant="primary"
                  size="md"
                  icon="check"
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topFilterHeader: {
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: typography.sizes.xs,
    color: colors.text,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingBottom: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 30,
  },
  promoRow: {
    gap: 8,
    marginBottom: 12,
  },
  promoCardRx: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 10,
  },
  promoCardLab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 10,
  },
  promoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#0369A1',
  },
  promoSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  serviceCard: {
    marginBottom: 10,
  },
  serviceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featurePill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featurePillText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#6D28D9',
  },
  homeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  homeBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#047857',
  },
  serviceName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  priceCurrency: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  priceValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  serviceDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  serviceSpecsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalSummaryBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalServiceName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalServiceSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalPriceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  modalPriceVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: typography.sizes.xs,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  branchSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  branchChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  branchChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  branchChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rxUploadBox: {
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  rxUploadTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 8,
  },
  rxUploadSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
  },
  rxActionBtns: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  rxBtnCamera: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  rxBtnGallery: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  rxBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  rxGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  rxGuaranteeText: {
    flex: 1,
    fontSize: typography.sizes.xxs,
    color: '#15803D',
    lineHeight: 14,
  },
});
