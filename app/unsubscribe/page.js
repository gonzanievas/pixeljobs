'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    fetch(`/api/unsubscribe?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '48px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#c8ff00',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" fill="#0a0a0a"/>
              <rect x="9" y="2" width="5" height="5" fill="#0a0a0a"/>
              <rect x="2" y="9" width="5" height="5" fill="#0a0a0a"/>
              <rect x="9" y="9" width="5" height="5" fill="#0a0a0a" opacity="0.3"/>
            </svg>
          </div>
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '15px',
            fontWeight: '500',
            color: '#ffffff',
            letterSpacing: '0.05em',
          }}>PORFO</span>
        </div>

        {status === 'loading' && (
          <div>
            <p style={{ fontSize: '16px', color: '#666' }}>Procesando...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '40px 32px',
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: '#1a1a1a',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11L9 16L18 7" stroke="#c8ff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
              Te diste de baja
            </h1>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              Ya no vas a recibir más emails de Porfo. Si cambiás de opinión, podés volver a suscribirte cuando quieras.
            </p>
            <a href="/" style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#c8ff00',
              color: '#0a0a0a',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              fontFamily: '"DM Sans", sans-serif',
            }}>
              Volver a Porfo
            </a>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '40px 32px',
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              El link no es válido o ya expiro. Si querés darte de baja escribinos.
            </p>
            <a href="/" style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '1px solid #2a2a2a',
              fontFamily: '"DM Sans", sans-serif',
            }}>
              Volver a Porfo
            </a>
          </div>
        )}

      </div>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0a0a0a'}}/>}>
      <UnsubscribeContent />
    </Suspense>
  )
}