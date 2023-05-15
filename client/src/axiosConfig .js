import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:9999', // Thay đổi baseURL thành địa chỉ backend của bạn
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:3000', // Thay đổi origin thành địa chỉ frontend của bạn
  },
});

export default instance;
