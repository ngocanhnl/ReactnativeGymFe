import AsyncStorage from "@react-native-async-storage/async-storage";

export default (current, action) => {
    switch (action.type) {
        case 'login':
            return action.payload;
        case 'logout':
            AsyncStorage.removeItem('token');
            AsyncStorage.removeItem('user-detail');
            return null;
        case 'addCourse':
            return {
                ...current,
                myCourses: [...current.myCourses, action.payload]
            };
        case 'update-user':
            // Lưu thông tin người dùng mới vào AsyncStorage
            AsyncStorage.setItem('user-detail', JSON.stringify(action.payload));
            return action.payload;
        default:
            return current;
    }
}