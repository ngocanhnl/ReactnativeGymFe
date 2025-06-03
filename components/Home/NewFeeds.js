import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Apis, { endpoints } from "../../configs/Apis";
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Searchbar,
  FAB,
  Avatar,
  Text,
  Badge,
  BottomNavigation,
  Divider,
  Button,
  IconButton,
  Provider as PaperProvider,
  DefaultTheme
} from 'react-native-paper';

// Tùy chỉnh theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E88E5',
    accent: '#FF5722',
  },
};



export default function BulletinBoard ({route}){
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState();
  const [typeNews, setTypeNews] = useState()
  const [page, setPage] = useState(1);
  const courseId = route.params.courseId
  const [searchText, setSearchText] = useState(''); // Separate state for input text


  const loadNews = async () => {
    if (true) {
      try {
          setLoading(true);

          let url = `${endpoints['news'](courseId)}?page=${page}`;
          // console.log("new url", url)

          if (q) {
              url = `${url}&q=${q}`;
          }

          if (typeNews) {
              url = `${url}&typeNews=${typeNews}`;
          }

          // console.info(url);
          let res = await Apis.get(url);
          // console.log("New1", res.data)
          setNews([...news, ...res.data.results]);
          // console.log("New1", res.data)
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
   
      loadNews();
  // Đợi 500ms sau khi người dùng dừng gõ
  
}, [q, page, typeNews]);

useEffect(() => {
    setPage(1);
    setNews([]);
}, [q,typeNews]);

  const loadMore = () => {
    if (!loading && page > 0)
        setPage(page + 1);
  }
  // console.log("news", news)


  

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Lọc bài viết dựa trên tab và tìm kiếm
  const getFilteredPosts = () => {
    let filteredPosts = ALL_POSTS;
    
    if (activeTab === 'workout') {
      filteredPosts = WORKOUT_TIPS;
    } else if (activeTab === 'nutrition') {
      filteredPosts = NUTRITION_TIPS;
    } else if (activeTab === 'events') {
      filteredPosts = EVENTS;
    }
    
    if (searchQuery) {
      return filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredPosts;
  };

  // Render category chip dựa vào danh mục
  const renderCategoryChip = (category) => {
    let label, color;
    
    switch(category) {
      case 'workout':
        label = 'Tập luyện';
        color = '#FF9800';
        break;
      case 'nutrition':
        label = 'Dinh dưỡng';
        color = '#4CAF50';
        break;
      case 'event':
        label = 'Sự kiện';
        color = '#2196F3';
        break;
      case 'news':
        label = 'Tin tức';
        color = '#2196F3';
        break;
      default:
        label = category;
        color = '#9E9E9E';
    }
    
    return (
      <Chip 
        mode="outlined" 
        style={{ backgroundColor: color + '20', borderColor: color }}
        textStyle={{ color: color }}
      >
        {label}
      </Chip>
    );
  };

  // Render individual post
  const renderPostItem = ({ item }) => {
    // Xử lý định dạng ngày giờ
    const createdAt = item.created_at
      ? new Date(item.created_at).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : item.date || '';
  
    return (
      <Card key={`${item.id}-${item.created_at}`} style={styles.card}>
        <Card.Content>
          <View style={styles.authorContainer}>
            {item.user?.avatar ? (
              <Avatar.Image size={36} source={{ uri: item.user.avatar }} />
            ) : (
              <Avatar.Text size={36} label={item.user?.first_name?.[0] || 'U'} />
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{item.user?.first_name || item.author}</Text>
              <Text style={styles.postDate}>{createdAt}</Text>
            </View>
          </View>
          <View style={styles.categoryChipContainer}>
            {renderCategoryChip(item.type_news || item.category)}
          </View>
          <Title style={styles.postTitle}>{item.title}</Title>
          <Paragraph numberOfLines={3}>{item.content}</Paragraph>
        </Card.Content>
  
        {item.image && (
          <Card.Cover 
            source={{ uri: `https://res.cloudinary.com/darr5at86/${item.image}` }} 
            style={styles.postImage}
          />
        )}
  
        {(item.category === 'event' || item.type_news === 'event') && (
          <Card.Content>
            <View style={styles.eventInfoRow}>
              <IconButton icon="calendar" size={18} />
              <Text>{item.date}</Text>
              <IconButton icon="clock-outline" size={18} />
              <Text>{item.time}</Text>
            </View>
            <View style={styles.eventInfoRow}>
              <IconButton icon="map-marker" size={18} />
              <Text>{item.location}</Text>
            </View>
          </Card.Content>
        )}
  
        <Divider style={styles.divider} />
        {(item.type_news === "event" || item.category === "event") && (
          <Card.Actions>
            <Button>Xem chi tiết</Button>
            <Button mode="contained">Đăng ký</Button>
          </Card.Actions>
        )}
      </Card>
    );
  };
  

  // Filter Container Component
  const FilterContainer = () => (
    <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm bài viết..."
          value={q}
          onChangeText={setQ}
          style={styles.searchBar}
        />
        
      
      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <Chip 
          selected={activeTab === 'all'} 
          onPress={() => {
            setActiveTab('all')
            setTypeNews()
          }}
          style={styles.filterChip}
        >
          Tất cả
        </Chip>
        <Chip 
          selected={activeTab === 'workout'} 
          onPress={() => {
            setActiveTab('workout')
            setTypeNews('workout')
          }}
          style={styles.filterChip}
        >
          Mẹo tập luyện
        </Chip>
        <Chip 
          selected={activeTab === 'nutrition'} 
          onPress={() => {
            setActiveTab('nutrition')
            setTypeNews('nutrition')
          }}
          style={styles.filterChip}
        >
          Dinh dưỡng
        </Chip>
        <Chip 
          selected={activeTab === 'events'} 
          onPress={() => {
            setActiveTab('events')
            setTypeNews('event')
          }}
          style={styles.filterChip}
        >
          Sự kiện
        </Chip>
        <Chip 
          selected={activeTab === 'news'} 
          onPress={() => {
            setActiveTab('news')
            setTypeNews('news')
          }}
          style={styles.filterChip}
        >
          Tin tức 
        </Chip>
      </ScrollView>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* App Bar */}
      <Appbar.Header>
        <Appbar.Content title="Bảng Tin Nội Bộ" />
        <Appbar.Action icon="bell" onPress={() => {}} />
        <Appbar.Action icon="message" onPress={() => {}} />
      </Appbar.Header>

      {/* Body */}
      <View style={styles.container}>
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={<FilterContainer />}
          data={news}
          renderItem={renderPostItem}
          keyExtractor={(item) => `${item.id}-${item.created_at || Math.random()}`}
          contentContainerStyle={styles.content}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Thêm padding cho FAB
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  featuredCard: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  featureBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  featureChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  featuredTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 8,
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 12,
    color: '#888',
  },
  categoryChipContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  postImage: {
    marginTop: 8,
  },
  divider: {
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  postTitle: {
    paddingRight: 50, // Make room for category chip
  }
})