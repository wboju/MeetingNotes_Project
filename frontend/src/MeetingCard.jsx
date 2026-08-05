import { useState } from "react";

function MeetingCard({ meeting, onTranscriptUpload }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [localSummary, setLocalSummary] = useState(null);
  const [localActionItems, setLocalActionItems] = useState([]);

  const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  setUploading(true)
  const formData = new FormData()
  formData.append('transcript', file)

  try {
    const res = await fetch(`http://localhost:3000/meetings/${meeting.id}/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setUploaded(true)
    setLocalSummary(data.summary)
    setLocalActionItems(data.action_items || [])
    setExpanded(true)
    onTranscriptUpload(meeting.id, data)
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    setUploading(false)
  }
}

  const hasSummary = uploaded && localSummary;
  const hasActionItems = uploaded && localActionItems.length > 0;

  return (
    <div className={`meeting-card ${expanded ? "expanded" : ""}`}>
      <div
        className="meeting-card-header"
        onClick={() => hasSummary && setExpanded(!expanded)}
      >
        <div className="meeting-card-title">
          <h2>{meeting.title}</h2>
          {hasSummary && (
            <span className="expand-toggle">{expanded ? "▲" : "▼"}</span>
          )}
        </div>
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

      {expanded && hasSummary && (
        <div className="meeting-summary">
          <p className="summary-label">Summary</p>
          <p>{localSummary}</p>
        </div>
      )}

      {expanded && hasActionItems && (
        <div className="meeting-actions">
          <p className="summary-label">Action Items</p>
          <ul>
            {localActionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="meeting-upload">
        {uploaded ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="upload-status">✓ Transcript uploaded</span>
            <label className="upload-label">
              Re-upload
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
        ) : (
          <label className="upload-label">
            {uploading ? "Analyzing transcript..." : "Upload transcript"}
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
  );
}

export default MeetingCard;
