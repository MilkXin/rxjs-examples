import { useEffect, useState, useRef } from 'react';
import { 
  interval, 
  merge, 
  concat, 
  forkJoin, 
  combineLatest,
  scan,
  take,
  map,
  Subscription
} from 'rxjs';

const AdvancedOperators = () => {
  const subscriptions = useRef<Subscription[]>([]);
  const [mergeResult, setMergeResult] = useState<number[]>([]);
  const [concatResult, setConcatResult] = useState<number[]>([]);
  const [forkJoinResult, setForkJoinResult] = useState<number[]>([]);
  const [combineLatestResult, setCombineLatestResult] = useState<number[]>([]);
  const [scanResult, setScanResult] = useState<number>(0);

  // 示例1: merge 操作符 - 合并多个数据流
  useEffect(() => {
    const source1 = interval(1000).pipe(take(3), map(x => x));
    const source2 = interval(500).pipe(take(3), map(x => x));
    
    const subscription = merge(source1, source2)
      .subscribe({
        next: (value: number) => setMergeResult(prev => [...prev, value])
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例2: concat 操作符 - 按顺序连接数据流
  useEffect(() => {
    const source1 = interval(1000).pipe(take(3), map(x => x));
    const source2 = interval(500).pipe(take(3), map(x => x));
    
    const subscription = concat(source1, source2)
      .subscribe({
        next: (value: number) => setConcatResult(prev => [...prev, value])
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例3: forkJoin 操作符 - 并行处理多个数据流
  useEffect(() => {
    const source1 = interval(1000).pipe(take(3), map(x => x));
    const source2 = interval(500).pipe(take(3), map(x => x));
    const source3 = interval(750).pipe(take(3), map(x => x));
    
    const subscription = forkJoin({
      source1,
      source2,
      source3
    }).subscribe({
      next: (result: Record<string, number>) => setForkJoinResult(Object.values(result))
    });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例4: combineLatest 操作符 - 组合最新的值
  useEffect(() => {
    const source1 = interval(1000).pipe(take(3), map(x => x));
    const source2 = interval(500).pipe(take(3), map(x => x));
    
    const subscription = combineLatest([source1, source2])
      .subscribe({
        next: ([val1, val2]: [number, number]) => setCombineLatestResult(prev => [...prev, val1 + val2])
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例5: scan 操作符 - 累积值
  useEffect(() => {
    const subscription = interval(1000)
      .pipe(
        take(5),
        scan((acc: number, curr: number) => acc + curr, 0)
      )
      .subscribe({
        next: value => setScanResult(value)
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="rxjs-example">
      <h2>高级操作符示例</h2>
      
      <section>
        <h3>1. Merge 操作符</h3>
        <p>结果: {mergeResult.join(', ')}</p>
        <p>说明：合并两个数据流，按时间顺序输出</p>
      </section>

      <section>
        <h3>2. Concat 操作符</h3>
        <p>结果: {concatResult.join(', ')}</p>
        <p>说明：按顺序连接两个数据流，第一个完成后才开始第二个</p>
      </section>

      <section>
        <h3>3. ForkJoin 操作符</h3>
        <p>结果: {forkJoinResult.join(', ')}</p>
        <p>说明：并行处理多个数据流，等待所有流完成后输出最终结果</p>
      </section>

      <section>
        <h3>4. CombineLatest 操作符</h3>
        <p>结果: {combineLatestResult.join(', ')}</p>
        <p>说明：组合多个数据流的最新值</p>
      </section>

      <section>
        <h3>5. Scan 操作符</h3>
        <p>累积值: {scanResult}</p>
        <p>说明：对数据流进行累积计算</p>
      </section>
    </div>
  );
};

export default AdvancedOperators; 