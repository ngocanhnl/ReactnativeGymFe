import { ActivityIndicator, FlatList, Image, TouchableOpacity, View, StyleSheet } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import * as React from 'react';
import { ScrollView, Text } from 'react-native';
import { List, Checkbox, Card, Avatar, Divider, IconButton, Button, Surface, useTheme } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Sample dữ liệu lộ trình khóa học (giống trang 28tech.com.vn)
const roadmapData = [
  {
    title: 'Chương 1: Giới thiệu về Cơ sở dữ liệu',
    lessons: [
      { id: '1-1', title: 'Bài 1 - Giới thiệu cơ sở dữ liệu', done: true },
      { id: '1-2', title: 'Bài 2 - Các hệ quản trị CSDL phổ biến', done: false },
      { id: '1-3', title: 'Bài 3 - Kiến trúc của hệ quản trị CSDL', done: false }
    ]
  },
  {
    title: 'Chương 2: Ngôn ngữ truy vấn SQL cơ bản',
    lessons: [
      { id: '2-1', title: 'Bài 1 - Giới thiệu SQL, tạo bảng, kiểu dữ liệu', done: false },
      { id: '2-2', title: 'Bài 2 - Thêm, sửa, xóa dữ liệu', done: false },
      { id: '2-3', title: 'Bài 3 - Truy vấn dữ liệu (SELECT, WHERE)', done: false },
      { id: '2-4', title: 'Bài 4 - Sắp xếp, phân trang, tìm kiếm', done: false }
    ]
  },
  {
    title: 'Chương 3: Các thao tác nâng cao trong SQL',
    lessons: [
      { id: '3-1', title: 'Bài 1 - Quan hệ giữa các bảng (JOIN)', done: false },
      { id: '3-2', title: 'Bài 2 - Lồng truy vấn (Subquery)', done: false },
      { id: '3-3', title: 'Bài 3 - Hàm tổng hợp, GROUP BY, HAVING', done: false }
    ]
  },
  {
    title: 'Chương 4: Quản trị và bảo mật cơ sở dữ liệu',
    lessons: [
      { id: '4-1', title: 'Bài 1 - Người dùng và phân quyền', done: false },
      { id: '4-2', title: 'Bài 2 - Backup & Restore, Transaction', done: false }
    ]
  }
];

