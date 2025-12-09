import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './components/MainPage'
import ApplicantForm from './components/ApplicantForm'
import ResultsPage from './components/ResultsPage'
import ChatSimulation from './components/ChatSimulation'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/applicant-form" element={<ApplicantForm />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/chat-simulation" element={<ChatSimulation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

