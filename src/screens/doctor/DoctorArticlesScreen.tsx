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
  Share,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishDate: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  coverType: 'diet_plate' | 'veggies' | 'hygiene' | 'bp_monitor' | 'custom';
  coverBg: string;
}

const INITIAL_ARTICLES: HealthArticle[] = [
  {
    id: 'art-1',
    title: 'Everyday Techniques to Manage Stress Better',
    category: 'GENERAL MEDICINE',
    readTime: '7 min read',
    publishDate: '16 Sept 2026',
    author: 'Dr. Syed',
    authorRole: 'Senior Medical Officer • MBBS, MD',
    coverType: 'veggies',
    coverBg: '#FEF3C7',
    excerpt:
      'Practical coping strategies to reduce daily stress and improve emotional resilience.2',
    content:
      'Chronic daily stress is a leading contributor to elevated blood pressure and autonomic nervous strain.\n\nKey clinical recommendations:\n1. 4-7-8 Breathing Method: Inhale for 4 seconds, hold for 7, exhale smoothly for 8 seconds twice daily.\n2. Nutrient Rich Diet: Leafy greens, magnesium, and fresh vegetables help stabilize cortisol levels.\n3. Consistent Sleep: Maintain 7-8 hours of regular sleep schedule.\n4. Moderate Aerobic Exercise: 30 minutes of brisk daily walking lowers resting heart rate.',
  },
  {
    id: 'art-2',
    title: 'Everyday Techniques to Manage Stress Better2',
    category: 'GENERAL MEDICINE',
    readTime: '7 min read',
    publishDate: '16 Sept 2026',
    author: 'Dr. Syed',
    authorRole: 'Senior Medical Officer • MBBS, MD',
    coverType: 'diet_plate',
    coverBg: '#E0F2FE',
    excerpt:
      'Practical coping strategies to reduce daily stress and improve emotional resilience.',
    content:
      'Dietary and cognitive strategies to manage workplace and daily physical stress.\n\n1. Balanced Nutrition Plate: Balance proteins, fiber, and complex carbohydrates.\n2. Hydration: Drink 2.5 - 3 liters of water per day.\n3. Screen Time Limits: Disconnect from mobile devices 1 hour prior to sleep.',
  },
  {
    id: 'art-3',
    title: 'Staying Protected During Seasonal Flu Outbreaks2',
    category: 'GENERAL MEDICINE',
    readTime: '7 min read',
    publishDate: '16 Sept 2026',
    author: 'Dr. Syed',
    authorRole: 'Senior Medical Officer • MBBS, MD',
    coverType: 'hygiene',
    coverBg: '#0284C7',
    excerpt:
      'Simple daily habits and early symptoms to watch for during flu season.',
    content:
      'Wash your hands thoroughly with soap and water, and use hand sanitiser regularly.\nRemember "catch it, bin it, kill it" when it comes to sneezing and coughing to stop the spread of germs.\n\nSeek immediate OPD evaluation if temperature exceeds 101°F with chest discomfort.',
  },
  {
    id: 'art-4',
    title: 'Managing Type-2 Diabetes & Glycemic Control',
    category: 'DIABETES & METABOLIC',
    readTime: '6 min read',
    publishDate: '15 Sept 2026',
    author: 'Dr. Syed',
    authorRole: 'Senior Medical Officer • MBBS, MD',
    coverType: 'veggies',
    coverBg: '#DCFCE7',
    excerpt:
      'Clinical guidance on low-glycemic Indian diets, HbA1c monitoring, and foot care.',
    content:
      'Effective glycemic control prevents microvascular and macrovascular complications.\n\n1. Target HbA1c: Aim for < 7.0%.\n2. Complex Grains: Replace refined wheat with millets (bajra, jowar).\n3. Daily Foot Inspection: Prevent ulcers and monitor sensations.',
  },
  {
    id: 'art-5',
    title: 'Cardiovascular Health & Routine BP Tracking',
    category: 'CARDIOLOGY',
    readTime: '5 min read',
    publishDate: '12 Sept 2026',
    author: 'Dr. Syed',
    authorRole: 'Senior Medical Officer • MBBS, MD',
    coverType: 'bp_monitor',
    coverBg: '#F1F5F9',
    excerpt:
      'Preventative cardiology advice on digital BP monitoring and sodium restriction.',
    content:
      'Guidelines for accurate blood pressure monitoring at home:\n\n1. Rest for 5 minutes prior to measuring.\n2. Keep the cuff at heart level.\n3. Record morning and evening readings in a health log.',
  },
];

