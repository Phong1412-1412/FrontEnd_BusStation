import React, {useState ,useEffect } from 'react';
import './style.css';
import { Form, Input, Typography } from 'antd';
import { LockFilled, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function Login() {
	
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);

	const { signIn, user } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if(user) {
			navigate('/')
		}
	}, [user])
	const handleGoogleLogin = () => {
		window.location = 'http://localhost:9999/oauth2/authorization/google';
	}

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
						message: 'Enter Username'
					},
					{
						min: 3,
						message: 'Username must be at least 3 characters'
					},
					{
						max: 50,
						message: 'Username cannot be longer than 50 characters'
					},
					]}
					name={'username'}>
					<Input className='input' prefix={<UserOutlined className="site-form-item-icon" />} placeholder='Enter Username' maxLength={50} />
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
							<button className='btn-login' htmlType='submit'>LOGIN </button>
						)}
						{isLoading && (
							<button className='btn-login'>Loading...</button>
						)}
						<i className='arrow-icon'>
							<FontAwesomeIcon icon={faArrowRight} />
						</i>
						
					</div>
				</Form.Item>
				<div className='to-register'>
					<span style={{ fontWeight: '700' }}>
						Don't have an account ?
					</span>
					<Link style={{ fontWeight: '700' }} to='/register'>Register</Link>
				</div>
			</Form>
				<div>
					<button onClick={handleGoogleLogin}>Login with Google</button>
				</div>
		</div>
	);
}

export default Login;