import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ConnectPage, ErrorPage, Home } from './modules'
import { ProtectedRoute } from './components'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<ProtectedRoute element={Home} />} />
        <Route path='/connect' element={<ConnectPage />} />
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </div>
  )
}

export default App