export const DoctorArticlesScreen: React.FC = () => {
  const { authUser } = useApp();

  const [articles, setArticles] = useState<HealthArticle[]>(INITIAL_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HealthArticle | null>(null);

  // Form Fields matching user requirements
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('General Medicine');
  const [formReadTime, setFormReadTime] = useState('5');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverType, setFormCoverType] = useState<HealthArticle['coverType']>('diet_plate');
  const [hasUploadedCover, setHasUploadedCover] = useState(true);

  const categories = [
    'General Medicine',
    'Cardiology',
    'Pediatrics',
    'Diabetes & Metabolic',
    'Preventive Care',
    'Surgical Care',
  ];

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormCategory('General Medicine');
    setFormReadTime('5');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverType('diet_plate');
    setHasUploadedCover(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (art: HealthArticle) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormReadTime(art.readTime.replace(/[^0-9]/g, '') || '5');
    setFormExcerpt(art.excerpt);
    setFormContent(art.content);
    setFormCoverType(art.coverType);
    setHasUploadedCover(true);
    setIsAddModalOpen(true);
  };

  const handleSaveArticle = () => {
    if (!formTitle.trim()) {
      Alert.alert('Required Field', 'Please enter an Article Title.');
      return;
    }
    if (!formExcerpt.trim()) {
      Alert.alert('Required Field', 'Please enter a Short Excerpt / Summary.');
      return;
    }

    if (editingArticle) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? {
                ...a,
                title: formTitle.trim(),
                category: formCategory.toUpperCase(),
                readTime: `${formReadTime.trim() || '5'} min read`,
                excerpt: formExcerpt.trim(),
                content:
                  formContent.trim() ||
                  'Detailed health recommendations and medical guidance provided by consultant specialist.',
                coverType: formCoverType,
              }
            : a
        )
      );
      Alert.alert('Article Updated', 'Changes saved successfully.');
    } else {
      const newArt: HealthArticle = {
        id: `art-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory.toUpperCase(),
        readTime: `${formReadTime.trim() || '5'} min read`,
        publishDate: '24 Sept 2026',
        author: authUser?.name || 'Dr. Syed',
        authorRole: 'Senior Medical Officer • MBBS, MD',
        coverType: formCoverType,
        coverBg:
          formCategory === 'Cardiology'
            ? '#F1F5F9'
            : formCategory === 'Diabetes & Metabolic'
            ? '#DCFCE7'
            : '#E0F2FE',
        excerpt: formExcerpt.trim(),
        content:
          formContent.trim() ||
          'Detailed health recommendations, precautions, and dietary guidance provided by consultant doctor.',
      };
      setArticles((prev) => [newArt, ...prev]);
      Alert.alert('Article Published', 'New medical article added to Doctor Knowledge Base.');
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setArticles((prev) => prev.filter((a) => a.id !== id));
            if (selectedArticle?.id === id) {
              setSelectedArticle(null);
            }
          },
        },
      ]
    );
  };

  const handleShare = (art: HealthArticle) => {
    Share.share({
      title: art.title,
      message: `${art.title}\n\n${art.excerpt}\n\nPublished by ${art.author} (${art.authorRole})\nRead on Janseva Arogyam: https://jansevaarogyam.com/articles`,
    }).catch(() => {});
  };

  // Render Cover Banner Illustration/Design matching Image 3
  const renderCardCover = (art: HealthArticle) => {
    if (art.coverType === 'hygiene') {
      return (
        <View style={[styles.coverContainer, { backgroundColor: '#0284C7' }]}>
          <View style={styles.hygieneGraphicBox}>
            <Text style={styles.hygieneHeading}>and sneezing</Text>
            <Text style={styles.hygieneSub}>
              Wash your hands thoroughly with soap and water, and use hand sanitiser regularly.
            </Text>
            <Text style={styles.hygieneCatch}>
              Remember 'catch it, bin it, kill it' when it comes to sneezing and coughing.
            </Text>
          </View>
          {/* Category Top Left Overlay */}
          <View style={styles.coverCategoryOverlay}>
            <Text style={styles.coverCategoryText}>{art.category}</Text>
          </View>
        </View>
      );
    }

    if (art.coverType === 'diet_plate') {
      return (
        <View style={[styles.coverContainer, { backgroundColor: '#F8FAFC' }]}>
          <View style={styles.dietGraphicBox}>
            <View style={styles.plateCircle}>
              <Text style={{ fontSize: 24 }}>🥗</Text>
            </View>
            <View style={styles.forkIcon}>
              <Text style={{ fontSize: 18 }}>🍴</Text>
            </View>
          </View>
          {/* Category Top Left Overlay */}
          <View style={styles.coverCategoryOverlay}>
            <Text style={styles.coverCategoryText}>{art.category}</Text>
          </View>
        </View>
      );
    }

    if (art.coverType === 'bp_monitor') {
      return (
        <View style={[styles.coverContainer, { backgroundColor: '#F1F5F9' }]}>
          <View style={styles.bpGraphicBox}>
            <Icon name="heart" size={28} color="#0F4C81" />
            <Text style={styles.bpGraphicText}>OMRON BP 120/80</Text>
          </View>
          {/* Category Top Left Overlay */}
          <View style={styles.coverCategoryOverlay}>
            <Text style={styles.coverCategoryText}>{art.category}</Text>
          </View>
        </View>
      );
    }

    // Default Veggies / Healthy Nutrition
    return (
      <View style={[styles.coverContainer, { backgroundColor: '#FEF3C7' }]}>
        <View style={styles.veggiesGraphicBox}>
          <Text style={{ fontSize: 20 }}>🥬 🍅 🫑 🥒</Text>
          <Text style={styles.veggiesLabel}>spinach • bell peppers • tomatoes</Text>
        </View>
        {/* Category Top Left Overlay */}
        <View style={styles.coverCategoryOverlay}>
          <Text style={styles.coverCategoryText}>{art.category}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Matching Image 3 */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View style={styles.doctorKnowledgeBadge}>
              <Text style={styles.doctorKnowledgeText}>DOCTOR KNOWLEDGE BASE</Text>
            </View>
          </View>
          <Text style={styles.headerMainTitle}>Health Articles & Medical Advice</Text>
          <Text style={styles.headerSubtitle}>
            Publish medical insights, health guidance, and seasonal disease advice for your patients.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnAddNewArticle}
          onPress={handleOpenAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.btnAddNewArticleText}>Add New Article</Text>
          <Icon name="plus" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. Articles Cards Grid (Image 3 Replica) */}
      <View style={styles.articlesGrid}>
        {articles.map((art) => (
          <View key={art.id} style={styles.image3ArticleCard}>
            {/* Cover Banner with Category Pill */}
            {renderCardCover(art)}

            {/* Meta Line: Date (Left) & Read Time (Right) */}
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardDateText}>{art.publishDate}</Text>
              <Text style={styles.cardReadTimeText}>{art.readTime}</Text>
            </View>

            {/* Article Title */}
            <TouchableOpacity
              onPress={() => setSelectedArticle(art)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitleText}>{art.title}</Text>
            </TouchableOpacity>

            {/* Excerpt */}
            <Text style={styles.cardExcerptText} numberOfLines={2}>
              {art.excerpt}
            </Text>

            {/* Bottom Action Buttons: Edit (Outline) & Delete (Red Outline) */}
            <View style={styles.cardBottomActions}>
              <TouchableOpacity
                style={styles.btnEditArticle}
                onPress={() => handleOpenEdit(art)}
                activeOpacity={0.75}
              >
                <Icon name="token" size={12} color="#334155" />
                <Text style={styles.btnEditText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnDeleteArticle}
                onPress={() => handleDelete(art.id, art.title)}
                activeOpacity={0.75}
              >
                <Icon name="trash" size={12} color="#DC2626" />
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* 3. Modal: Add / Edit Article Form (Exact Required Fields) */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>
                  {editingArticle ? 'Edit Medical Article' : 'Author New Health Article'}
                </Text>
                <Text style={styles.modalSheetSub}>
                  Publish clinical guidance to Janseva Arogyam Knowledge Base
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                style={styles.sheetCloseBtn}
              >
                <Icon name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Field 1: Article Title * */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Article Title *</Text>
                <TextInput
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="eg Managing Hypertension and BP Control in Summers"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInputField}
                />
              </View>

              {/* Field 2: Specialty Category */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Specialty Category</Text>
                <View style={styles.categoryPillsWrap}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setFormCategory(cat)}
                      style={[
                        styles.catOptionPill,
                        formCategory === cat && styles.catOptionPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          formCategory === cat && styles.catOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Field 3: Estimated Read Time (Mins) */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Estimated Read Time (Mins)</Text>
                <TextInput
                  value={formReadTime}
                  onChangeText={setFormReadTime}
                  placeholder="5"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={styles.formInputField}
                />
              </View>

              {/* Field 4: Short Excerpt / Summary * */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Short Excerpt / Summary *</Text>
                <TextInput
                  value={formExcerpt}
                  onChangeText={setFormExcerpt}
                  placeholder="Brief 1-2 sentence preview for patient cards..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  style={[styles.formInputField, styles.textareaShort]}
                />
              </View>

              {/* Field 5: Full Medical Article Content */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Full Medical Article Content</Text>
                <TextInput
                  value={formContent}
                  onChangeText={setFormContent}
                  placeholder="Detailed health recommendations, precautions, and dietary guidance..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={5}
                  style={[styles.formInputField, styles.textareaLong]}
                />
              </View>

              {/* Field 6: Upload Cover Image * */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Upload Cover Image *</Text>
                <TouchableOpacity
                  style={styles.uploadCoverBox}
                  onPress={() => {
                    const types: HealthArticle['coverType'][] = [
                      'veggies',
                      'diet_plate',
                      'hygiene',
                      'bp_monitor',
                    ];
                    const next =
                      types[(types.indexOf(formCoverType) + 1) % types.length];
                    setFormCoverType(next);
                    setHasUploadedCover(true);
                    Alert.alert('Cover Selected', `Selected theme: ${next.replace('_', ' ')}`);
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="camera" size={20} color="#0F766E" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.uploadTitle}>
                      {hasUploadedCover
                        ? `Cover Selected: ${formCoverType.replace('_', ' ').toUpperCase()}`
                        : 'Tap to browse / upload cover image'}
                    </Text>
                    <Text style={styles.uploadSub}>
                      JPG, PNG or SVG medical cover banner (Tap to toggle preset)
                    </Text>
                  </View>
                  <Badge label="CHOOSE" variant="primary" size="sm" />
                </TouchableOpacity>
              </View>

              {/* Save / Publish Button */}
              <TouchableOpacity
                style={styles.btnSubmitArticle}
                onPress={handleSaveArticle}
                activeOpacity={0.85}
              >
                <Text style={styles.btnSubmitArticleText}>
                  {editingArticle ? 'Save Changes' : 'Publish Article to Portal'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Full Article Reader Modal */}
      {selectedArticle && (
        <Modal
          visible={!!selectedArticle}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedArticle(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <View style={{ flex: 1 }}>
                  <Badge
                    label={selectedArticle.category}
                    variant="primary"
                    size="sm"
                  />
                  <Text style={styles.modalSheetTitle} numberOfLines={2}>
                    {selectedArticle.title}
                  </Text>
                  <Text style={styles.modalSheetSub}>
                    {selectedArticle.publishDate} • {selectedArticle.readTime}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedArticle(null)}
                  style={styles.sheetCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.sheetBody}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Author Strip */}
                <View style={styles.articleAuthorBox}>
                  <View style={styles.authorAvatarCircle}>
                    <Icon name="doctor" size={16} color="#0F766E" />
                  </View>
                  <View>
                    <Text style={styles.authorNameText}>{selectedArticle.author}</Text>
                    <Text style={styles.authorRoleText}>{selectedArticle.authorRole}</Text>
                  </View>
                </View>

                {/* Excerpt Box */}
                <View style={styles.excerptHighlightBox}>
                  <Text style={styles.excerptHighlightText}>{selectedArticle.excerpt}</Text>
                </View>

                {/* Full Content */}
                <Text style={styles.articleFullBodyText}>{selectedArticle.content}</Text>
              </ScrollView>

              <View style={styles.readerFooter}>
                <Button
                  title="Share Medical Advice"
                  onPress={() => handleShare(selectedArticle)}
                  variant="outline"
                  size="md"
                  icon="share"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Done"
                  onPress={() => setSelectedArticle(null)}
                  variant="primary"
                  size="md"
                  style={{ flex: 0.7 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  doctorKnowledgeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  doctorKnowledgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  btnAddNewArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  btnAddNewArticleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  articlesGrid: {
    gap: 12,
  },
  image3ArticleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  coverContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  coverCategoryOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  coverCategoryText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  hygieneGraphicBox: {
    padding: 10,
    alignItems: 'center',
  },
  hygieneHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hygieneSub: {
    fontSize: 8.5,
    color: '#E0F2FE',
    textAlign: 'center',
    marginTop: 2,
  },
  hygieneCatch: {
    fontSize: 8,
    color: '#BAE6FD',
    textAlign: 'center',
    marginTop: 2,
  },
  dietGraphicBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  forkIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpGraphicBox: {
    alignItems: 'center',
    gap: 4,
  },
  bpGraphicText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F4C81',
  },
  veggiesGraphicBox: {
    alignItems: 'center',
    gap: 4,
  },
  veggiesLabel: {
    fontSize: 9,
    color: '#78350F',
    fontWeight: '600',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDateText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  cardReadTimeText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardExcerptText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
  },
  cardBottomActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnEditArticle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  btnDeleteArticle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnDeleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  modalSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSheetSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },
  formInputField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  textareaShort: {
    height: 60,
    textAlignVertical: 'top',
  },
  textareaLong: {
    height: 110,
    textAlignVertical: 'top',
  },
  categoryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catOptionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catOptionPillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  catOptionText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
  },
  catOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadCoverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 10,
  },
  uploadTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  uploadSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  btnSubmitArticle: {
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSubmitArticleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  articleAuthorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  authorAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorRoleText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  excerptHighlightBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  excerptHighlightText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 16,
  },
  articleFullBodyText: {
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 20,
  },
  readerFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
