import axios from "axios";

// const BASE_URL = "http://10.0.2.2:8000/";
// const BASE_URL = "http://192.168.100.9:8000/";
const BASE_URL = "https://b0ed-2001-ee0-4f01-2ec0-8928-3f0b-6157-2f2d.ngrok-free.app/";

export const endpoints = {
    'categories': '/categories/',
    'courses': '/courses/',
    'lessons': (courseId) => `/courses/${courseId}/get_lessons/`,
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'lesson-details': (lessonId) => `/lessons/${lessonId}/`,
    'course-detail': (courseId) => `/courses/${courseId}/`,
    'add-student': (courseId) => `/courses/${courseId}/addStudent/`,
    'my-courses': '/users/my-courses/',
    'lesson-done': (lessonId) => `/lessons/${lessonId}/lesson-done/`,
    'apointment': '/apointment/',
    'chat': (courseId) => `/courses/${courseId}/chats`,
    'news': (courseId) => `/courses/${courseId}/news/`,
    'vnpay-return': `/payment/vnpay-return/`,
    'order': `/order/`,

}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});
