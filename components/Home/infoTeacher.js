import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Surface, IconButton, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Apis, { endpoints } from "../../configs/Apis";
const InfoTeacher = ({ route }) => {
  const { instructor } = route.params;
  const [teacherProfile, setTeacherProfile] = useState()

  const navigation = useNavigation();
  const theme = useTheme();

  const loadTeacherProfile = async ()=>{
    try {
      const res = await Apis.get(endpoints['teacher-profile'](instructor?.id))
      console.log("Teacher profile ::: ", res.data)
      setTeacherProfile(res.data)
    } catch (error) {
      console.log("Không thể tải dữ liệu giảng viên", error)
    }
  
  } 

  
  useEffect(() => {
    loadTeacherProfile();
  }, []);




  const renderTeacherInfo = () => (
    <Surface style={styles.infoContainer}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: instructor?.avatar || 'https://i.pravatar.cc/150' }} 
          style={styles.avatar}
        />
      </View>
      <Text style={styles.teacherName}>{instructor?.first_name}</Text>
      <Text style={styles.teacherTitle}>Giảng viên chính</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <IconButton icon="account-group" size={24} color={theme.colors.primary} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>1,234</Text>
            <Text style={styles.statLabel}>Học viên</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="star" size={24} color="#FFD700" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="book" size={24} color={theme.colors.primary} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Khóa học</Text>
          </View>
        </View>
      </View>
    </Surface>
  );

  const renderBio = () => (
    <Surface style={styles.bioContainer}>
      <Text style={styles.sectionTitle}>Giới thiệu</Text>
      <Text style={styles.bioText}>
        {instructor?.bio || 'Chưa có thông tin chi tiết về giảng viên'}
      </Text>
    </Surface>
  );

  // const renderExpertise = () => (
  //   <Surface style={styles.expertiseContainer}>
  //     <Text style={styles.sectionTitle}>Chuyên môn</Text>
  //     <View style={styles.expertiseList}>
  //       {['Lập trình Web', 'Mobile Development', 'UI/UX Design', 'Database'].map((skill, index) => (
  //         <View key={index} style={styles.expertiseItem}>
  //           <IconButton icon="check-circle" size={20} color={theme.colors.primary} />
  //           <Text style={styles.expertiseText}>{skill}</Text>
  //         </View>
  //       ))}
  //     </View>
  //   </Surface>
  // );
  const renderExpertise = (certificate) => {
    // Tách chuỗi certificate thành từng dòng, bỏ dấu gạch đầu dòng và khoảng trắng
    const certifications = certificate
      ? certificate.split('\n').map(line => line.replace(/^- /, '').trim()).filter(line => line !== '')
      : [];
  
    return (
      <Surface style={styles.expertiseContainer}>
        <Text style={styles.sectionTitle}>Chuyên môn</Text>
        <View style={styles.expertiseList}>
          {certifications.map((cert, index) => (
            <View key={index} style={styles.expertiseItem}>
              <IconButton icon="check-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.expertiseText}>{cert}</Text>
            </View>
          ))}
        </View>
      </Surface>
    );
  };

  // const renderEducation = () => (
  //   <Surface style={styles.educationContainer}>
  //     <Text style={styles.sectionTitle}>Học vấn</Text>
  //     <View style={styles.educationList}>
  //       <View style={styles.educationItem}>
  //         <View style={styles.educationIcon}>
  //           <IconButton icon="school" size={24} color={theme.colors.primary} />
  //         </View>
  //         <View style={styles.educationInfo}>
  //           <Text style={styles.educationDegree}>Thạc sĩ Công nghệ thông tin</Text>
  //           <Text style={styles.educationSchool}>Đại học XYZ</Text>
  //           <Text style={styles.educationYear}>2018 - 2020</Text>
  //         </View>
  //       </View>
  //       <Divider style={styles.divider} />
  //       <View style={styles.educationItem}>
  //         <View style={styles.educationIcon}>
  //           <IconButton icon="school" size={24} color={theme.colors.primary} />
  //         </View>
  //         <View style={styles.educationInfo}>
  //           <Text style={styles.educationDegree}>Cử nhân Công nghệ thông tin</Text>
  //           <Text style={styles.educationSchool}>Đại học ABC</Text>
  //           <Text style={styles.educationYear}>2014 - 2018</Text>
  //         </View>
  //       </View>
  //     </View>
  //   </Surface>
  // );
  const renderEducation = (degreeStr) => {
    // Tách degree theo dấu gạch ngang
    const [degreeTitle, degreeSchool] = degreeStr?.split(' - ') || [];
  
    return (
      <Surface style={styles.educationContainer}>
        <Text style={styles.sectionTitle}>Học vấn</Text>
        <View style={styles.educationList}>
          <View style={styles.educationItem}>
            <View style={styles.educationIcon}>
              <IconButton icon="school" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.educationInfo}>
              <Text style={styles.educationDegree}>{degreeTitle || 'Chưa cập nhật'}</Text>
              <Text style={styles.educationSchool}>{degreeSchool || ''}</Text>
         
            </View>
          </View>
        </View>
      </Surface>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* {renderHeader()} */}
      <ScrollView style={styles.scrollView}>
        {renderTeacherInfo()}
        {renderBio()}
        {renderExpertise(teacherProfile?.certificate)}
        {renderEducation(teacherProfile?.degree)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 4,
    zIndex: 1,
  },
  avatarContainer: {
    marginTop: -60,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 4,
    elevation: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  teacherName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teacherTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bioContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  expertiseContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  expertiseList: {
    gap: 12,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertiseText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  educationContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  educationList: {
    gap: 16,
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  educationIcon: {
    marginRight: 12,
  },
  educationInfo: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  educationYear: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    marginVertical: 8,
  },
});

export default InfoTeacher;
