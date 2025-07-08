import React from 'react'

const SimpleTest: React.FC = () => {
  console.log('SimpleTest component rendering...')
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      border: '2px solid #333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>✓ React está funcionando</h1>
      <p>Este es un componente de prueba simple.</p>
      <p><strong>URL actual:</strong> {window.location.href}</p>
      <p><strong>Pathname:</strong> {window.location.pathname}</p>
      <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
    </div>
  )
}

export default SimpleTest
