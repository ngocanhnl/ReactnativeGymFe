import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import { Chip, List, Searchbar, Card, Avatar, Divider, IconButton } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
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
    
                let url = `${endpoints['courses']}?page=${page}`;
    
                if (q) {
                    url = `${url}&q=${q}`;
                }
    
                if (cateId) {
                    url = `${url}&category_id=${cateId}`;
                }
    
                // console.info(url);
                let res = await Apis.get(url);
                setCourses([...courses, ...res.data.results]);
    
                if (res.data.next === null)
                    setPage(0);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

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
        if (!loading && page > 0)
            setPage(page + 1);
    }
    // console.log(courses);
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Khóa học</Text>
            </View>
            
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
                    <TouchableOpacity 
                        style={[styles.categoryItem, !cateId && styles.activeCategory]} 
                        onPress={() => setCateId(null)}
                    >
                        <Text style={[styles.categoryText, !cateId && styles.activeCategoryText]}>Tất cả</Text>
                    </TouchableOpacity>
                    {categories.map(c => (
                        <TouchableOpacity 
                            key={`Cate${c.id}`} 
                            style={[styles.categoryItem, cateId === c.id && styles.activeCategory]} 
                            onPress={() => setCateId(c.id)}
                        >
                            <Text style={[styles.categoryText, cateId === c.id && styles.activeCategoryText]}>{c.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList 
                contentContainerStyle={styles.courseList}
                onEndReached={loadMore} 
                ListFooterComponent={loading && <ActivityIndicator size={30} />} 
                data={courses} 
                renderItem={({item}) => (
                    <Card 
                        style={styles.courseCard}
                        onPress={() => nav.navigate('course-details', {'courseId': item.id})}
                    >
                        <Card.Cover source={{uri: item.image}} style={styles.courseImage} />
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.courseTitle} numberOfLines={2}>{item.name}</Text>
                            
                            <View style={styles.priceContainer}>
                                {item.best_active_discount ? (
                                    <>
                                        <Text style={styles.originalPrice}>
                                            {item.price.toLocaleString('vi-VN')}đ
                                        </Text>
                                        <Text style={styles.discountedPrice}>
                                            {(item.price * (1 - item.best_active_discount.discount_percentage/100)).toLocaleString('vi-VN')}đ
                                        </Text>
                                        <Chip 
                                            style={styles.discountChip}
                                            textStyle={styles.discountChipText}
                                        >
                                            -{item.best_active_discount.discount_percentage}%
                                        </Chip>
                                    </>
                                ) : (
                                    <Text style={styles.price}>
                                        {item.price.toLocaleString('vi-VN')}đ
                                    </Text>
                                )}
                            </View>

                            <View style={styles.infoContainer}>
                                <View style={styles.infoItem}>
                                    <IconButton icon="account-group" size={16} />
                                    <Text style={styles.infoText}>
                                        {item.students.length}/{item.capacity} học viên
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <IconButton icon="calendar" size={16} />
                                    <Text style={styles.infoText}>
                                        {new Date(item.start_date).toLocaleDateString('vi-VN')} - {new Date(item.end_date).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.teacherContainer}>
                                <Avatar.Image 
                                    size={24} 
                                    source={{uri: item.teacher.avatar || 'https://via.placeholder.com/24'}} 
                                />
                                <Text style={styles.teacherName}>
                                    Giảng viên: {item.teacher.first_name}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
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
    courseCard: {
        marginBottom: 16,
        elevation: 4,
    },
    courseImage: {
        height: 200,
    },
    cardContent: {
        padding: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    originalPrice: {
        fontSize: 16,
        color: '#666',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountedPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e53935',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    discountChip: {
        backgroundColor: '#e53935',
        marginLeft: 8,
    },
    discountChipText: {
        color: '#fff',
        fontSize: 12,
    },
    infoContainer: {
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: -8,
    },
    teacherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    teacherName: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
});

export default Home;