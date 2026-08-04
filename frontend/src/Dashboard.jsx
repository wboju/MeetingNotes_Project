import MeetingList from './MeetingList'

function Dashboard({meetings, onTranscriptUpload}) {
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Meeting Notes</h1>
                <p className="dashboiard-subtitle">{meetings.length} upcoming meetings</p>
            </header>
            <main className="dashboard-main">
                <MeetingList meetings={meetings} onTranscriptUpload={onTranscriptUpload}/>
            </main>
        </div>
    )
}

export default Dashboard