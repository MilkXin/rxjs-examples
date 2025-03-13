import { useEffect, useState, useRef, useCallback } from 'react';
// 导入所需的 RxJS 操作符和类型
import { 
  Subject,          // 用于创建基本的可观察对象
  BehaviorSubject,  // 带有初始值的 Subject
  timer,            // 用于创建定时器
  from,             // 将其他类型转换为 Observable
  race,             // 多个 Observable 竞争，取最快的一个
  map,              // 转换数据
  debounceTime,     // 防抖操作符
  throttleTime,     // 节流操作符
  distinctUntilChanged,  // 去重，直到值变化
  concatMap,        // 按顺序处理异步操作
  skip,             // 跳过指定数量的值
  fromEvent,        // 将 DOM 事件转换为 Observable
  Subscription      // 用于管理订阅
} from 'rxjs';

// 定义任务接口
interface Task {
  id: number;           // 任务唯一标识
  name: string;         // 任务名称
  status: 'pending' | 'completed' | 'failed';  // 任务状态
}

// 高级模式示例组件
const AdvancedPatterns = () => {
  // 存储所有订阅，用于组件卸载时清理
  const subscriptions = useRef<Subscription[]>([]);
  
  // 状态管理
  const [clickCount, setClickCount] = useState(0);         // 记录防抖点击次数
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });  // 记录鼠标位置
  const [tasks, setTasks] = useState<Task[]>([]);         // 存储任务列表
  const [currentValue, setCurrentValue] = useState<number>(0);  // 当前同步值
  
  // Subject 实例
  const taskSubject = useRef(new Subject<Task>());        // 用于任务队列处理
  const valueSubject = useRef(new BehaviorSubject<number>(0));  // 用于值同步

  // 示例1: 事件节流与防抖的对比
  // 展示了防抖和节流在处理频繁事件时的区别
  useEffect(() => {
    const button = document.getElementById('clickButton');
    if (!button) return;

    // 创建点击事件流
    const click$ = fromEvent(button, 'click');
    
    // 防抖处理：等待300ms静默期后才触发
    const debouncedSub = click$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      setClickCount(prev => prev + 1);
      console.log('防抖点击触发');
    });

    // 节流处理：每300ms最多触发一次
    const throttledSub = click$.pipe(
      throttleTime(300)
    ).subscribe(() => {
      console.log('节流点击触发');
    });

    // 保存订阅以便清理
    subscriptions.current.push(debouncedSub, throttledSub);
    return () => {
      debouncedSub.unsubscribe();
      throttledSub.unsubscribe();
    };
  }, []);

  // 示例2: 鼠标移动轨迹追踪
  // 使用节流来优化鼠标移动事件的处理频率
  useEffect(() => {
    const mouseMoves$ = fromEvent<MouseEvent>(document, 'mousemove');
    
    const subscription = mouseMoves$.pipe(
      throttleTime(50),  // 限制更新频率为每50ms一次
      map(event => ({
        x: event.clientX,
        y: event.clientY
      }))
    ).subscribe(pos => setMousePosition(pos));

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例3: 任务队列处理
  // 使用 concatMap 确保任务按顺序执行
  useEffect(() => {
    // 模拟异步任务处理
    const processTask = (task: Task): Promise<Task> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...task,
            status: Math.random() > 0.3 ? 'completed' : 'failed'
          });
        }, 1000);
      });
    };

    // 使用 concatMap 确保任务按顺序处理
    const subscription = taskSubject.current.pipe(
      concatMap(task => from(processTask(task)))
    ).subscribe(processedTask => {
      setTasks(prev => prev.map(t => 
        t.id === processedTask.id ? processedTask : t
      ));
    });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例4: 竞态条件处理
  // 使用 race 操作符处理多个并发请求
  useEffect(() => {
    const slow$ = timer(3000).pipe(map(() => 'Slow Response'));
    const fast$ = timer(1000).pipe(map(() => 'Fast Response'));
    
    // race 操作符会选择最先完成的 Observable
    const subscription = race(slow$, fast$).subscribe(winner => {
      console.log('Race winner:', winner);
    });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例5: 值的同步更新
  // 使用 BehaviorSubject 实现值的同步更新
  useEffect(() => {
    const subscription = valueSubject.current.pipe(
      distinctUntilChanged(),  // 只有当值变化时才触发
      skip(1)  // 跳过初始值
    ).subscribe(value => {
      setCurrentValue(value);
      console.log('Value updated:', value);
    });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 添加新任务到队列
  const addTask = useCallback(() => {
    const newTask: Task = {
      id: Date.now(),
      name: `Task ${tasks.length + 1}`,
      status: 'pending'
    };
    setTasks(prev => [...prev, newTask]);
    taskSubject.current.next(newTask);
  }, [tasks.length]);

  // 更新同步值
  const updateValue = useCallback(() => {
    const newValue = Math.floor(Math.random() * 100);
    valueSubject.current.next(newValue);
  }, []);

  return (
    <div className="rxjs-example">
      <h2>高级模式示例</h2>

      {/* 防抖与节流示例 */}
      <section>
        <h3>1. 防抖与节流对比</h3>
        <button id="clickButton">快速点击</button>
        <p>防抖计数: {clickCount}</p>
        <p>说明：请快速点击按钮，观察控制台输出的防抖和节流效果差异</p>
      </section>

      {/* 鼠标移动追踪示例 */}
      <section>
        <h3>2. 鼠标移动追踪</h3>
        <p>当前位置: X: {mousePosition.x}, Y: {mousePosition.y}</p>
        <p>说明：在页面上移动鼠标，观察坐标变化</p>
      </section>

      {/* 任务队列处理示例 */}
      <section>
        <h3>3. 任务队列</h3>
        <button onClick={addTask}>添加任务</button>
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              {task.name} - {task.status}
            </li>
          ))}
        </ul>
        <p>说明：任务会按顺序处理，每个任务耗时1秒</p>
      </section>

      {/* 值同步示例 */}
      <section>
        <h3>4. 值同步</h3>
        <button onClick={updateValue}>更新值</button>
        <p>当前值: {currentValue}</p>
        <p>说明：使用 BehaviorSubject 管理状态</p>
      </section>
    </div>
  );
};

export default AdvancedPatterns; 