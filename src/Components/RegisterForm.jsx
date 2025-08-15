import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAtom } from 'jotai'
import { guestTokenAtom } from '../Atoms/GuestTokenAtom'
import { valueProfileAtom } from '../Atoms/ValueProfileAtom'

function RegisterForm () {
  const [profile, setProfile] = useAtom(valueProfileAtom);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const [sessionToken, setSessionToken] = useAtom(guestTokenAtom)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }

    try {
      const res = await fetch('/api/guest/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sessionToken,
          changeVsTradition:
            profile?.changeVsTradition ?? 50,
          compassionVsAmbition:
            profile?.compassionVsAmbition ?? 50
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data?.errors?.[0] || data.message || 'Registreringen misslyckades.'
        )
      } else {
        setSessionToken(null)
        navigate('/login')
      }
    } catch (err) {
      setError('Något gick fel vid registrering.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type='text'
          name='fullName'
          placeholder='Fullständigt namn'
          value={form.fullName}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type='email'
          name='email'
          placeholder='E-post'
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type='password'
          name='password'
          placeholder='Lösenord'
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type='password'
          name='confirmPassword'
          placeholder='Bekräfta lösenord'
          value={form.confirmPassword}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button type='submit' className='active' style={{ padding: '10px 20px' }}>
        Registrera
      </button>
    </form>
  )
}

export default RegisterForm
