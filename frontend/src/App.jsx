
import "./index.css";
import "./App.css";
import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleTranscriptUpload = (id, transcript) => {
    setMeetings((prev) => 
    prev.map((m) => (m.id === id ? {...m, transcript} : m))
    )
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <Dashboard meetings={meetings} onTranscriptUpload={handleTranscriptUpload} />;
}

export default App;
