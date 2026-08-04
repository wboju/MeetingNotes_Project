import { useState } from "react";

function MeetingCard({ meeting, onTranscriptUpload }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!meeting.transcript);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("transcript", file);

    try {
      const res = await fetch(
        `http://localhost:3000/meetings/${meeting.id}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      setUploaded(true);
      onTranscriptUpload(meeting.id, data.transcript);
    } catch (err) {
      console.error("Upload failed: ", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="meeting-card">
      <div className="meeting-card-header">
        <h2>{meeting.title}</h2>
        <span className="meeting-location">{meeting.location}</span>
      </div>
      <div className="meeting-card-meta">
        <span className="meeting-date">{meeting.date}</span>
        <span className="meeting-time">
          {meeting.startTime} – {meeting.endTime}
        </span>
      </div>
      <div className="meeting-attendees">
        {meeting.attendees.map((attendee) => (
          <span key={attendee} className="attendee-tag">
            {attendee}
          </span>
        ))}
      </div>
      <div className="meeting-upload">
        {uploaded ? (
          <span className="upload-status">✓ Transcript uploaded</span>
        ) : (
          <label className="upload-label">
            {uploading ? "Uploading..." : "Upload transcript"}
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>
    </div>
  )
}

export default MeetingCard;
