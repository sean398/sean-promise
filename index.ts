enum PROMISE_STATES {
  PENDING = "pending",
  FULFILLED = "fulfilled",
  REJECTED = "rejected",
}

type IFunction = {
  (value?: any): any;
};

type PromiseStates =
  | PROMISE_STATES.PENDING
  | PROMISE_STATES.FULFILLED
  | PROMISE_STATES.REJECTED;

interface IExecutorFn {
  (resolve: IFunction, reject: IFunction): any;
}

export const isFunction = (fn: any): boolean => typeof fn === "function";
export const isObject = (obj: any): boolean => typeof obj === "object";
class SeanPromise {
  protected PromiseState: PromiseStates;
  protected PromiseResult: any;
  protected resolveCallbackQueues: IFunction[];
  protected rejectCallbackQueues: IFunction[];

  constructor(executor: IExecutorFn) {
    // init promise state
    this.PromiseState = PROMISE_STATES.PENDING;
    this.resolveCallbackQueues = [];
    this.rejectCallbackQueues = [];
    executor(this._resolve, this._reject);
  }

  static is(promise: SeanPromise) {
    return promise instanceof SeanPromise;
  }

  /**
   * put this function in micro tasks
   * @param fuc
   */
  _putInMicrotasks = (fuc: IFunction) => {
    queueMicrotask(fuc);
  };

  /**
   * change state to fulfilled
   * excute resolveCallbackQueues and clean it
   * @param value
   * @returns
   */
  _resolve = (value?: any) => {
    this._putInMicrotasks(() => {
      if (this.PromiseState !== PROMISE_STATES.PENDING) return;
      while (this.resolveCallbackQueues.length > 0) {
        const fn = this.resolveCallbackQueues.shift();
        isFunction(fn) && fn(value);
      }
      this.PromiseState = PROMISE_STATES.FULFILLED;
      this.PromiseResult = value;
    });
  };

  /**
   * change state to rejected
   * excute rejectCallbackQueues and clean it
   * @param reject_reason
   * @returns000
   */
  _reject = (reason?: any) => {
    this._putInMicrotasks(() => {
      if (this.PromiseState !== PROMISE_STATES.PENDING) return;
      while (this.rejectCallbackQueues.length > 0) {
        const fn = this.rejectCallbackQueues.shift();
        isFunction(fn) && fn(reason);
      }
      this.PromiseState = PROMISE_STATES.REJECTED;
      this.PromiseResult = reason;
    });
  };

  then = (onFulfilled?: IFunction, onRejected?: IFunction) => {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected)
      ? onRejected
      : (err) => {
          throw err;
        };

    return new SeanPromise((resolve, reject) => {
      const handleFulfilled = (val: any) => {
        try {
          const res = onFulfilled(val);
          if (SeanPromise.is(res)) {
            res.then(resolve, reject);
          } else {
            resolve(res);
          }
        } catch (error) {
          // reject if error happen
          reject(error);
        }
      };

      const handleRejected = (val: any) => {
        try {
          const res = onRejected(val);
          reject(res);
        } catch (error) {
          reject(error);
        }
      };

      switch (this.PromiseState) {
        case PROMISE_STATES.PENDING:
          this.resolveCallbackQueues.push(handleFulfilled);
          this.rejectCallbackQueues.push(handleRejected);
          break;
        case PROMISE_STATES.FULFILLED:
          handleFulfilled(this.PromiseResult);
          break;
        case PROMISE_STATES.REJECTED:
          handleRejected(this.PromiseResult);
          break;
      }
    });
  };

  catch = (rejectCallback: IFunction | null) => {
    return this.then(null, rejectCallback);
  };

  static resolve(value?: any) {
    if (SeanPromise.is(value)) {
      return value;
    }
    return new SeanPromise((resolve) => resolve(value));
  }

  finally = (fianlCallback: IFunction | null) => {
    return this.then(
      (val) =>
        SeanPromise.resolve(fianlCallback && fianlCallback()).then(() => val),
      (err) =>
        SeanPromise.resolve(fianlCallback && fianlCallback()).then(() => {
          throw err;
        })
    );
  };

  /**
   * @all get a promise queues
   */
  static all = (promises: Array<IFunction>) => {
    return new SeanPromise((resolve, reject) => {
      let resolvedPromisesResult = <any>[];
      promises.forEach((promise, index) => {
        SeanPromise.resolve(promise)
          .then((res: any) => {
            resolvedPromisesResult.push(res);
            if (index === promises.length - 1) {
              resolve(resolvedPromisesResult);
            }
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    });
  };

  /**
   * use  promises-aplus-tests to validate our promise
   * @validation
   */
  static deferred() {
    let defer: any = {};
    defer.promise = new SeanPromise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    return defer;
  }
}

module.exports = SeanPromise;
