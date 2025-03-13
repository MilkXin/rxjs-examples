import { useEffect, useState, useRef } from 'react';
import { 
  interval, 
  map, 
  filter, 
  take, 
  takeWhile, 
  tap,
  finalize,
  Subscription
} from 'rxjs';

const BasicOperators = () => {
  const subscriptions = useRef<Subscription[]>([]);
  const [count, setCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // 示例1: map 操作符 - 数据转换
  useEffect(() => {
    const subscription = interval(1000)
      .pipe(
        take(5),
        map(x => x * 2), // 将每个值乘以2
        tap(x => console.log('原始值:', x)), // 用于调试，不影响数据流
        finalize(() => console.log('数据流完成')) // 在完成时执行
      )
      .subscribe({
        next: value => setCount(value),
        complete: () => console.log('订阅完成')
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例2: filter + takeWhile 操作符 - 条件过滤
  useEffect(() => {
    setIsRunning(true);
    const subscription = interval(1000)
      .pipe(
        map(x => x + 1),
        filter(x => x % 2 === 0), // 只保留偶数
        takeWhile(x => x <= 10), // 当值大于10时停止
        tap(x => console.log('过滤后的值:', x))
      )
      .subscribe({
        next: value => setFilteredCount(value),
        complete: () => setIsRunning(false)
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="rxjs-example">
      <h2>基础操作符示例</h2>
      
      <section>
        <h3>1. Map 操作符</h3>
        <p>原始值: {count}</p>
        <p>说明：将每个值乘以2，使用 tap 进行调试输出</p>
      </section>

      <section>
        <h3>2. Filter + TakeWhile 操作符</h3>
        <p>过滤后的值: {filteredCount}</p>
        <p>状态: {isRunning ? '运行中' : '已完成'}</p>
        <p>说明：只保留偶数，当值大于10时停止</p>
      </section>
    </div>
  );
};

export default BasicOperators; 