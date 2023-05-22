import axios from 'axios'
import { BASE_URL } from '../constant/network'

async function login(username, password) {
	try {
		const { data, error } = await axios.post(`${BASE_URL}/api/v1/auth/signin`, { username, password })

		if (!data || error) throw new Error()

		return {
			access_token: data.accessToken,
			refresh_token: data.refreshToken
		}
	} catch (error) {
		return {
			access_token: null
		}
	}
}
async function loginWithGoogle(response){
	try {
	  const { data, error } = await axios.post('http://localhost:9999/api/v1/oauth2/google-login', {
		email: response.profileObj.email,
		fullname: response.profileObj.name
	  });
	  if (!data || error) throw new Error();
	  return {
		access_token: data.accessToken,
		refresh_token: data.refreshToken
	  }
	} catch (error) {
	  return { access_token: null };
	}
}

async function register(password, fullname, phoneNumber, email, address) {
	try {
		const { data } = await axios.post(`${BASE_URL}/api/v1/auth/signUpUserVerifyEmail`, {
			username: email, password: password,
			user: {
				fullName: fullname,
				phoneNumber: phoneNumber,
				email: email,
				address: address
			}
		})
		if (!data) throw new Error()

		return data;
	} catch (error) {
		return null;
	}
}

async function getVerification(userId) {
    try {
        const { data, error } = await axios.get(`${BASE_URL}/api/v1/auth/getVerificationToken/${userId}`)
        if (!data || error) throw new Error()

        return data
    } catch (error) {
        return null
    }
}


export {
	login, 
	register,
	loginWithGoogle,
	getVerification
}