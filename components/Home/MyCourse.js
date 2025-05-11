import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import MyStyles from "../../styles/MyStyles";
import React, { useEffect, useState } from "react";
import { Chip, List, Searchbar } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
const Mycourse = () => {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState();
    const [page, setPage] = useState(1);
    const [cateId, setCateId] = useState(null);
    const nav = useNavigation();

    const loadCates = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }

 
    const loadCourses = async () => {
        if (page > 0) {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');
                let url = `${endpoints['my-courses']}?page=${page}`;
    
                if (q) url += `&q=${q}`;
                if (cateId) url += `&category_id=${cateId}`;
    
                let res = await authApis(token).get(url);
    
                // Nếu là trang đầu (page === 1), reset; nếu là trang sau, nối
                setCourses(page === 1 ? res.data : [...courses, ...res.data]);
    
                if (res.data.next === null) setPage(0);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };
    
    useFocusEffect(
        React.useCallback(() => {
            loadCourses(); // Hàm gọi API để lấy danh sách khóa học mới
        }, [])
      );
    useEffect(() => {
        let timer = setTimeout(() => {
            loadCates();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        loadCourses();
    }, [q, cateId, page]);

    useEffect(() => {
        setPage(1);
        setCourses([]);
    }, [q, cateId]);

    const loadMore = () => {
        // if (!loading && page > 0)
        //     setPage(page + 1);
    }
    // console.log(courses);
    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Khóa học</Text>
            </View> */}
            
            <View style={styles.searchContainer}>
                <Searchbar 
                    placeholder="Tìm khóa học..." 
                    value={q} 
                    onChangeText={setQ}
                    style={styles.searchBar}
                />
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* <TouchableOpacity 
                        style={[styles.categoryItem, !cateId && styles.activeCategory]} 
                        onPress={() => setCateId(null)}
                    >
                        <Text style={[styles.categoryText, !cateId && styles.activeCategoryText]}>Tất cả</Text>
                    </TouchableOpacity> */}
                    {/* {categories.map((c,index) => (
                        <TouchableOpacity 
                        key={`Cate${c.id}-${index}`}  
                            style={[styles.categoryItem, cateId === c.id && styles.activeCategory]} 
                            onPress={() => setCateId(c.id)}
                        >
                            <Text style={[styles.categoryText, cateId === c.id && styles.activeCategoryText]}>{c.name}</Text>
                        </TouchableOpacity>
                    ))} */}
                </ScrollView>
            </View>

            <FlatList 
                 keyExtractor={(item, index) => `${item.id}-${index}`}
                // keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.courseList}
                onEndReached={loadMore} 
                ListFooterComponent={loading && <ActivityIndicator size={30} />} 
                data={courses} 
                renderItem={({item}) => (
                    console.log('item',item),
                    <TouchableOpacity 
                        style={styles.courseItem}
                        onPress={() => nav.navigate('lessons',{ courseId: item?.id })}
                    >
                        <Image 
                            style={styles.courseImage} 
                            source={{uri: item.image}} 
                        />
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitle}>{item.name}</Text>
                            <Text style={styles.courseDate}>{item.start_date}</Text>
                            <Text style={styles.courseDate}>{item.end_date}</Text>
                            <Text style={styles.courseDate}>{item.capacity} Hoc Vien</Text>
                        </View>
                    </TouchableOpacity>
                )} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchBar: {
        elevation: 0,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    categoriesContainer: {
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeCategory: {
        backgroundColor: '#007AFF',
    },
    categoryText: {
        color: '#666',
        fontSize: 14,
    },
    activeCategoryText: {
        color: '#fff',
        fontWeight: '600',
    },
    courseList: {
        padding: 16,
    },
    courseItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    courseImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    courseDate: {
        fontSize: 14,
        color: '#666',
    },
});

export default Mycourse;