import { useGoogleLogin } from "@react-oauth/google";

function Login({ onLogin }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onLogin(tokenResponse),
    onError: () => console.error("Login Failed"),
    scope:
      "openid email profile https://www.googleapis.com/auth/calendar.readonly",
  });

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Meeting Notes</h1>
        <p>Sign in to access your meetings</p>
        <button className="google-login-btn" onClick={() => login()}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
