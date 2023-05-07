import { Form, Input, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999'; // Thay đổi BASE_URL bằng URL của server API

function ForgotPassword() {
  const [form] = Form.useForm();

  const handleSubmit = async (value) => {
    try {
      const response = await forgotPassword(value.email);
      // Xử lý kết quả trả về từ API tại đây
      console.log(response); // ví dụ: hiển thị thông báo cho người dùng
      message.success('Reset password email has been sent to your inbox');
    } catch (error) {
      console.error(error);
      // handle error from server
      message.error('Failed to reset password. Please check your email and try again.');
    }
  };

  async function forgotPassword(email) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      // handle error from server
      throw error;
    }
  }

  return (
    <div className='appBg'>
      <Typography.Title className='title'>Forgot Password</Typography.Title>
      <Form onFinish={handleSubmit} form={form} className='loginForm'>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Enter Email',
            },
            {
              type: 'email',
              message: 'Enter a valid email address',
            },
          ]}
          name={'email'}
        >
          <Input
            className='input'
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Enter Email'
          />
        </Form.Item>

        <Form.Item className='form-item-login'>
          <div className='wrap-btn'>
            <button className='btn-login' htmlType='submit'>
              SUBMIT
            </button>
          </div>
        </Form.Item>
      </Form>

      <div className='to-login'>
        <Link style={{ fontWeight: '700' }} to='/login'>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
