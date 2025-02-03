import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { apiCall } from '../lib/apiCall';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUser } from '../redux/reducers/userReducer';

const GoogleAuth = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch()

  const googleAuth = async ({ credential, client_id }: { credential: string, client_id: string }) => {
    try {
      const res = await apiCall({
        data: {
          credential, client_id
        }, method: "POST", url: "/auth/google-auth"
      })
      let user = res.data.user;
      user.accessToken = res.data.accessToken;
      user.refreshToken = res.data.refreshToken;
      console.log(user)
      dispatch(setUser(user))
      dispatch(setAuthenticated(true))
      toast.success(res.message);
      navigate("/game")
    } catch (error: any) {
      return error
    }
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          const clientId = credentialResponse.clientId
          const credential = credentialResponse.credential
          if (clientId && credential) {
            googleAuth({ client_id: clientId, credential: credential })
          }
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;