import { useEffect, useState, useRef } from 'react';
import { 
  interval, 
  throwError, 
  of, 
  retry, 
  retryWhen, 
  delay, 
  catchError,
  timeout,
  take,
  map,
  Subscription
} from 'rxjs';

const ErrorHandling = () => {
  const subscriptions = useRef<Subscription[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeoutMessage, setTimeoutMessage] = useState('');

  // 示例1: retry 操作符 - 重试失败的操作
  useEffect(() => {
    let attempts = 0;
    const subscription = interval(1000)
      .pipe(
        map(() => {
          attempts++;
          if (attempts <= 3) {
            throw new Error('模拟错误');
          }
          return attempts;
        }),
        retry(3), // 重试3次
        catchError(error => of(`最终错误: ${error.message}`))
      )
      .subscribe({
        next: value => {
          if (typeof value === 'number') {
            setRetryCount(value);
          }
        },
        error: error => setErrorMessage(error.message)
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例2: retryWhen 操作符 - 自定义重试逻辑
  useEffect(() => {
    let attempts = 0;
    const subscription = interval(1000)
      .pipe(
        map(() => {
          attempts++;
          if (attempts <= 3) {
            throw new Error('需要重试');
          }
          return attempts;
        }),
        retryWhen(errors => 
          errors.pipe(
            delay(2000), // 延迟2秒后重试
            take(3) // 最多重试3次
          )
        ),
        catchError(error => of(`最终错误: ${error.message}`))
      )
      .subscribe({
        next: value => console.log('重试结果:', value),
        error: error => console.error('重试错误:', error)
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  // 示例3: timeout 操作符 - 超时处理
  useEffect(() => {
    const subscription = interval(2000)
      .pipe(
        map(value => value.toString()),
        timeout(1000), // 1秒超时
        catchError(error => {
          if (error.name === 'TimeoutError') {
            return of('操作超时');
          }
          return throwError(() => error);
        })
      )
      .subscribe({
        next: value => setTimeoutMessage(value),
        error: error => setTimeoutMessage(`错误: ${error.message}`)
      });

    subscriptions.current.push(subscription);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="rxjs-example">
      <h2>错误处理和重试示例</h2>
      
      <section>
        <h3>1. Retry 操作符</h3>
        <p>尝试次数: {retryCount}</p>
        <p>错误信息: {errorMessage}</p>
        <p>说明：在失败时自动重试3次</p>
      </section>

      <section>
        <h3>2. RetryWhen 操作符</h3>
        <p>说明：自定义重试逻辑，延迟2秒后重试，最多3次</p>
        <p>请查看控制台输出</p>
      </section>

      <section>
        <h3>3. Timeout 操作符</h3>
        <p>状态: {timeoutMessage}</p>
        <p>说明：设置1秒超时，超时后返回错误信息</p>
      </section>
    </div>
  );
};

export default ErrorHandling; 