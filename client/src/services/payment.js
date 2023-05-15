import axios from 'axios'
import { BASE_URL } from '../constant/network'

async function getAllPayments() {
    try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/payments/all`)
        if (!data) throw new Error()

        return data
    } catch (error) {
        return []
    }
}

export { getAllPayments };