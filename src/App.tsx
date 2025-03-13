import BasicOperators from './components/rxjs-examples/BasicOperators'
import AdvancedOperators from './components/rxjs-examples/AdvancedOperators'
import ErrorHandling from './components/rxjs-examples/ErrorHandling'
import RealWorldExamples from './components/rxjs-examples/RealWorldExamples'
import AdvancedPatterns from './components/rxjs-examples/AdvancedPatterns'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>RxJS 示例集合</h1>
      <BasicOperators />
      <AdvancedOperators />
      <ErrorHandling />
      <RealWorldExamples />
      <AdvancedPatterns />
    </div>
  )
}

export default App
