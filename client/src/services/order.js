import axios from 'axios'
import { BASE_URL } from '../constant/network';


async function submitOrder(order) {
    try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/orders/submit`, order);
        if (!data) throw new Error()
        return data
    } catch (error) {
        return null;
    }
}

async function countOrderPaymentAtStation(tripId, accessToken) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      };
  
      const { data } = await axios.get(`${BASE_URL}/api/v1/orders/countOrderByPaymentAtStation?tripId=${tripId}`, null, config);
      if (!data) throw new Error();
      return data;
    } catch (error) {
      return null;
    }
    }

export {
    submitOrder,
    countOrderPaymentAtStation
}