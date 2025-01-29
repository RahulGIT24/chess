import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from "axios"
import toast from 'react-hot-toast';

const GoogleAuth = () => {

  const googleAuth = async({credential,client_id}:{credential:string,client_id:string})=>{
    try {
      const res = await axios.post(import.meta.env.VITE_SERVER_URL + "/auth/google-auth",{
        credential,client_id
      })
      toast.success(res.data.message)
    } catch (error) {
      toast.error("Error while Signing In")
    }
  }

 const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return (
   <GoogleOAuthProvider clientId={clientId}>
     <GoogleLogin
       onSuccess={credentialResponse => {
         const clientId = credentialResponse.clientId
         const credential = credentialResponse.credential
         if(clientId && credential){
           googleAuth({client_id:clientId,credential:credential})
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