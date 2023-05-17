import { Form, Input,Typography, message } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { LockFilled, UserOutlined } from '@ant-design/icons';

const BASE_URL = 'http://localhost:9999'; // Thay đổi BASE_URL bằng URL của server API

function ResetPassword() {
  const [form] = Form.useForm();
  const { token } = useParams();

  console.log(token);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await resetPassword(token, values.email, values.newPassword, values.verifyNewPassword);
      console.log("success", response);
      message.success('Your password has been reset successfully.');
      navigate('/login'); 
    } catch (error) {
      console.error(error);
      message.error('Failed to reset your password. Please try again later.');
    }
  };

  async function resetPassword(token, email, newPassword, verifyNewPassword) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/reset-password?token=${token}`,
        { email, newPassword, verifyNewPassword }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <div className='appBg'>
      <Typography.Title className='title'>Reset Password</Typography.Title>
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

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter a new password.' },
            { min: 8, message: 'Your password must be at least 8 characters long.' },
          ]}
        >
        <Input.Password className='input' prefix={<LockFilled className="site-form-item-icon" />} placeholder='Enter New Password' />
        </Form.Item>

        <Form.Item
          name="verifyNewPassword"
          dependencies={['newPassword']}
          rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject('The two passwords that you entered do not match.');
                },
              }),
            ]}
        >
        <Input.Password className='input' prefix={<LockFilled className="site-form-item-icon" />} placeholder='Confirm new password' />
        </Form.Item>

        <Form.Item className='form-item-login'>
          <div className='wrap-btn'>
            <button className='btn-login' htmltype='submit'>
             SUBMIT
            </button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ResetPassword;
