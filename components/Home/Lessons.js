
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View, StyleSheet } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import * as React from 'react';
import { ScrollView, Text } from 'react-native';
import { List, Checkbox } from 'react-native-paper';
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
  const nav = useNavigation();
    const [expanded, setExpanded] = React.useState([]);
    const courseId = route.params?.courseId;
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseDetail, setCourseDetails]  = useState()
    const [user, setUser] = useState()
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
                
    }
    
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
            ownerCourse()
            console.log('lessonsss',lessons)
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
        // console.log('token', token)
        let u = await authApis(token).post(endpoints['lesson-done'](lessonId));
        // console.info('lesondone', u.data)

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
    <ScrollView style={{ flex: 1, backgroundColor: '#fafbfc' }}>
    
      { user?.id == courseDetail?.teacher.id  && (
      <List.Accordion
        key={`lesson-34324`}
        title={`Thành viên`}
        left={props => <List.Icon {...props} icon="folder" />}
        style={{ backgroundColor: '#fff', marginBottom: 2 }}
      >

        {courseDetail?.students && courseDetail?.students.length > 0 ? (
      courseDetail.students.map((student, index) => (
 
      <View
    key={student.id || index}
    style={{
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri: student.avatar }}
        style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }}
      />
      <Text>{`${student.first_name} ${student.last_name} (${student.username})`}</Text>
    </View>
    <TouchableOpacity
      onPress={() => {
        nav.navigate('apointment',{
          student_id: student.id,
          teacher_id: user.id,
          token: token
        })
        // Xử lý khi nhấn "Đặt lịch"
        console.log('Đặt lịch cho', student.username);
      }}
      style={{
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
      }}
    >
      <Text style={{ color: '#fff' }}>Đặt lịch</Text>
    </TouchableOpacity>
  </View>
      
    ))
  ) : (
    <Text style={{ padding: 16, fontStyle: 'italic' }}>Không có thành viên.</Text>
  )}
      </List.Accordion>
      
    )}
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 10 }}>
    <TouchableOpacity
      onPress={() => {
        nav.navigate('chat', {
          groupId: courseId,
        });
      }}
      style={{
        flex :1,
        backgroundColor: '#28a745',
        padding: 12,
        marginHorizontal: 16,
        borderRadius: 6,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Vào nhóm chat</Text>
    </TouchableOpacity>
    <TouchableOpacity
    onPress={() => {
      nav.navigate('newfeeds', {
        courseId: courseId,
      });
    }}
    style={{
      flex :1,
      backgroundColor: '#28a745',
      padding: 12,
      marginHorizontal: 16,
      borderRadius: 6,
      marginBottom: 10,
    }}
  >
    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>New feed</Text>
  </TouchableOpacity>

    </View>
    
      <Text style={{ fontSize: 22, fontWeight: '700', margin: 20, marginBottom: 10 }}>
        Lộ trình khóa học
      </Text>
      {/* {console.log(lessons)} */}

    {lessons.map((lesson, i) => (
    <View key={`lesson-${lesson.id}`} style={{ marginBottom: 2 }}>
      <List.Item
        title={`Bài ${i + 1}`}
        onPress={() => handlePress(i)}
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
              icon="check-circle"
              color={completedLessons.includes(lesson.id)? 'green' : 'gray'}
            />
          </TouchableOpacity>
        )}
        style={{ backgroundColor: '#fff' }}
      />

      {expanded.includes(i) && (
        <View style={{ backgroundColor: '#fff', padding: 10 }}>
          <RenderHtml
            contentWidth={width}
            source={{ html: lesson.content }}
          />
        </View>
      )}
    </View>
  ))}


      
      <Text style={{ color: '#888', textAlign: 'center', margin: 16, fontSize: 13 }}>
        Tổng số chương: {roadmapData.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});