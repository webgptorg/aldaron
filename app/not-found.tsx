import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'black', color: 'white' }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold' }}>404</h1>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Page Not Found</p>
            <p style={{ marginTop: '0.5rem' }}>The page you are looking for does not exist.</p>
            <Link href="/" style={{ marginTop: '1.5rem', display: 'inline-block', backgroundColor: '#2563EB', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', textDecoration: 'none' }}>
                Go to Homepage
            </Link>
        </div>
    );
}
