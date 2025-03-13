import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  fromEvent, 
  debounceTime, 
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  map,
  filter,
  Subscription
} from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

interface FormData {
  name: string;
  email: string;
}

// 将 mockApi 移到组件外部
const mockApi = {
  searchUsers: (query: string): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: '张三', email: 'zhangsan@example.com' },
          { id: 2, name: '李四', email: 'lisi@example.com' },
          { id: 3, name: '王五', email: 'wangwu@example.com' }
        ].filter(user => 
          user.name.includes(query) || 
          user.email.includes(query)
        ));
      }, 500);
    });
  },
  saveUser: (user: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.floor(Math.random() * 1000),
          ...user
        });
      }, 500);
    });
  }
};

const RealWorldExamples = () => {
  const subscriptions = useRef<Subscription[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });

  // 示例1: 实时搜索
  useEffect(() => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const subscription = fromEvent<InputEvent>(searchInput, 'input')
      .pipe(
        map(e => (e.target as HTMLInputElement).value),
        debounceTime(300),
        distinctUntilChanged(),
        filter((query: string) => query.length >= 2),
        switchMap(query => {
          setIsLoading(true);
          setError(null);
          return mockApi.searchUsers(query);
        }),
        catchError(error => {
          setError(error.message);
          return of([]);
        })
      )
      .subscribe({
        next: results => {
          setSearchResults(results);
          setIsLoading(false);
        },
        error: error => {
          setError(error.message);
          setIsLoading(false);
        }
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例2: 表单验证和提交
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const subscription = of(formData)
      .pipe(
        map(data => ({
          name: data.name.trim(),
          email: data.email.trim()
        })),
        filter((data: FormData) => Boolean(data.name && data.email)),
        switchMap(data => mockApi.saveUser(data)),
        catchError(error => {
          setError(error.message);
          return of(null);
        })
      )
      .subscribe({
        next: result => {
          if (result) {
            console.log('用户保存成功:', result);
            setFormData({ name: '', email: '' });
          }
        }
      });

    subscriptions.current.push(subscription);
  }, [formData]);

  return (
    <div className="rxjs-example">
      <h2>实际应用场景示例</h2>
      
      <section>
        <h3>1. 实时搜索</h3>
        <input 
          id="searchInput"
          type="text"
          placeholder="搜索用户..."
          className="search-input"
        />
        {isLoading && <p>加载中...</p>}
        {error && <p className="error">{error}</p>}
        <ul className="results-list">
          {searchResults.map(user => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
        <p>说明：实现了实时搜索功能，包含防抖、错误处理和加载状态</p>
      </section>

      <section>
        <h3>2. 表单处理</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="姓名"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="邮箱"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <button type="submit">提交</button>
        </form>
        <p>说明：展示了表单验证和异步提交的处理方式</p>
      </section>
    </div>
  );
};

export default RealWorldExamples; 