import axios from 'axios'
import { BASE_URL } from '../constant/network'

async function countChair(orderId) {
    try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/orderdetails/count/${orderId}`)
        if (!data) throw new Error()

        return data
    } catch (error) {
        return []
    }
}

async function cancellationCount(orderId) {
    try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/orders/findCancel/${orderId}`)
        if (!data) throw new Error()

        return data
    } catch (error) {
        return []
    }
}

export { countChair, cancellationCount };