export default function Lessons({ route }) {
  const theme = useTheme();
  const nav = useNavigation();
  const [expanded, setExpanded] = React.useState([]);
  const courseId = route.params?.courseId;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseDetail, setCourseDetails] = useState();
  const [user, setUser] = useState();
  const { width } = useWindowDimensions();
  const [completedLessons, setCompletedLessons] = useState([]);
  let token = "";

  const loadLessons = async () => {
    token = await AsyncStorage.getItem('token');
    try {
      setLoading(true);
      let res = await Apis.get(endpoints['lessons'](courseId));
      setLessons(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const ownerCourse = async()=>{
    try {
      setLoading(true);
      let u = await AsyncStorage.getItem('user-detail');
      u = JSON.parse(u);
      console.log('userOun', u)
      setUser(u)
      let res = await Apis.get(endpoints['course-detail'](courseId));
      console.info('setCourseDetails', res.data)
      setCourseDetails(res.data);

      console.info(user?.id )
      console.info(courseDetail?.teacher?.id )
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons();
    ownerCourse();
  }, [courseId]);

  useEffect(() => {
    if (lessons.length > 0) {
      const completed = lessons
        .filter(lesson => lesson.is_done)
        .map(lesson => lesson.id);
      setCompletedLessons(completed);
    }
  }, [lessons]);

  const handlePress = (i) => {
    setExpanded((prev) =>
      prev.includes(i) ? prev.filter((idx) => idx !== i) : [...prev, i]
    );
  };

  const toggleComplete = async(lessonId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      let u = await authApis(token).post(endpoints['lesson-done'](lessonId));
      setCompletedLessons((prev) =>
        prev.includes(lessonId)
          ? prev.filter(id => id !== lessonId)
          : [...prev, lessonId]
      );
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Course Progress Section */}
      <Surface style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Tiến độ khóa học</Text>
          <Text style={styles.progressPercentage}>
            {Math.round((completedLessons.length / lessons.length) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              {width: `${(completedLessons.length / lessons.length) * 100}%`}
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completedLessons.length} / {lessons.length} bài học hoàn thành
        </Text>
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          icon="chat"
          onPress={() => nav.navigate('chat', { groupId: courseId })}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          Vào nhóm chat
        </Button>
        <Button
          mode="contained"
          icon="newspaper"
          onPress={() => nav.navigate('newfeeds', { courseId: courseId })}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          New feed
        </Button>
      </View>

      {/* Students Section (for teachers) */}
      {user?.id === courseDetail?.teacher?.id && (
        <Card style={styles.studentsCard}>
          <List.Accordion
            title="Danh sách học viên"
            left={props => <List.Icon {...props} icon="account-group" />}
            style={styles.accordion}
          >
            {courseDetail?.students && courseDetail?.students.length > 0 ? (
              courseDetail.students.map((student, index) => (
                <View key={student.id || index} style={styles.studentItem}>
                  <View style={styles.studentInfo}>
                    <Avatar.Image 
                      size={40} 
                      source={{ uri: student.avatar || 'https://via.placeholder.com/40' }} 
                    />
                    <Text style={styles.studentName}>{student.first_name} {student.last_name}</Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => nav.navigate('apointment', {
                      student_id: student.id,
                      teacher_id: user.id,
                      token: token
                    })}
                    style={styles.scheduleButton}
                  >
                    Đặt lịch
                  </Button>
                </View>
              ))
            ) : (
              <Text style={styles.noStudents}>Chưa có học viên nào</Text>
            )}
          </List.Accordion>
        </Card>
      )}

      {/* Lessons List */}
      <Card style={styles.lessonsCard}>
        <Card.Title title="Lộ trình khóa học" left={(props) => <List.Icon {...props} icon="book-open-variant" />} />
        <Card.Content>
          {lessons.map((lesson, i) => (
            <View key={`lesson-${lesson.id}`} style={styles.lessonItem}>
              <List.Item
                title={`Bài ${i + 1}: ${lesson.title}`}
                description={lesson.description}
                left={props => (
                  <TouchableOpacity
                    onPress={() => {
                      if (user?.id === courseDetail?.teacher?.id) {
                        toggleComplete(lesson.id);
                      }
                    }}
                  >
                    <List.Icon
                      {...props}
                      icon={completedLessons.includes(lesson.id) ? "check-circle" : "circle-outline"}
                      color={completedLessons.includes(lesson.id) ? theme.colors.primary : theme.colors.disabled}
                    />
                  </TouchableOpacity>
                )}
                right={props => (
                  <List.Icon
                    {...props}
                    icon={expanded.includes(i) ? "chevron-up" : "chevron-down"}
                  />
                )}
                onPress={() => handlePress(i)}
                style={[
                  styles.lessonListItem,
                  expanded.includes(i) && styles.expandedLesson
                ]}
              />
              {expanded.includes(i) && (
                <View style={styles.lessonContent}>
                  <RenderHtml
                    contentWidth={width - 32}
                    source={{ html: lesson.content }}
                  />
                </View>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  studentsCard: {
    margin: 16,
    marginTop: 0,
  },
  accordion: {
    backgroundColor: '#fff',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    marginLeft: 12,
    fontSize: 16,
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
  },
  noStudents: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  lessonsCard: {
    margin: 16,
    marginTop: 0,
  },
  lessonItem: {
    marginBottom: 8,
  },
  lessonListItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
  },
  expandedLesson: {
    backgroundColor: '#f8f9fa',
  },
  lessonContent: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});