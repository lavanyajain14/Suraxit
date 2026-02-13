import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './solana/WalletProvider'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </WalletProvider>
  )
}

export default App
