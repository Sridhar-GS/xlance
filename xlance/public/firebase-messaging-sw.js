importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyA6AduXP3Xcv8iJVfeO2JJv_61lu8sBp0o",
    authDomain: "xlance-aac8c.firebaseapp.com",
    projectId: "xlance-aac8c",
    storageBucket: "xlance-aac8c.firebasestorage.app",
    messagingSenderId: "18606152150",
    appId: "1:18606152150:web:f7d69b0428cf9e42806c77",
    measurementId: "G-MLEDK83G6S"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
