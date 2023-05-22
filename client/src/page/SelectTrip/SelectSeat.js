import './css/SelectSeatPage.css'
import Seat from '../../components/Seat/Seat'
import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../../contexts/auth'
import { submitOrder } from '../../services/order'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { WS_URL } from '../../constant/network';
import Loading from '../../components/Loading/loading';
import { getAllPayments } from '../../services/payment';
import { countChair, cancellationCount } from '../../services/countChairs';
import { faCarRear } from '@fortawesome/free-solid-svg-icons';
import { getUser } from '../../services/account';

export default function SelectSeat({ trip, car }) {
    const [order, setOrder] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [disabledSeats, setDisabledSeats] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [countOrderDetails, setCountOrderDetails] = useState(0)
    const [cancelCount, setCancelCount] = useState(0)

    const [seats, setSeats] = useState(car.chair)
    const [carId] = useState(car.carId)

    const [stompClient, setStompClient] = useState(null);
    const { accessToken, user } = useAuth()

    const [selectPayment, setSelectPayment] = useState([]);
    const [payment , setPayment] = useState(0);

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

    useEffect(() => {
        (async() => {
            const data = await getAllPayments();
            setSelectPayment(data);
            if(data.length > 0) {
                const lastIndex = data.length -1;
                setPayment(data[lastIndex])
                console.log(payment.id);
            }
        })()
    },[])


    useEffect(() => {
        if(order && order.orderId != null) {
            async function getCount() {
            try {
                const result = await countChair(order.orderId);
                setCountOrderDetails(result);
            } catch (error) {
                console.log(error);
            }
            }
            getCount();
        }
      }, [order]);
    
      useEffect(() => {
        if(order && order.orderId != null) {
            async function getCount() {
            try {
                const result = await cancellationCount(order.orderId);
                setCancelCount(result);
            } catch (error) {
                console.log(error);
            }
            }
            getCount();
        }
      }, [order]);

    const navigate = useNavigate()


    useEffect(() => {
        const socket = new SockJS(WS_URL);

        const stompClient = Stomp.over(socket);
        stompClient.debug = null

        // connect to ws
        stompClient.connect({
            Authorization: `Bearer ${accessToken}`
        }, () => {
            console.log('connected to WebSocket');
            setStompClient(stompClient)

            // Cancel temp order in storage if exist
            cancelTempOrder(stompClient)
        });

        const disconnect = () => {
            // Cancel temp order if user disconnect
            cancelTempOrder(stompClient)

            stompClient.disconnect(() => {
                console.log('disconnected from WebSocket');
            });
        }

        return () => {
            disconnect();
        }
    }, []);

    useEffect(() => {
        if (stompClient) {
            const disabledChairSubscription = stompClient.subscribe("/topic/disableSeat", function (message) {
                var disabledChair = JSON.parse(message.body);

                disabledChairSubscriptionHandler(disabledChair)
            });

            return () => {
                disabledChairSubscription.unsubscribe();
            }
        }
    }, [stompClient]);

    useEffect(() => {
        if (stompClient) {
            const orderSubscription = stompClient.subscribe('/topic/chair', function (message) {
                const newOrder = JSON.parse(message.body);
                orderSubscriptionHandler(newOrder, order)
            });
            return () => {
                orderSubscription.unsubscribe();
            }
        }
    }, [stompClient]);

    useEffect(() => {
        if (stompClient) {
            const chairsSubscription = stompClient.subscribe('/topic/chairs', function (message) {
                const chairUpdates = JSON.parse(message.body);
                setSeats(chairUpdates)
            });

            return () => {
                chairsSubscription.unsubscribe();
            }
        }
    }, [stompClient])

    useEffect(() => {
        if (stompClient) {
            const cancelSubscription = stompClient.subscribe('/topic/cancel', function (message) {
                const orderHasCancelRequest = message.body;

                setDisabledSeats(prevS => {
                    let list = [...prevS]
                    const updatedList = list.filter(item => item.orderId !== orderHasCancelRequest);
                    return updatedList
                })

                // refetch()
            });

            return () => {
                cancelSubscription.unsubscribe();
            }
        }
    }, [stompClient])

    useEffect(() => {
        if (order && order.orderId.length > 0) {
            localStorage.setItem(
                'order_' + order.orderId,
                JSON.stringify({ ...order, expireAt: new Date(new Date().getTime() + 0.5 * 60000) })
            );

            const clearLocalStorageItem = () => {
                const item = JSON.parse(localStorage.getItem('order_' + order.orderId))

                const data = JSON.stringify({
                    orderId: item.orderId,
                    tripId: trip.tripId
                })

                stompClient.send('/app/chairCancel', {}, data)

                localStorage.removeItem('order_' + order.orderId);
                setOrder(null)
                setSelectedSeats([])
            };

            const timeoutId = setTimeout(clearLocalStorageItem, 0.5 * 60000);

            // Clear the timeout when the component unmounts or the `order` prop changes.
            return () => clearTimeout(timeoutId);
        }
    }, [order]);

    const disabledChairSubscriptionHandler = (disabledChair) => {
        if (trip.tripId !== disabledChair.tripId) return;

        setDisabledSeats(prevS => [...prevS, disabledChair])
    }

    const orderSubscriptionHandler = (newOrder) => {
        if (trip.tripId !== newOrder.tripId) return;

        setOrder(prevS => {
            if (prevS?.orderId === "" || prevS?.orderId === newOrder?.orderId) {
                return newOrder
            } else {
                return prevS
            }
        })
    }

    const cancelTempOrder = (client) => {
        const trips = { ...localStorage }
        const tripsWillBeCancel = Object.entries(trips).map(([key, value]) => {
            if (key.includes("order_"))
                return JSON.parse(value);
        }).filter(el => el !== undefined);

        tripsWillBeCancel.forEach((item) => {
            const payloadData = JSON.stringify({
                orderId: item.orderId,
                tripId: item.tripId
            })

            client.send('/app/chairCancel', {}, payloadData)
            localStorage.removeItem("order_" + item.orderId)
        })
    }

    const onChooseSeat = async (chair) => {
        if (!user) {
            message.error("You need to login to continue select a seat!")
            navigate("/login")
            return;
        }

        if (chair && stompClient) {
            const orderData = {
                orderId: order ? order.orderId : "",
                tripId: trip.tripId,
                chairId: chair.chairId,
                addressStart: trip.provinceStart,
                addressEnd: trip.provinceEnd,
                paymentId: payment.id,
                carId: carId
            }

            setOrder({
                orderId: orderData.orderId,
                tripId: orderData.tripId
            })
            setSelectedSeats(prevS => [...prevS, chair.chairId])

            stompClient.send(
                '/app/chair',
                { Authorization: `Bearer ${accessToken}` },
                JSON.stringify(orderData))
        }
    }

    const onSubmitOrder = async () => {
        setIsLoading(true);
        try {

            if(infor && !infor.user.status) {
                message.error("Please verify your account to continue!")
                return;
            }

            if (!order || !order?.orderId) {
                message.error("Please pick a car before submit order !")
                return;
            }

            if(!payment.id) {     
                message.error("payment id is null !")
                return;
            }

            if(countOrderDetails > 3 && payment.id !== 2) {
                message.error("If you book more than 3 seats, please change the payment method to bank transfer.!")
                return;
            }

            if(cancelCount > 3 && payment.id !== 2) {
                message.error("You have canceled the trip more than 3 times, please change the payment method to transfer payment to continue.")
                return;
            }


            const data = await submitOrder({ orderId: order.orderId, tripId: trip.tripId, paymentId: payment.id})
    
            if (!data) {
                message.error("Oops! Something went wrong @@")
                return;
            }
    
            localStorage.removeItem("order_" + order.orderId);
            message.success("Create order successfully !")
            navigate("/verify-details",{ state: { orderId: order.orderId } })
        } catch (error) {
            alert("Booking failed");
        }
        finally{
            setIsLoading(false);
        }
    }

    return (
        <div className="select-seat-page">
            <div>
                <p className="select-seat-page__title">Select The Seats</p>
            </div>
            <div className="seat-info">
                <div className='seat-info__item'>
                    <div className='awesome-seat' >
                        <svg xmlns="http://www.w3.org/2000/svg" width={42} height={42} viewBox="0 0 42 42" className="seat" pos={5}>
                            <g fill="none" fillRule="evenodd">
                                <g className={"active"}>
                                    <path d="M8.625.5c-3.038 0-5.5 2.462-5.5 5.5v27.875c0 .828.672 1.5 1.5 1.5h32.75c.828 0 1.5-.672 1.5-1.5V6c0-3.038-2.462-5.5-5.5-5.5H8.625zM5.75 35.5V38c0 1.933 1.567 3.5 3.5 3.5h23.5c1.933 0 3.5-1.567 3.5-3.5v-2.5H5.75z" />
                                    <rect width="5.125" height="16.5" x=".5" y="13.625" rx="2.563" />
                                    <rect width="5.125" height="16.5" x="36.375" y="13.625" rx="2.563" />
                                </g>
                            </g>
                        </svg>
                    </div>
                    <span> Available </span>
                </div>

                <div className='seat-info__item'>
                    <div className='awesome-seat' >
                        <svg xmlns="http://www.w3.org/2000/svg" width={42} height={42} viewBox="0 0 42 42" className="seat" pos={5}>
                            <g fill="none" fillRule="evenodd">
                                <g className={"disabled"}>
                                    <path d="M8.625.5c-3.038 0-5.5 2.462-5.5 5.5v27.875c0 .828.672 1.5 1.5 1.5h32.75c.828 0 1.5-.672 1.5-1.5V6c0-3.038-2.462-5.5-5.5-5.5H8.625zM5.75 35.5V38c0 1.933 1.567 3.5 3.5 3.5h23.5c1.933 0 3.5-1.567 3.5-3.5v-2.5H5.75z" />
                                    <rect width="5.125" height="16.5" x=".5" y="13.625" rx="2.563" />
                                    <rect width="5.125" height="16.5" x="36.375" y="13.625" rx="2.563" />
                                </g>
                            </g>
                        </svg>
                    </div>
                    <span> Selected </span>
                </div>

                <div className='seat-info__item'>
                    <div className='awesome-seat' >
                        <svg xmlns="http://www.w3.org/2000/svg" width={42} height={42} viewBox="0 0 42 42" className="seat" pos={5}>
                            <g fill="none" fillRule="evenodd">
                                <g className={"selecting"}>
                                    <path d="M8.625.5c-3.038 0-5.5 2.462-5.5 5.5v27.875c0 .828.672 1.5 1.5 1.5h32.75c.828 0 1.5-.672 1.5-1.5V6c0-3.038-2.462-5.5-5.5-5.5H8.625zM5.75 35.5V38c0 1.933 1.567 3.5 3.5 3.5h23.5c1.933 0 3.5-1.567 3.5-3.5v-2.5H5.75z" />
                                    <rect width="5.125" height="16.5" x=".5" y="13.625" rx="2.563" />
                                    <rect width="5.125" height="16.5" x="36.375" y="13.625" rx="2.563" />
                                </g>
                            </g>
                        </svg>
                    </div>
                    <span> Selecting </span>
                </div>
            </div>
            {stompClient
                ? (
                    <div className="seat-map">
                        <div className='seat-map__desk-title'>
                            <p>Upper Desk</p>
                            <p>Lower Desk</p>
                        </div>
                        <div className="seat-map__position">
                            <div>
                                {seats.slice(0, 7).map((chair) => (
                                    <Seat
                                        chair={chair}
                                        key={chair.chairId}
                                        // isSelected={order?.chairId === chair.chairId}
                                        isSelected={selectedSeats.includes(chair.chairId)}
                                        // isSelecting={disabledSeats.includes(chair.chairId)}
                                        isSelecting={disabledSeats.some(el => el.chairId === chair.chairId)}
                                        onSelectSeat={onChooseSeat}
                                    />
                                ))}
                            </div>
                            <div>
                                <Seat
                                    chair={seats[7]}
                                    // isSelected={(order && (order?.chairId === seats[7]?.chairId))}
                                    isSelected={selectedSeats.includes(seats[7]?.chairId)}
                                    // isSelecting={disabledSeats.includes(seats[7]?.chairId)}
                                    isSelecting={disabledSeats.some(el => el.chairId === seats[7]?.chairId)}
                                    onSelectSeat={onChooseSeat}
                                />
                            </div>
                            <div>
                                {seats.slice(8, 15).map((chair) => (
                                    <Seat
                                        chair={chair}
                                        key={chair.chairId}
                                        // isSelected={order?.chairId === chair.chairId}
                                        isSelecting={disabledSeats.some(el => el.chairId === chair.chairId)}
                                        isSelected={selectedSeats.includes(chair.chairId)}
                                        // isSelecting={disabledSeats.includes(chair.chairId)}
                                        onSelectSeat={onChooseSeat}
                                    />
                                ))}
                            </div>
                            <div style={{
                                fontSize: "100px",
                                display: 'flex',
                                justifyContent: 'center',
                                fontWeight: 100,
                                color: '#5669FF'
                            }}>|</div>
                            <div>
                                {seats.slice(15, 22).map((chair) => (
                                    <Seat
                                        chair={chair}
                                        key={chair.chairId}
                                        // isSelected={order?.chairId === chair.chairId}
                                        isSelecting={disabledSeats.some(el => el.chairId === chair.chairId)}
                                        isSelected={selectedSeats.includes(chair.chairId)}
                                        // isSelecting={disabledSeats.includes(chair.chairId)}
                                        onSelectSeat={onChooseSeat}
                                    />
                                ))}
                            </div>
                            <div>
                                <Seat
                                    chair={seats[22]}
                                    // isSelected={order && (order?.chairId === seats[22]?.chairId)}
                                    isSelecting={disabledSeats.some(el => el.chairId === seats[22]?.chairId)}
                                    isSelected={selectedSeats.includes(seats[22]?.chairId)}
                                    // isSelecting={disabledSeats.includes(seats[22]?.chairId)}
                                    onSelectSeat={onChooseSeat}
                                />
                            </div>
                            <div>
                                {seats.slice(23, 30).map((chair) => (
                                    <Seat
                                        chair={chair}
                                        key={chair.chairId}
                                        // isSelected={order?.chairId === chair.chairId}
                                        isSelecting={disabledSeats.some(el => el.chairId === chair.chairId)}
                                        isSelected={selectedSeats.includes(chair.chairId)}
                                        // isSelecting={disabledSeats.includes(chair.chairId)}
                                        onSelectSeat={onChooseSeat}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
                : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading /></div>
            }
            <div className='orderDetail'>
                <div>
                    <p >Seats: {seats.length}</p>
                </div>
            <h1 className='payment-title'>Order Detail</h1>
                <div className='payment-box'>
                <div className='submin-order'>
                <div className='select-car-type'>
                                        <label htmlFor='payment-method'>Select payment method:</label>
                                        <select id='payment-method' value={payment? payment.id : ''} 
                                            onChange={(e) => {
                                                const selected = selectPayment.find(p => p.id === Number(e.target.value));
                                                setPayment(selected)
                                             }}>
                                            {selectPayment?.map((payment, id) => (
                                            <option key={id} value={payment.id}>{payment.paymentMethod}</option>
                                            ))}

                                        </select>
                </div>
                <div>
                    {!isLoading && ( <button className="btn-choose" onClick={() => onSubmitOrder()}>Continue</button>)}
                   
                    {isLoading && ( <button className="btn-choose">Loading...</button>)}
                </div>
            </div>
            </div>
        </div>
    </div>
    )
} 