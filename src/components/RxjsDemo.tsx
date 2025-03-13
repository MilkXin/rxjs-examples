import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  interval, 
  fromEvent, 
  map, 
  take, 
  debounceTime, 
  distinctUntilChanged,
  switchMap,
  mergeMap,
  catchError,
  of,
  Subscription
} from 'rxjs';

// 类型定义
interface SearchState {
  text: string;
  results: string[];
}

interface RequestResult {
  id: number;
  result: string;
  timestamp: string;
}

const RxjsDemo = () => {
  // 使用 useRef 存储订阅
  const subscriptions = useRef<Subscription[]>([]);
  
  // 状态管理
  const [count, setCount] = useState(0);
  const [searchState, setSearchState] = useState<SearchState>({
    text: '',
    results: []
  });

  // 清理订阅的函数
  const cleanup = useCallback(() => {
    subscriptions.current.forEach(sub => sub.unsubscribe());
    subscriptions.current = [];
  }, []);

  // 示例1: interval 操作符 - 创建一个定时器
  useEffect(() => {
    const subscription = interval(1000)
      .pipe(
        take(5),
        map(x => x + 1)
      )
      .subscribe({
        next: value => setCount(value),
        error: error => console.error('Interval error:', error),
        complete: () => console.log('Interval completed')
      });

    subscriptions.current.push(subscription);
    return cleanup;
  }, [cleanup]);

  // 示例2: 搜索防抖
  useEffect(() => {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const subscription = fromEvent<InputEvent>(input, 'input')
      .pipe(
        map(e => (e.target as HTMLInputElement).value),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value => {
          // 模拟API调用
          return of([`搜索结果1 - ${value}`, `搜索结果2 - ${value}`]);
        })
      )
      .subscribe({
        next: results => {
          setSearchState(prev => ({ ...prev, results }));
        },
        error: error => console.error('Search error:', error)
      });

    subscriptions.current.push(subscription);
    return cleanup;
  }, [cleanup]);

  // 示例3: 并行请求
  const handleMultipleRequests = useCallback(() => {
    const requests = [1, 2, 3].map(id => 
      of<RequestResult>({
        id,
        result: `请求 ${id} 的结果`,
        timestamp: new Date().toLocaleTimeString()
      })
    );

    const subscription = of(...requests)
      .pipe(
        mergeMap(request => request),
        catchError(error => of({
          id: 0,
          result: `错误: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }))
      )
      .subscribe({
        next: result => {
          console.log(`${result.result} - ${result.timestamp}`);
        },
        error: error => console.error('Parallel requests error:', error)
      });

    subscriptions.current.push(subscription);
  }, []);

  // 组件卸载时清理所有订阅
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="rxjs-demo">
      <h1>RxJS 操作符示例</h1>
      
      <section>
        <h2>1. Interval 示例</h2>
        <p>计数器: {count}</p>
        <p>这个示例展示了 interval 操作符，每秒递增一次，最多5次</p>
      </section>

      <section>
        <h2>2. 搜索防抖示例</h2>
        <input 
          id="searchInput"
          type="text"
          placeholder="输入搜索内容..."
          value={searchState.text}
          onChange={(e) => setSearchState(prev => ({ ...prev, text: e.target.value }))}
        />
        <ul>
          {searchState.results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
        <p>这个示例展示了 debounceTime 和 distinctUntilChanged 操作符的使用</p>
      </section>

      <section>
        <h2>3. 并行请求示例</h2>
        <button onClick={handleMultipleRequests}>
          触发并行请求
        </button>
        <p>这个示例展示了 mergeMap 操作符处理并行请求</p>
      </section>
    </div>
  );
};

export default RxjsDemo; 