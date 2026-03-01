import axios from 'axios';

axios.post('http://localhost:3000/api/issues', {
    title: 'Backend POST test',
    description: 'Testing if backend actually accepts unauthorized posts directly without frontend Axios interceptors',
    category: 'academic',
    location: 'test',
    contactEmail: 'test@example.com'
})
    .then(res => console.log('SUCCESS:', res.data))
    .catch(err => console.error('ERROR:', err.response?.data || err.message));
