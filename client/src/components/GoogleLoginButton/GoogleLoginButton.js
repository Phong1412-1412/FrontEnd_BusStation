import React, { useEffect } from 'react';
import { GoogleLogin } from 'react-google-login';
import { gapi } from 'gapi-script';
import { useAuth } from '../../contexts/auth';

const clientId = '116716478783-is0dfn3aq007p6gselbis9bl5k4n85as.apps.googleusercontent.com';

const GoogleLoginButton = () => {

  const { signInWithGoogle } = useAuth()

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: 'profile email',
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  const onSuccess = async (response) => {
    try {
      await signInWithGoogle(response)
    } catch (error) {
			console.log("login error: " + error)
		}
  };
  

  const onFailure = (response) => {
    console.log('FAILED', response);
    alert('false');
  };

  return (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login with Google"
      onSuccess={onSuccess}
      onFailure={onFailure}
    />
  );
};

export default GoogleLoginButton;

