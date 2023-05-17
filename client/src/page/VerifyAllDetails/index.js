import React, { useEffect, useState } from 'react';
import "./style.css";
import { Typography } from "antd";
import { useLocation } from 'react-router-dom';
import { getOderByUserIdandOrderId } from '../../services/mybooking';
import { useAuth } from '../../contexts/auth';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from '../../constant/network';
import { useNavigate } from 'react-router-dom';
import { editProfile } from '../../services/account';

function VerifyAllDetails() {

	const navigate = useNavigate();
	const location = useLocation();
	const orderId = location.state?.orderId;
	const { accessToken } = useAuth();
	const [order, setOrder] = useState([]);
	const [isEditing, setIsEditing] = useState(false);
	const [fullName, setFullName] = useState('');
  	const [phoneNumber, setPhoneNumber] = useState('');
	  const [isDelete, setIsDelete] = useState(true);

	const handleDeleteOrder = async (orderId) => {
		try {
		  const confirmed = window.confirm("Are you sure you want to cancel this order?");
		if (!confirmed) {
			
		  return;
		}

		  const request = await fetch(`${BASE_URL}/api/v1/orders/cancellingInvoice/${orderId}`,

		{
		  method: 'DELETE',
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`
		  },
		  body: JSON.stringify({
			orderId
		  }),
		  
		});
		setOrder([]);
		if (!request.ok) {
		  throw new Error('Something went wrong!');
		}else{
			navigate(-1);
		}
		} catch (error) {
		  console.error(error);
		}
	}

	function deleteOrder(orderId) {
		handleDeleteOrder(orderId);
		
	}

	function verifyOrder() {
		navigate("/my-booking");
	}

	const getChairNumbers = () => {
		if (order && order.details && Array.isArray(order.details)) {
		  const chairNumbers = order.details.map((orderDetail) => orderDetail.chair.chairNumber);
		  return chairNumbers.join(", ");
		}
		return "";
	  };

	useEffect(() => {
		if (!orderId) {
			return;
		}	
		const fetchOrder = async () => {
			console.log(orderId)
		try {
			const res = await getOderByUserIdandOrderId(accessToken, orderId);
			setOrder(res);
		} catch (error) {
			console.error("Error fetching order:", error);
		}
		};	
		fetchOrder();
	}, [accessToken, orderId]);

	useEffect(() => {
		if (order) {
		  setFullName(order.user?.fullName);
		  setPhoneNumber(order.user?.phoneNumber);
		}
	}, [order]);
	const handleEditClick = () => {
		setIsEditing(true);
	};
	
	const handleSaveClick = () => {
		// Gọi hàm editProfile để cập nhật thông tin khách hàng
		editProfile(order.user.userId, fullName, phoneNumber, order.user.email, order.user.address);
	
		setIsEditing(false);
	};
  
  	// JSX code cho giao diện và nội dung trang
	return (
		<div className="verify-all-details">
			<div className="details-header">
				<Typography.Title level={2} className="title-mobile">Verify information order</Typography.Title>
				<Typography.Title level={2} className="title-desktop">Verify information order</Typography.Title>
			</div>
	
			{/* Thông tin chuyến */}
			<div className="details">
				<table>
					<caption style={{ captionSide: 'top', textAlign: 'left' }}>
					<Typography.Title level={4}>Trip Information</Typography.Title>
					</caption>
					<thead>
					<tr>
						<td className="details-title">Departure:</td>
						<td className="details-des">{order.trip?.provinceStart}</td>
					</tr>
					<tr>
						<td className="details-title">Destination:</td>
						<td className="details-des">{order.trip?.provinceEnd}</td>
					</tr>
					<tr>
						<td className="details-title">Journey date:</td>
						<td className="details-des">{order.trip?.timeStart}</td>
					</tr>
					<tr>
					<td className="details-title">Ordered seats:</td>
					<td className="details-des">{getChairNumbers()}</td>
					</tr>
					{/* Các thông tin khác của chuyến */}
					</thead>
				</table>
			</div>

			{/* Thông tin khách hàng */}
			<div className="details">
				<table>
					<caption style={{ captionSide: 'top', textAlign: 'left' }}>
					<Typography.Title level={4} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span style={{ marginLeft: '0' }}>Customer Information</span>
						{isEditing ? (
						<button style={{ color: 'blue', marginRight: '0' }} onClick={handleSaveClick}>Save</button>
						) : (
						<button style={{ color: 'blue', marginRight: '0' }} onClick={handleEditClick}>Edit</button>
						)}
					</Typography.Title>
					</caption>
					<thead>
					<tr>
						<td className="details-title">Full Name:</td>
						<td className="details-des">
						{isEditing ? (
							<input
							className="edit-input"
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							/>
						) : (
							fullName
						)}
						</td>
					</tr>
					<tr>
						<td className="details-title">Phone Number:</td>
						<td className="details-des">
						{isEditing ? (
							<input
							className="edit-input"
							type="text"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							/>
						) : (
							phoneNumber
						)}
						</td>
					</tr>
					<tr>
						<td className="details-title">Email:</td>
						<td className="details-des">
						{order.user?.email}
						</td>
					</tr>
					{/* Các thông tin khác của khách hàng */}
					</thead>
				</table>
			</div>
		
			{/* Thông tin thanh toán */}
			<div className="details">
				<table>
				<caption style={{ captionSide: 'top', textAlign: 'left' }}>
					<Typography.Title level={4}>Payment Information</Typography.Title>
				</caption>
				<thead>
					<tr>
						<td className="details-title">Total Amount:</td>
						<td className="details-des">{new Intl.NumberFormat().format(order.sumOrder)}đ</td>
					</tr>
					<tr>
						<td className="details-title">Payment method:</td>
						<td className="details-des">{order.paymentMethodName}</td>
					</tr>
					{/* Các thông tin khác về thanh toán */}
				</thead>
				</table>
			</div>

			<div className="btn-back-continue">
					<button onClick={() => deleteOrder(order.orderId)} >Cancel</button>
					<div className='btn-continue'>
						<button onClick={()=>verifyOrder()}>View your booking</button>
						<i className="arrow-icon"><FontAwesomeIcon icon={faArrowRight} /></i>
					</div>
			</div>
		</div>
	);
 
}

export default VerifyAllDetails;