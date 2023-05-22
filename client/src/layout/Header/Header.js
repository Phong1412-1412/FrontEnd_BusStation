import './header.css'
import { React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import logo from '../../assets/images/header/logo.png'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { Dropdown, Space, message } from 'antd';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons'
import  {getUser}  from '../../services/account'
import { getVerification } from '../../services/auth';
import { BASE_URL } from '../../constant/network';

export default function Header() {
	const { user, signOut, accessToken } = useAuth()
	const [infor, setInfor] = useState({});
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await getUser();
				setInfor(userData);
			}
			catch (err) {
				console.error(err);
			}
		};
		if(user) {
			fetchUser();
		}
	}, [user])

	const driverItems = [
		{
			key: '1',
			label: (
				<Link to={"/driver/*"}><b><i>Driver: {user?.user.fullName}</i></b></Link>
			),
		},
		{
			key: '2',
			label: (
				user ? (
					<Link className='drop-item' rel="noopener noreferrer" to={"/my-booking"}>
						<b><i>My Booking</i></b>
					</Link>
				) : null
			),
		},
		{
			key: '3',
			label: (
				user
					? <div onClick={() => signOut()}><b><i>Logout</i></b></div>
					: <Link to={"/login"} className='drop-item' rel="noopener noreferrer"><b><i>Login</i></b></Link>

			),
		},

	];

	const items = [
		{
			key: '1',
			label: (
				<Link className='drop-item' rel="noopener noreferrer" to={"/"}>
					<b><i>Home</i></b>
				</Link>
			),
		},
		{
			key: '2',
			label: (
				user ? (
					<Link className='drop-item' rel="noopener noreferrer" to={"/my-booking"}>
						<b><i>My Booking</i></b>
					</Link>
				) : null
			),
		},
		{
			key: '3',
			label: (
				user
				? (
					<Link to={"/profile"} className='drop-item' rel="noopener noreferrer"><b><i>Account</i></b></Link>
				)
				: null
			),
		},
		{
			key: '4',
			label: (
				user
					? <div onClick={() => signOut()}><b><i>Logout</i></b></div>
					: <Link to={"/login"} className='drop-item' rel="noopener noreferrer"><b><i>Login</i></b></Link>

			),
		},

	];

	const handlGetVerification = async (userId) => {
		try {
		  const confirmed = window.confirm("Are you sure you want to resendVerificationToken?");
		  if (!confirmed) {
			return;
		  }
		  const tokenData = await getVerification(userId);
	  
		  // Kiểm tra nếu token có giá trị trước khi gọi resendVerificationToken
		  if (tokenData.token) {
			resendVerificationToken(tokenData.token);
		  } else {
			console.log("Token is null");
		  }
		} catch (error) {
		  console.log(error);
		}
	  };

	const resendVerificationToken = async (token) => {
		try {
			console.log(token);
		 	const response = await fetch(`${BASE_URL}/api/v1/auth/resend-verification-token?token=${token}`, {
			method: 'GET',
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': `Bearer ${accessToken}`
			}
		  });
		  if (!response.ok) {
			throw new Error('Something went wrong!');
		  }
		  // Xử lý thành công ở đây
		  console.log('Resend Email Successfully!');
		} catch (error) {
		  console.error(error);
		}
	  };

	return (
		<section className="nav-bar">
			<div className="header-container">
				<div className="row">
					<img className="logo" src={logo} alt="logo" />


					<ul className="nav-bar__menu-list">
						<li>
							<Link to={"/"}><i>Home</i></Link>
						</li>
						{
							user  &&
							(
								user?.role.roleId === "DRIVER"
									? (
										<>
										<li>
											<Link to={"/driver/*"}><i>Driver: {user?.user.fullName}</i></Link>
										</li>
										<li>
												<Link to={"/my-booking"}><i>My Booking</i></Link>
										</li>
										</>
									)
									: (
										<>
											<li>
												<Link to={"/my-booking"}><i>My Booking</i></Link>
											</li>
											<li>
												<Link to={"/profile"}><FontAwesomeIcon icon={faCircleUser} style={{ marginRight: 4 }}/> Profile </Link>
											</li>
										</>
									)
							)
						}
						<li>
							{user
								? <a href='#' onClick={() => signOut()}><i>Logout</i></a>
								: <Link to={"/login"}><i>Login</i></Link>
							}
						</li>
					</ul>
					<Dropdown className="nav"
						menu={{
							items: user?.role.roleId === "DRIVER" ? driverItems : items,
						}}
					>
						<Link onClick={(e) => e.preventDefault()}>
							<Space>
								<FontAwesomeIcon icon={['fas', 'bars']} style={{ color: "#085071" }} />
							</Space>
						</Link>
					</Dropdown>

				</div>
			</div>
		</section>
	)
}