import { BASE_URL } from "../constant/network"

export const getOderByUser = async (accessToken) => {
    return await fetch(`${BASE_URL}/api/v1/orderdetails/user`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    }).then(res => res.json())
}

export const getOderByUserIdandOrderId = async (accessToken,orderId) => {
    return await fetch(`${BASE_URL}/api/v1/orders/verify-order-info/${orderId}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    }).then(res => res.json())
}