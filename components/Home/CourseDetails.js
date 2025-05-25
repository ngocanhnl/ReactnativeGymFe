import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  TextInput as RNTextInput,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Divider,
  IconButton,
  Avatar,
  useTheme,
  List,
  Surface,
} from 'react-native-paper';

const COMMENT_INPUT_HEIGHT = 56;

const LessonDetails = ({ route }) => {
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true); // Theo dõi trạng thái tải
    const [error, setError] = useState(null); // Theo dõi lỗi
    const [lessons, setLessons] = useState([]);
    const [students, setStudents] = useState()
    const courseId = route.params?.courseId;
    let course = {}
    const nav = useNavigation();
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    
    console.log("User Course detail", user)
    // console.log('param', route.params);
    const loadLessons = async () => {
      try {
        const res = await Apis.get(endpoints['lessons'](courseId));
        console.log('res', res.data);
        setLessons(res.data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết khóa học:', err);
        setError('Không thể tải chi tiết khóa học.');
      } 
    }
    const loadCourseDetails = async () => {
      
      try {
        const res = await Apis.get(endpoints['course-detail'](courseId));
        loadLessons()
        setCourseDetails(res.data);
        setStudents(res.data.students)
        console.log("student", res.data.students)
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false); // Đánh dấu đã xong
      }
          
       
    };

    function checkUserExists(userId, userList) {
      return userList?.some(user => user?.id === userId);
    }
    

    useEffect(() => {
      loadCourseDetails()
      
    }, [courseId]);
    console.log('lesson',lessons)
    console.log('userAdd', user)
    // console.log('courseId',courseDetails);
    console.log('courseDetails',courseDetails);
        const theme = useTheme();
        const scrollRef = useRef(null);
      
        // Dữ liệu khóa học
        // const addStudent = async ()=>{
        //   const token = await AsyncStorage.getItem('token');
        //   // console.log('token', token)
        //   let u = await authApis(token).post(endpoints['add-student'](courseId));
        //   // console.info('Add Student',u.data);
      


        // }
      
        const courseImages = [
          'https://source.unsplash.com/600x400/?yoga',
          'https://source.unsplash.com/600x400/?meditation',
          'https://source.unsplash.com/600x400/?stretching',
        ];
      
     
      
        const initialComments = [
          {
            id: 1,
            name: 'Thu Hằng',
            avatar: 'https://i.pravatar.cc/150?img=7',
            content: 'Cô giáo dạy rất dễ hiểu và nhiệt tình. Cảm thấy cơ thể nhẹ nhõm hơn nhiều!',
            time: '3 ngày trước',
          },
          {
            id: 2,
            name: 'Hoàng Minh',
            avatar: 'https://i.pravatar.cc/150?img=8',
            content: 'Bài học được sắp xếp khoa học, phù hợp với người mới. Rất hài lòng!',
            time: '1 tuần trước',
          },
        ];
      
        // State
        const [commentText, setCommentText] = useState('');
        const [commentList, setCommentList] = useState(initialComments);
      
        // Thêm comment mới
        const handleSendComment = () => {
          const text = commentText.trim();
          if (!text) return;
      
          const newComment = {
            id: Date.now(),
            name: 'Bạn',
            avatar: 'https://i.pravatar.cc/150?u=me',
            content: text,
            time: 'Vừa xong',
          };
          setCommentList(prev => [...prev, newComment]);
          setCommentText('');
      
          // Cuộn về cuối sau khi thêm
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        };
      
        // Render các phần
        const renderHeader = () => (
          <View style={styles.headerContainer}>
            <Image 
              source={{ uri: courseDetails?.image }} 
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.headerOverlay}>
              <View style={styles.headerContent}>
                <Text style={styles.courseTitle}>{courseDetails?.name}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        icon="star"
                        size={16}
                        iconColor="#FFD700"
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>4.5 (120 đánh giá)</Text>
                </View>
                <View style={styles.instructorContainer}>
                  <Avatar.Image 
                    size={40} 
                    source={{ uri: courseDetails?.teacher?.avatar || 'https://i.pravatar.cc/150' }} 
                  />
                  <View style={styles.instructorInfo}>
                    <Text style={styles.instructorName}>{courseDetails?.teacher?.first_name || 'Giảng viên'}</Text>
                    <Text style={styles.instructorTitle}>Giảng viên chính</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
        const renderPriceSection = () => (
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              {courseDetails?.best_active_discount ? (
                <>
                  <Text style={styles.originalPrice}>
                    {courseDetails.price.toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.discountedPrice}>
                    {(courseDetails.price * (1 - courseDetails.best_active_discount.discount_percentage/100)).toLocaleString('vi-VN')}đ
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{courseDetails.best_active_discount.discount_percentage}%
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.price}>
                  {courseDetails?.price?.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </View>
            <Button
              mode="contained"
              icon="book-check"
              onPress={async () => {
                if (!user) {
                  nav.navigate('login');
                  return;
                }
                if (checkUserExists(user?.id, students)) return;
                try {
                  await AsyncStorage.setItem('courseID', courseId.toString());
                  nav.navigate('payment', {
                    amount: courseDetails?.price,
                    discount: courseDetails?.best_active_discount?.discount_percentage,
                    courseId: courseId,
                  });
                } catch (err) {
                  console.error('Lỗi khi thêm học viên:', err);
                  Alert.alert('Lỗi', 'Không thể đăng ký khóa học. Vui lòng thử lại.');
                }
              }}
              disabled={checkUserExists(user?.id, students)}
              style={styles.enrollButton}
              contentStyle={styles.enrollButtonContent}
            >
              {checkUserExists(user?.id, students) ? 'Đã đăng ký' : 'Đăng ký ngay'}
            </Button>
          </View>
        );
      
        const renderCourseInfo = () => (
          <View style={styles.infoSection}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <IconButton icon="clock-outline" size={24} color="#666" />
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{lessons.length} bài học</Text>
              </View>
              <View style={styles.infoItem}>
                <IconButton icon="account-group-outline" size={24} color="#666" />
                <Text style={styles.infoLabel}>Học viên</Text>
                <Text style={styles.infoValue}>{courseDetails?.students?.length || 0}</Text>
              </View>
              <View style={styles.infoItem}>
                <IconButton icon="calendar-outline" size={24} color="#666" />
                <Text style={styles.infoLabel}>Khai giảng</Text>
                <Text style={styles.infoValue}>{courseDetails?.start_date}</Text>
              </View>
              <View style={styles.infoItem}>
                <IconButton icon="calendar-check-outline" size={24} color="#666" />
                <Text style={styles.infoLabel}>Kết thúc</Text>
                <Text style={styles.infoValue}>{courseDetails?.end_date}</Text>
              </View>
            </View>
          </View>
        );
      
        const renderInstructorSection = () => (
          <Surface style={styles.instructorSection}>
            <View style={styles.instructorHeader}>
              <Text style={styles.sectionTitle}>Giảng viên</Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => {
                  // Navigate to instructor details
                  if (courseDetails?.teacher) {
                    nav.navigate('infoTeacher', { instructor: courseDetails.teacher });
                  }
                }}
              />
            </View>
            <View style={styles.instructorContent}>
              <Avatar.Image 
                size={80} 
                source={{ uri: courseDetails?.teacher?.avatar || 'https://i.pravatar.cc/150' }} 
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{courseDetails?.teacher?.first_name || 'Giảng viên'}</Text>
                <Text style={styles.instructorTitle}>Giảng viên chính</Text>
                <Text style={styles.instructorBio} numberOfLines={2}>
                  {courseDetails?.teacher?.bio || 'Chưa có thông tin chi tiết về giảng viên'}
                </Text>
                <View style={styles.instructorStats}>
                  <View style={styles.statItem}>
                    <IconButton icon="account-group" size={20} color="#666" />
                    <Text style={styles.statText}>{courseDetails?.students?.length || 0} học viên</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconButton icon="star" size={20} color="#FFD700" />
                    <Text style={styles.statText}>4.8/5.0</Text>
                  </View>
                </View>
              </View>
            </View>
          </Surface>
        );
      
        const renderLessonList = () => (
          <View style={styles.lessonSection}>
            <Text style={styles.sectionTitle}>Nội dung khóa học</Text>
            <View style={styles.lessonList}>
              {lessons.map((lesson, index) => (
                <Surface key={index} style={styles.lessonItem}>
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description || 'Chưa có mô tả'}
                    </Text>
                  </View>
                  <IconButton
                    icon="chevron-right"
                    size={24}
                    onPress={() => {
                      // Handle lesson click
                    }}
                  />
                </Surface>
              ))}
            </View>
          </View>
        );
      
        return (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              {renderHeader()}
              {renderPriceSection()}
              {renderCourseInfo()}
              {renderInstructorSection()}
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
                <Text style={styles.descriptionText}>
                  {courseDetails?.description}
                </Text>
              </View>
              {renderLessonList()}
            </ScrollView>
          </KeyboardAvoidingView>
        );
}

export default LessonDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  headerContent: {
    padding: 20,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorInfo: {
    marginLeft: 12,
  },
  instructorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructorTitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  priceSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 18,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e53935',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  discountBadge: {
    backgroundColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  enrollButton: {
    width: '100%',
    borderRadius: 8,
  },
  enrollButtonContent: {
    paddingVertical: 8,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  lessonSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  lessonList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructorSection: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  instructorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  instructorContent: {
    padding: 16,
    flexDirection: 'row',
  },
  instructorAvatar: {
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  instructorStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});