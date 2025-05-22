
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
        const renderRating = () => {
          const stars = [];
          const fullStars = Math.floor(course.rating);
          const hasHalf = course.rating % 1 >= 0.5;
          for (let i = 0; i < fullStars; i++) {
            stars.push(<IconButton key={`f${i}`} icon="star" size={20} iconColor="#FFD700" />);
          }
          if (hasHalf) {
            stars.push(<IconButton key="half" icon="star-half" size={20} iconColor="#FFD700" />);
          }
          while (stars.length < 5) {
            stars.push(<IconButton key={`e${stars.length}`} icon="star-outline" size={20} iconColor="#FFD700" />);
          }
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              {stars}
              <Text>({course.reviewsCount} đánh giá)</Text>
            </View>
          );
        };
      
        const renderCourseImages = () => (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Hình ảnh khóa học</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {courseImages.map((uri, idx) => (
                <Card key={idx} style={{ width: 180, marginRight: 12 }}>
                  <Card.Cover source={{ uri }} />
                </Card>
              ))}
            </ScrollView>
          </View>
        );
      
        const renderLessonList = () => (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Danh sách bài học</Text>
            {lessons.map((lesson, index) => (
              <List.Item
                key={index}
                title={`${index + 1}. ${lesson.title}`}
                left={() => <List.Icon icon="play-circle" />}
              />
            ))}
          </View>
        );
      
        const renderComments = () => (
          <View style={{ padding: 16 }}>
            {/* <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Bình luận học viên</Text>
            {commentList.map(c => (
              <View key={c.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Avatar.Image size={40} source={{ uri: c.avatar }} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontWeight: 'bold' }}>{c.name}</Text>
                  <Paragraph>{c.content}</Paragraph>
                  <Text style={{ fontSize: 12, color: 'gray' }}>{c.time}</Text>
                </View>
              </View>
            ))} */}
          </View>
        );
        // if (loading || !user || !courseDetails) {
        //   return (
        //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //       <Text>Đang tải dữ liệu...</Text>
        //     </View>
        //   );
        // }
        
      
        return (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={{ paddingBottom: COMMENT_INPUT_HEIGHT + 16 }}
            >
              <Card>
                <Card.Cover source={{ uri: courseDetails?.image||'Anh' }} />
                <Card.Content>
                  <Title style={{ fontSize: 24, marginTop: 12 }}>{courseDetails?.name||'kdkfnd'}</Title>
                  {renderRating()}
                  <Paragraph style={{ fontSize: 16, marginTop: 10 }}>{ courseDetails?.description||'des'}</Paragraph>
                  <Divider style={{ marginVertical: 12 }} />
                  <Text style={{ fontSize: 16 }}>
                    👩‍🏫 Giảng viên: <Text style={{ fontWeight: 'bold' }}>'GV'</Text>
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    🕒 Thời lượng: <Text style={{ fontWeight: 'bold' }}>14</Text> (buổi)
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    📅 Khai giảng: <Text style={{ fontWeight: 'bold' }}>{courseDetails?.start_date||'Ngay bd'}</Text>
                  </Text>
                  <Text style={{ fontSize: 16, marginTop: 4 }}>
                    📅 Ket thuc: <Text style={{ fontWeight: 'bold' }}>{courseDetails?.end_date||'Ngay kt'}</Text>
                  </Text>
                </Card.Content>
              
                {/* <Card.Actions style={{ justifyContent: 'center', marginTop: 10 }}>
                  <Button
                    mode="contained"
                    icon="book-check"
                    onPress={
                      checkUserExists(user?.id, students)
                        ? null
                        : async () => {
                            try {
                              await AsyncStorage.setItem('courseID', courseId);
                              nav.navigate('payment', {
                                amount: courseDetails?.price,
                                courseId: courseId,
                              });
                            } catch (err) {
                              console.error('Lỗi khi thêm học viên:', err);
                              Alert.alert('Lỗi', 'Không thể đăng ký khóa học. Vui lòng thử lại.');
                            }
                          }
                    }
                    disabled={checkUserExists(user?.id, students)}
                    contentStyle={{ paddingHorizontal: 20, paddingVertical: 5 }}
                  >
                    {checkUserExists(user?.id, students) ? 'Đã mua' : 'Đăng ký ngay'}
                  </Button>
                </Card.Actions> */}
                <Card.Actions style={{ justifyContent: 'center', marginTop: 10 }}>
                <Button
                  mode="contained"
                  icon="book-check"
                  onPress={async () => {
                    if (!user) {
                      nav.navigate('login'); // Chuyển đến màn hình đăng nhập nếu chưa đăng nhập
                      return;
                    }

                    if (checkUserExists(user?.id, students)) {
                      return; // Không làm gì nếu người dùng đã mua khóa học
                    }

                    try {
                      await AsyncStorage.setItem('courseID', courseId.toString()); // Lưu courseID nếu cần
                      nav.navigate('payment', {
                        amount: courseDetails?.price,
                        courseId: courseId,
                      });
                    } catch (err) {
                      console.error('Lỗi khi thêm học viên:', err);
                      Alert.alert('Lỗi', 'Không thể đăng ký khóa học. Vui lòng thử lại.');
                    }
                  }}
                  disabled={checkUserExists(user?.id, students)}
                  contentStyle={{ paddingHorizontal: 20, paddingVertical: 5 }}
                >
                  {checkUserExists(user?.id, students) ? 'Đã mua' : 'Đăng ký ngay'}
                </Button>
              </Card.Actions>

              </Card>
      
              <Divider style={{ marginVertical: 16 }} />
              {renderCourseImages()}
              <Divider style={{ marginVertical: 16 }} />
              {renderLessonList()}
              <Divider style={{ marginVertical: 16 }} />
              {renderComments()}
            </ScrollView>
      
            {/* Khung nhập bình luận cố định */}
            <View style={styles.commentInputContainer}>
              <View style={styles.inputRow}>
                <RNTextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Nhập bình luận của bạn..."
                  style={styles.textInput}
                />
                <Button icon="send" mode="contained" onPress={handleSendComment}>
                  Gửi
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        );
}











export default LessonDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: COMMENT_INPUT_HEIGHT,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
});