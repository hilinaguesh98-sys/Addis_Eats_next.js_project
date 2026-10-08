'use client'
export default function ErrorPage({ reset }) { 
    return <div className="page-wrap container"><div className="empty">
        <h2>Something went wrong</h2><p className="muted">Please try again.</p>
        <button className="orange-button" onClick={() => reset()}>Try Again</button></div></div> }
