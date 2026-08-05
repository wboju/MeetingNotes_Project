import "./index.css";
import "./App.css";
import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch("http://localhost:3000/meetings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch meetings!");
        return res.json();
      })
      .then((data) => {
        setMeetings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  const handleLogin = (credentialResponse) => {
    const decoded = JSON.parse(
      atob(credentialResponse.credential.split(".")[1]),
    );
    setUser(decoded);
    localStorage.setItem("user", JSON.stringify(decoded));
  };

  const handleLogout = () => {
    setUser(null);
    setMeetings([]);
    setLoading(true);
    localStorage.removeItem("user");
  };

  const handleTranscriptUpload = (id, data) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              transcript: data.transcript,
              summary: data.summary,
              action_items: data.action_items,
            }
          : m,
      ),
    );
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Dashboard
      meetings={meetings}
      user={user}
      onLogout={handleLogout}
      onTranscriptUpload={handleTranscriptUpload}
    />
  );
}

export default App;
