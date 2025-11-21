import { Navigate, Route, Routes } from 'react-router-dom'
import SoftwareHomepage from './pages/SoftwareHomepage'
import CopywritingCreationInterface from './pages/CopywritingCreationInterface'
import ProjectInterface from './pages/ProjectInterface'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<SoftwareHomepage />} />
        <Route path="/copywriting" element={<CopywritingCreationInterface />} />
        <Route path="/project" element={<ProjectInterface />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}