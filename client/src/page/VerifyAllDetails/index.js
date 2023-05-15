import React, { useEffect, useState } from 'react';
import "./style.css";
import { Typography } from "antd";
import { useLocation } from 'react-router-dom';
import { getOderByUserIdandOrderId } from '../../services/mybooking';
import { useAuth } from '../../contexts/auth';
import { BackToFront } from "../../components/Back/Back";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

function VerifyAllDetails() {

  const location = useLocation();
  const orderId = location.state?.orderId;
  const { accessToken } = useAuth();
  const [order, setOrder] = useState([]);

  const getChairNumbers = () => {
	if (order && order.details) {
	  const chairNumbers = order.details.map((orderDetail) => orderDetail.chair.chairNumber);
	  return chairNumbers.join(", ");
	}
	return ""; // Trả về giá trị mặc định nếu không có order hoặc order.details
  };

	// Sử dụng hook useEffect để gọi API và cập nhật order
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
  
  // JSX code cho giao diện và nội dung trang
  return (
	<div className="verify-all-details">
	  <div className="details-header">
	  		<Typography.Title level={2} className="title">Verify information order</Typography.Title>
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
			<Typography.Title level={4}>Customer Information</Typography.Title>
		  </caption>
		  <thead>
			<tr>
			  <td className="details-title">Full Name:</td>
			  <td className="details-des">{order.user?.fullName}</td>
			</tr>
			<tr>
			  <td className="details-title">Phone Number:</td>
			  <td className="details-des">{order.user?.phoneNumber}</td>
			</tr>
			<tr>
			  <td className="details-title">Email:</td>
			  <td className="details-des">{order.user?.email}</td>
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
			{/* Các thông tin khác về thanh toán */}
		  </thead>
		</table>
	  </div>
	  <div className="btn-back-continue">
				<BackToFront />
				<div className='btn-continue'>
					<button>PROCEED TO PAY</button>
					<i className="arrow-icon"><FontAwesomeIcon icon={faArrowRight} /></i>
				</div>
	  </div>
	</div>
  );
 
}

export default VerifyAllDetails;