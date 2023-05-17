import React, {useState} from 'react';
import { Form, Input, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant/network';


function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (value) => {
    setIsLoading(true);
    try {
      const response = await forgotPassword(value.email);
      console.log(response);
      message.success('Reset password email has been sent to your inbox');
    } catch (error) {
      console.error(error);
      message.error('Failed to reset password. Please check your email and try again.');
    }finally {
			setTimeout(() => {setIsLoading(false);},1000)
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
            {!isLoading && (
                <button className='btn-login' htmltype='submit'>SUBMIT </button>
            )}
						{isLoading && (
							<button className='btn-login'>Loading...</button>
						)}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ForgotPassword;
