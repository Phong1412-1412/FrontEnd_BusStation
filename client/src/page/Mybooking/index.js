import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, message } from 'antd';
import './style.css';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/auth';
import { getOderByUser } from '../../services/mybooking';
import BookingDetails from '../BookingDetails';
import { BASE_URL } from '../../constant/network';
import CommentPage from '../CommentPage';
function Mybooking() {
  const [getDetail, setGetDetail] = useState(null);
  const [order, setOrder] = useState([]);
  const [openDetail, setOpenDetail] = useState(null);
  const { accessToken } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef(null);
  function openNewPage(tripId) {
    setIsOpen(true);
    setSelectedTripId(tripId);
};

useEffect(() => {
    function handleClickOutside(event) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [overlayRef]);

  useEffect(() => {
    getOderByUser(accessToken).then(res => {
      setOrder(res.content);
    });
  }, [accessToken]);

  const onClickOrder = (value, index) => {
    if (openDetail === index) {
      setGetDetail(null);
      setOpenDetail(null);
    } else {
      setGetDetail(value);
      setOpenDetail(index);
    }
  };


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
    const updatedOrders = order.filter((order) => order.orderId !== orderId);
    setOrder(updatedOrders);
    if (!request.ok) {
      throw new Error('Something went wrong!');
    }
    } catch (error) {
      console.error(error);
    }
 }

 function deleteOrder(order) {
  if(!order || order.tripStatus !== "PREPARE") {
    message.error("You can only cancel the order when the status is preparing")
    return;
  }
  handleDeleteOrder(order.orderId);
 }
  return (
    <div className='my-booking'>
      <div className='booking-items'>
        {order.map((detail, index) => (
          <div key={index} className='item'>
            <div className='place'>
              <div className='departure'>{detail.trip.provinceStart}</div>
              <div className='arrow'>
                <FontAwesomeIcon icon={faArrowRightLong} style={{ fontSize: '1.5em', color: '#165F81' }} />
              </div>
              <div className='destination'>{detail.trip.provinceEnd}</div>
            </div>
            <Divider style={{ padding: '0px 10px' }} />
            <div className='time-state-car'>
              <div className='time'>{detail.trip.timeStart}</div>
              <div className='flex justify-center items-center'>
                <div className='arrow'>
                  <div style={{ background: detail.details[0].status ? 'green' : 'red' }} className='state'>
                    {detail.tripStatus}
                  </div>
                </div>
              </div>
              <div className='price'>
                {new Intl.NumberFormat().format(detail.sumOrder)}đ
              </div>
            </div>
            
            <div className='open-detail'>
              <div className='open-button'>
                <div>
                  <button
                    onClick={() => onClickOrder(detail, index)}
                    style={{ backgroundColor: '#2187b6', padding: '5px 10px', borderRadius: '10px', marginRight: '10px' }}
                  >
                    {openDetail === index ? 'Close' : 'Detail'}
                  </button>
                  <button className='comment-button' onClick={() => openNewPage(detail.trip.tripId)}>Comment</button>
                    {   
                        isOpen && (
                        <div class="overlay">
                            <div className='comments-page' ref={overlayRef}>
                            <button onClick={() => {        
                                setIsOpen(false);
                                setSelectedTripId(null);
                            }} className='close'>&times;</button>
                            <CommentPage data={selectedTripId} trip={detail.trip}/>
                            </div>
                        </div>
                        )
                    }
                  </div>
                  <button onClick={() => deleteOrder(detail)} style={{ backgroundColor: '#b62121', padding: '5px 10px', borderRadius: '10px', }}>Cancel</button>
              </div>
              {openDetail === index && <BookingDetails bookingDetail={getDetail} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mybooking;
