import { GoogleLogin } from "@react-oauth/google";

function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Meeting Notes</h1>
        <p>Sign in to access your meetings</p>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            onLogin(credentialResponse);
          }}
          onError={() => {
            console.error("Login failed");
          }}
        />
      </div>
    </div>
  );
}

export default Login;