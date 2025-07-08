import React from 'react'

const DebugInfo: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold text-yellow-800">Debug Info</h3>
      <p><strong>Current URL:</strong> {window.location.href}</p>
      <p><strong>Pathname:</strong> {window.location.pathname}</p>
      <p><strong>Supabase URL:</strong> {supabaseUrl || 'Not set'}</p>
      <p><strong>Supabase Key:</strong> {supabaseKey ? '***' + supabaseKey.slice(-4) : 'Not set'}</p>
      <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
    </div>
  )
}

export default DebugInfo
