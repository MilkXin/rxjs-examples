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
      
      {/* 基础操作符示例 */}
      <BasicOperators />

      {/* 高级操作符示例 */}
      <AdvancedOperators />

      {/* 错误处理示例 */}
      <ErrorHandling />

      {/* 实际应用示例 */}
      <RealWorldExamples />

      {/* 高级模式示例 */}
      <AdvancedPatterns />
    </div>
  )
}

export default App
