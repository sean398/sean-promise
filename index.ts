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
export default class SeanPromist {
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

  _putInEventLoop = (fuc: IFunction) => {
    setTimeout(fuc, 0);
  };

  /**
   * change state to fulfilled
   * excute resolveCallbackQueues and clean it
   * @param value
   * @returns
   */
  _resolve = (value?: any) => {
    this._putInEventLoop(() => {
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
   * @returns
   */
  _reject = (reason?: any) => {
    this._putInEventLoop(() => {
      if (this.PromiseState !== PROMISE_STATES.PENDING) return;
      while (this.rejectCallbackQueues.length > 0) {
        const fn = this.rejectCallbackQueues.shift();
        isFunction(fn) && fn(reason);
      }
      this.PromiseState = PROMISE_STATES.REJECTED;
      this.PromiseResult = reason;
    });
  };

  then = (onFullied?: IFunction, onRejected?: IFunction) => {
    switch (this.PromiseState) {
      case PROMISE_STATES.PENDING:
        isFunction(onFullied) && this.resolveCallbackQueues.push(onFullied);
        isFunction(onRejected) && this.rejectCallbackQueues.push(onRejected);
        break;
      case PROMISE_STATES.FULFILLED:
        isFunction(onFullied) && onFullied(this.PromiseResult);
        break;
      case PROMISE_STATES.REJECTED:
        isFunction(onRejected) && onRejected(this.PromiseResult);
        break;
    }
    return this;
  };
}
