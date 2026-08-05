import MeetingList from "./MeetingList";
import { useState } from "react";

function Dashboard({ meetings, user, onLogout, onTranscriptUpload }) {
  const [query, setQuery] = useState("");

  const filtered = meetings.filter((meeting) => {
    const q = query.toLowerCase();
    return (
      meeting.title.toLowerCase().includes(q) ||
      meeting.date.toLowerCase().includes(q) ||
      meeting.location.toLowerCase().includes(q) ||
      meeting.attendees.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1>Meeting Notes</h1>
            <p className="dashboard-subtitle">
              {meetings.length} upcoming meetings
            </p>
          </div>
          <div className="user-info">
            <img src={user.picture} alt={user.name} className="user-avatar" />
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
        <input
          className="search-bar"
          type="text"
          placeholder="Search by title, attendee, date, location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <main className="dashboard-main">
        <MeetingList
          meetings={filtered}
          onTranscriptUpload={onTranscriptUpload}
        />
      </main>
    </div>
  );
}
export default Dashboard;
