import './style.css'
import React, { useEffect, useState} from 'react';
import { BASE_URL } from '../../constant/network';
import axios from 'axios';
import { Header } from 'antd/es/layout/layout';
import { useAuth } from '../../contexts/auth'

function UsersTripPage(props) {
    const [data, setData] = useState([]);
    const { accessToken} = useAuth()
    const [reloadFlag, setReloadFlag] = useState(false); 

    useEffect(() => {
        if (props.tripId) {
          axios 
            .get(`${BASE_URL}/api/v1/trips/getUsers/${props.tripId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            })
            .then((response) => {
                setData(response.data)
                console.log(response.data)
            })
            .catch((error) => console.error(error));

        }
      }, [props.tripId, reloadFlag]);

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
        if (!request.ok) {
          throw new Error('Something went wrong!');
        }
        setReloadFlag(!reloadFlag);
        } catch (error) {
          console.error(error);
        }
        
     }

      return (
        <div>
            <table>
                <thead>
                    <tr>
                    <th>Full Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Payment method</th>
                    <th>Total price</th>
                    <th>seats</th>
                    <th>got in the car</th>
                    <th>Action</th>
                    </tr>
                </thead>
            {data.map((data, index) => (
                <tbody key={index}>
                    <tr key={data.userResponse.userId}>
                        <td>{data.userResponse.fullName}</td>
                        <td>{data.userResponse.phoneNumber}</td>
                        <td>{data.userResponse.email}</td>
                        <td>{data.userResponse.address}</td>
                        <td>{data.userResponse.status ? 'Paid' : 'Inactive'}</td>
                        <td>{data.paymentMethod.paymentMethod}</td>
                        <td>{data.toTalPrice} VNĐ</td>
                        <td>{data.chairNumber}</td>
                        <td><input type='checkbox'></input></td>
                        <td><button style={{backgroundColor: 'red', borderRadius: '5px', 
                         padding: '5px', color: 'white'}}
                         onClick={async() => {
                           handleDeleteOrder(data.orderId);
                         }}>CANCEL</button></td>
                    </tr>
                </tbody>
            ))}
    </table>
</div>
    );
}

export default UsersTripPage;