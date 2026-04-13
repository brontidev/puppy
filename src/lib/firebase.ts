import { firebaseService, getFirekitConfig, initFirekit } from 'svelte-firekit';

export const firebaseConfig = {
	apiKey: 'AIzaSyC3hKE-Px5gWtIIhqf3BGpCalMEpQeDql0',
	authDomain: 'puppy-app-b5d8b.firebaseapp.com',
	projectId: 'puppy-app-b5d8b',
	storageBucket: 'puppy-app-b5d8b.firebasestorage.app',
	messagingSenderId: '254370888577',
	appId: '1:254370888577:web:da9cfa0050bd7618594680',
	measurementId: 'G-FN3MQ9XFQJ'
};

initFirekit(firebaseConfig);
