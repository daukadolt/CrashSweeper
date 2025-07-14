import Minesweeper from './components/Minesweeper'
import './App.css'
import { useEffect } from 'react'
import { useCrash } from './components/CrashContext'

function App() {
  const { crashApp } = useCrash();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour % 2 === 0) {
      crashApp();
    }
  }, []);

  return (
    <>
      <h1>CrashSweeper</h1>

    <div className="minesweeper-container">
        <Minesweeper />
    </div>
    </>
  )
}

export default App
