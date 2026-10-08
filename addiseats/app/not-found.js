import Link from 'next/link'
export default function NotFound() { 
    return <div className="page-wrap container">
        <div className="empty"><h2>Page not found</h2>
        <p className="muted">The page you are looking for does not exist.</p>
        <Link className="orange-button" href="/">Go Home</Link></div></div> 
        }
