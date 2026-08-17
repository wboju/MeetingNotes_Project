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

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const [meetings, setMeetings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
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

  useEffect(() => {
    if (!accessToken) return;

    const now = new Date().toISOString();
    const oneWeekLater = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${oneWeekLater}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Calendar data:", data);
        setCalendarEvents(data.items || []);
      })
      .catch((err) => console.error("Calendar fetch error:", err));
  }, [accessToken]);

  const handleLogin = async (tokenResponse) => {
    const token = tokenResponse.access_token;
    setAccessToken(token);
    localStorage.setItem("accessToken", token);

    const userInfo = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then((res) => res.json());

    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    setMeetings([]);
    setCalendarEvents([]);
    setLoading(true);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
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
      calendarEvents={calendarEvents}
      user={user}
      onLogout={handleLogout}
      onTranscriptUpload={handleTranscriptUpload}
    />
  );
}

export default App;
