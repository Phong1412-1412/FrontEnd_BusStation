import React, {useState} from 'react';
import './style.css';
import { Form, Input, Typography } from 'antd';
import { LockFilled, UserOutlined } from '@ant-design/icons';
import { Link} from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import GoogleLoginButton from '../../components/GoogleLoginButton/GoogleLoginButton';
function Login() {
	
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);
	const { signIn } = useAuth()

	const handleSubmit = async (value) => {
		setIsLoading(true);
		try {
			await signIn(value.username, value.password)
		} catch (error) {
			console.log("login error: " + error)
		}
		finally {
			setTimeout(() => {setIsLoading(false);},2000)
		}
	}
	
	return (
		<div className='appBg'>
			<Typography.Title className='title'>LOGIN FOR BOOKING</Typography.Title>
			<Form onFinish={handleSubmit} form={form} className='loginForm' >
				<Form.Item
					rules={[{
						required: true,
						message: 'Enter your email'
					},
					{
						max: 50,
						message: 'Email cannot be longer than 50 characters'
					},
					{
						type: 'email', message: 'Please enter a valid email'
					},
					]}
					name={'username'}>
					<Input className='input' prefix={<UserOutlined className="site-form-item-icon" />} placeholder='Enter email' maxLength={50} />
				</Form.Item>

				<Form.Item
					rules={[{
						required: true,
						message: 'Enter password'
					},
					{
						min: 6,
						message: 'Password must be at least 6 characters'
					},
					{
						max: 50,
						message: 'Password cannot be longer than 50 characters'
					},
					]}
					name={'password'}>
					<Input.Password className='input' prefix={<LockFilled className="site-form-item-icon" />} placeholder='Enter Password' />
				</Form.Item>
				<Form.Item className='forgot-password'>
					<Link to='/forgot-password'>Forgot password?</Link>
				</Form.Item>

				<Form.Item className='form-item-login'>
					<div className='wrap-btn'>
						{!isLoading && (
							<button className='btn-login' htmltype='submit'>LOGIN </button>
						)}
						{isLoading && (
							<button className='btn-login'>Loading...</button>
						)}
						<i className='arrow-icon'>
							<FontAwesomeIcon icon={faArrowRight} />
						</i>
						
					</div>
					<div><br/>or<br/></div>
					<GoogleLoginButton />
				</Form.Item>
				<div className='to-register'>
					<span style={{ fontWeight: '700' }}>
						Don't have an account ?
					</span>
					<Link style={{ fontWeight: '700' }} to='/register'>Register</Link>
				</div>
			</Form>
		</div>
	);
}

export default Login;