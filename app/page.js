'use client'
import { useState } from 'react'

const SPECIALTIES = [
  { id: 'uxui', label: 'UX / UI' },
  { id: 'branding', label: 'Branding' },
  { id: 'motion', label: 'Motion' },
  { id: 'illustration', label: 'Ilustración' },
  { id: 'product', label: 'Product Design' },
  { id: '3d', label: '3D' },
]

const MODALITIES = [
  { id: 'remote', label: 'Remoto' },
  { id: 'hybrid', label: 'Híbrido' },
  { id: 'onsite', label: 'Presencial' },
]

const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'Inglés' },
  { id: 'both', label: 'Ambos' },
]

const FREQUENCIES = [
  { id: 'daily', label: 'Diario' },
  { id: 'weekly', label: 'Semanal' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [modality, setModality] = useState('')
  const [language, setLanguage] = useState('')
  const [frequency, setFrequency] = useState('weekly')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const toggleSpecialty = (id) => {
    setSpecialties(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Ingresá un email válido.')
      return
    }
    if (specialties.length === 0) {
      setErrorMsg('Elegí al menos una especialidad.')
      return
    }
    if (!modality) {
      setErrorMsg('Elegí una modalidad.')
      return
    }
    if (!language) {
      setErrorMsg('Elegí un idioma.')
      return
    }

    setErrorMsg('')
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, specialties, modality, language, frequency }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Algo salió mal. Intentá de nuevo.')
        setStatus('idle')
      }
    } catch {
      setErrorMsg('Error de conexión. Intentá de nuevo.')
      setStatus('idle')
    }
  }

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

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #c8ff00; color: #0a0a0a; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
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
            }}>PIXEL JOBS</span>
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#ffffff',
            lineHeight: '1.15',
            marginBottom: '14px',
          }}>
            Ofertas de diseño,<br/>
            <span style={{ color: '#c8ff00' }}>directo a tu mail.</span>
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: '1.6',
          }}>
            Curadas para UX/UI, branding, motion y más.
            Sin ruido, sin buscar. Solo lo que te importa.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{
            background: '#111',
            border: '1px solid #c8ff00',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: '#c8ff00',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11L9 16L18 7" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#fff', marginBottom: '10px' }}>
              ¡Ya estás dentro!
            </h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Te vamos a mandar las primeras ofertas en las próximas horas.
              Revisá tu bandeja de entrada.
            </p>
          </div>
        ) : (
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                TU EMAIL
              </label>
              <input
                type="email"
                placeholder="hola@tumail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  color: '#fff',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              />
            </div>

            {/* Especialidad */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                ESPECIALIDAD (podés elegir varias)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SPECIALTIES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSpecialty(s.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '100px',
                      border: specialties.includes(s.id) ? '1px solid #c8ff00' : '1px solid #2a2a2a',
                      background: specialties.includes(s.id) ? '#c8ff00' : 'transparent',
                      color: specialties.includes(s.id) ? '#0a0a0a' : '#666',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                MODALIDAD
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {MODALITIES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModality(m.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: modality === m.id ? '1px solid #c8ff00' : '1px solid #2a2a2a',
                      background: modality === m.id ? '#c8ff00' : 'transparent',
                      color: modality === m.id ? '#0a0a0a' : '#666',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Idioma */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                IDIOMA DE TRABAJO
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: language === l.id ? '1px solid #c8ff00' : '1px solid #2a2a2a',
                      background: language === l.id ? '#c8ff00' : 'transparent',
                      color: language === l.id ? '#0a0a0a' : '#666',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frecuencia */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                FRECUENCIA
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {FREQUENCIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: frequency === f.id ? '1px solid #c8ff00' : '1px solid #2a2a2a',
                      background: frequency === f.id ? '#c8ff00' : 'transparent',
                      color: frequency === f.id ? '#0a0a0a' : '#666',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p style={{ fontSize: '13px', color: '#ff5555', marginTop: '-12px' }}>
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: status === 'loading' ? '#555' : '#c8ff00',
                color: '#0a0a0a',
                fontSize: '15px',
                fontWeight: '600',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {status === 'loading' ? 'Suscribiendo...' : 'Quiero recibir ofertas →'}
            </button>

            <p style={{ fontSize: '12px', color: '#444', textAlign: 'center', marginTop: '-12px' }}>
              Gratis. Sin spam. Te desuscribís con un click.
            </p>

          </div>
        )}
      </div>
    </main>
  )
}