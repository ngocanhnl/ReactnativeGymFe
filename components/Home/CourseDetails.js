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
  ActivityIndicator,
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
    const [refreshing, setRefreshing] = useState(false);

  



    // State
    const [commentText, setCommentText] = useState('');
    const [commentList, setCommentList] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToReply, setReplyingToReply] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [next, setNext] = useState()
    const commentsPerPage = 5;


    

    const loadLessons = async () => {
      try {
        const res = await Apis.get(endpoints['lessons'](courseId));

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

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false); // Đánh dấu đã xong
      }
          
       
    };

    function checkUserExists(userId, userList) {
      return userList?.some(user => user?.id === userId);
    }

    const loadComments = async () => {
      try {
        setLoadingComments(true);
        
 
        let url = `${endpoints['comment'](courseId)}?page=${page}`;
 

        const response = await Apis.get(url);
        
   

        // Chuyển đổi dữ liệu thành cấu trúc phân cấp
        const comments = response.data.results || [];

        const commentMap = {};
        const rootComments = [];

        // Tạo map các comment theo id
        comments.forEach(comment => {
          commentMap[comment.id] = {
            ...comment,
            replies: []
          };
        });

        // Sắp xếp comment vào cấu trúc phân cấp
        comments.forEach(comment => {
          if (comment.parent === null) {
            rootComments.push(commentMap[comment.id]);
          } else {
            const parentComment = commentMap[comment.parent.id];
            if (parentComment) {
              parentComment.replies.push(commentMap[comment.id]);
            }
          }
        });

        setCommentList([...commentList, ...rootComments]);
      
        // setCommentList(rootComments);
        if (response.data.next === null)
          setHasMoreComments(false)
      } catch (error) {
        console.error('Error loading comments:', error);
        setCommentList([]);
      } finally {
        setLoadingComments(false);
      }
    };
    const loadMore = () => {
      if (!loading && page > 0){

        setPage(page + 1);
      }
        
    }
    

    useEffect(() => {
      loadCourseDetails()
      
     
    }, [courseId]);
    useEffect( () => {
      loadComments();
       const t = setTimeout(() => {
          console.log("comment");
        }, 1000);

         return () => clearTimeout(t);
    },[page])
    // console.log('lesson',lessons)
    // console.log('userAdd', user)
    console.log('courseId',courseDetails);
    // console.log('courseDetails',courseDetails);
        const theme = useTheme();
        const scrollRef = useRef(null);
      
    

        
        const loadMoreComments = async () => {
          if (loadingComments || !hasMoreComments) return;
          
          setLoadingComments(true);
          try {
          
            
            // setCommentList(prev => [...prev, ...newComments]);
            setPage(prev => prev + 1);
          } catch (error) {
            console.error('Error loading more comments:', error);
          } finally {
            setLoadingComments(false);
          }
        };

        const handleReply = (commentId, replyId = null) => {
          setReplyingTo(commentId);
          setReplyingToReply(replyId);
        };

        const handleSendComment = async (text, parentId = null) => {
          if (!text.trim()) return;

          try {
            console.log("parentId", parentId)
            const token = await AsyncStorage.getItem('token');
            if(!token){
              nav.navigate('login')
              return;
            }
            const response = await authApis(token).post(endpoints['comment'](courseId), {
              content: text,
              parent: parentId,
              user: user.id
            });

            if (response.data) {
              if (parentId) {
                // Nếu là reply, thêm vào replies của comment cha
                setCommentList(prev => prev.map(comment => {
                  if (comment.id === parentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), response.data]
                    };
                  }
                  return comment;
                }));
                setReplyText('');
              } else {
                // Nếu là comment mới, thêm vào đầu danh sách
                setCommentList(prev => [response.data, ...prev]);
                setCommentText('');
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }

              // Reset các state
              setReplyingTo(null);
              setReplyingToReply(null);
            }
          } catch (error) {
            console.error('Error sending comment:', error);
            Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
          }
        };

        const handleSendReply = () => {
          if (!replyText.trim() || !replyingTo) return;
          handleSendComment(replyText, replyingTo);
        };

        const renderReplyRecursive = (reply, commentId) => {
          const isReplying = replyingTo === commentId && replyingToReply === reply.id;

          return (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.replyHeader}>
                <Avatar.Image 
                  size={32} 
                  source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} 
                />
                <View style={styles.replyInfo}>
                  <Text style={styles.replyName}>{user?.first_name || 'Người dùng'}</Text>
                  <Text style={styles.replyTime}>{formatDate(reply.created_at)}</Text>
                </View>
              </View>

              <Text style={styles.replyContent}>{reply.content}</Text>

              <View style={styles.replyButtonContainer}>
                <IconButton
                  icon="reply"
                  size={16}
                  onPress={() => handleReply(commentId, reply.id)}
                  style={styles.replyButton}
                />
                <Text style={styles.replyButtonText}>Trả lời</Text>
              </View>

              {isReplying && (
                <View style={styles.nestedReplyInputContainer}>
                  <RNTextInput
                    style={styles.replyInput}
                    placeholder="Viết câu trả lời..."
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <IconButton
                    icon="send"
                    size={20}
                    onPress={handleSendReply}
                    disabled={!replyText.trim()}
                    style={styles.sendReplyButton}
                  />
                </View>
              )}

              {reply.replies && reply.replies.length > 0 && (
                <View style={styles.nestedRepliesContainer}>
                  {reply.replies.map((childReply) =>
                    renderReplyRecursive(childReply, commentId)
                  )}
                </View>
              )}
            </View>
          );
        };

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

        const getTimePeriod = (time) => {
          const hour = parseInt(time.split(':')[0]);
          return hour < 12 ? 'sáng' : 'chiều';
        };

        const renderSessionInfo = () => {
          // Sort sessions by date and time
          const sortedSessions = [...(courseDetails?.sessions || [])].sort((a, b) => {
            // If both sessions have dates, compare dates first
            if (a.date && b.date) {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
              }
              
              // If dates are the same, compare start times
              return a.start_time.localeCompare(b.start_time);
            }
            
            // If only one session has a date, prioritize the one with date
            if (a.date) return -1;
            if (b.date) return 1;
            
            // If neither has a date, compare by start time
            return a.start_time.localeCompare(b.start_time);
          });

          return (
            <View style={styles.sessionSection}>
              <Text style={styles.sectionTitle}>Thông tin buổi học</Text>
              {sortedSessions.map((session, index) => (
                <Surface key={index} style={styles.sessionItem}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionNumber}>
                      <Text style={styles.sessionNumberText}>Buổi {index + 1}</Text>
                    </View>
                    {session.date && (
                      <Text style={styles.sessionDate}>
                        {new Date(session.date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionTime}>
                      <IconButton icon="clock-time-four-outline" size={24} color="#666" />
                      <Text style={styles.sessionTimeValue}>
                        {session.start_time.split(':').slice(0, 2).join(':')} - {session.end_time.split(':').slice(0, 2).join(':')}
                        <Text style={styles.timePeriod}> ({getTimePeriod(session.start_time)})</Text>
                      </Text>
                    </View>
                  </View>
                  {session.notes && (
                    <View style={styles.sessionNotes}>
                      <View style={styles.notesHeader}>
                        
                        <Text style={styles.notesTitle}>Ghi chú</Text>
                      </View>
                      <View style={styles.notesContent}>
                        <Text style={styles.notesValue}>{session.notes}</Text>
                      </View>
                    </View>
                  )}
                </Surface>
              ))}
            </View>
          );
        };

        const renderInstructorSection = () => (
          <Surface style={styles.instructorSection}>
            <View style={styles.instructorHeader}>
              <Text style={styles.sectionTitle}>Giảng viên</Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => {
                  if (courseDetails?.teacher) {
                    console.log("Teacher: ",courseDetails?.teacher )
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

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const now = new Date();
          const diffTime = Math.abs(now - date);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          const diffMinutes = Math.floor(diffTime / (1000 * 60));

          if (diffDays > 0) {
            return `${diffDays} ngày trước`;
          } else if (diffHours > 0) {
            return `${diffHours} giờ trước`;
          } else if (diffMinutes > 0) {
            return `${diffMinutes} phút trước`;
          } else {
            return 'Vừa xong';
          }
        };

        const renderCommentSection = () => (
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Bình luận</Text>
            
            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#666" />
              </View>
            ) : (
              <>
                {(!commentList || commentList.length === 0) ? (
                  <View style={styles.emptyStateContainer}>
                    <IconButton
                      icon="comment-outline"
                      size={48}
                      iconColor="#666"
                    />
                    <Text style={styles.emptyStateText}>Chưa có bình luận nào</Text>
                    <Text style={styles.emptyStateSubText}>Hãy là người đầu tiên bình luận về khóa học này</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.commentList}>
                      {Array.isArray(commentList) && commentList.map((comment) => (

                        <Surface key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <Avatar.Image 
                              size={40} 
                              source={{ uri: comment.user?.avatar || 'https://i.pravatar.cc/150' }} 
                            />
                            <View style={styles.commentInfo}>
                              <Text style={styles.commentName}>{comment.user?.first_name || 'Người dùng'}</Text>
                              <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                            </View>
                          </View>
                          <Text style={styles.commentContent}>{comment.content}</Text>
                          
                          <View style={styles.replyButtonContainer}>
                            <IconButton
                              icon="reply"
                              size={20}
                              onPress={() => handleReply(comment?.id)}
                              style={styles.replyButton}
                            />
                            <Text style={styles.replyButtonText}>Trả lời</Text>
                          </View>

                          {comment.replies && comment.replies.length > 0 && (
                            <View style={styles.repliesContainer}>
                              {comment.replies.map((reply) => renderReplyRecursive(reply, comment.id))}
                            </View>
                          )}

                          {replyingTo === comment.id && !replyingToReply && (
                            <View style={styles.replyInputContainer}>
                              <RNTextInput
                                style={styles.replyInput}
                                placeholder="Viết câu trả lời..."
                                value={replyText}
                                onChangeText={setReplyText}
                                multiline
                              />
                              <IconButton
                                icon="send"
                                size={20}
                                onPress={handleSendReply}
                                disabled={!replyText.trim()}
                                style={styles.sendReplyButton}
                              />
                            </View>
                          )}
                        </Surface>
                      ))}
                    </View>

                    {hasMoreComments && commentList.length > 0 && (
                      <Button
                        mode="text"
                        // onPress={loadMoreComments}
                        onPress={loadMore}
                        loading={loadingComments}
                        style={styles.loadMoreButton}
                      >
                      
                        {loadingComments ? 'Đang tải...' : 'Xem thêm bình luận'}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            <View style={styles.commentInputContainer}>
              <RNTextInput
                style={styles.commentInput}
                placeholder="Viết bình luận của bạn..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <IconButton
                icon="send"
                size={24}
                onPress={() => handleSendComment(commentText)}
                disabled={!commentText.trim()}
                style={styles.sendButton}
              />
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
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 20;
                if (layoutMeasurement.height + contentOffset.y >= 
                    contentSize.height - paddingToBottom) {
                  // loadMoreComments();
                  // loadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              {renderHeader()}
              {renderPriceSection()}
              {renderCourseInfo()}
              {renderSessionInfo()}
              {renderInstructorSection()}
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
                <Text style={styles.descriptionText}>
                  {courseDetails?.description}
                </Text>
              </View>
              {renderLessonList()}
              {renderCommentSection()}
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
  commentSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  commentList: {
    gap: 16,
    marginBottom: 16,
  },
  commentItem: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  commentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  replyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyButton: {
    margin: 0,
    marginRight: 4,
  },
  replyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  repliesContainer: {
    marginTop: 12,
    gap: 12,
  },
  replyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyInfo: {
    marginLeft: 8,
    flex: 1,
  },
  replyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  replyTime: {
    fontSize: 12,
    color: '#666',
  },
  replyContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  nestedRepliesContainer: {
    marginTop: 8,
    gap: 8,
  },
  nestedReplyItem: {
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    flex: 1,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12,
  },
  nestedReplyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendReplyButton: {
    margin: 0,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    margin: 0,
  },
  loadMoreButton: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sessionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionNumber: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  sessionNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sessionDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sessionDetails: {
    marginTop: 8,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTimeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sessionNotes: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  notesContent: {
    paddingLeft: 4,
  },
  notesValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timePeriod: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});