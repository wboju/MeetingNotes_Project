import MeetingCard from './MeetingCard'

function MeetingList({ meetings, onTranscriptUpload }) {
    return (
        <div className="meeting-list">
            {meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} onTranscriptUpload={onTranscriptUpload}/>
            ))}
        </div>
    )
}

export default MeetingList