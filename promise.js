const isFunction = (fn) => typeof fn === "function";

const PROMISE_STATES = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class SeanPromise {
  constructor(executor) {
    // init promise state
    this.PromiseState = PROMISE_STATES.PENDING;
    this.resolveCallbackQueues = [];
    this.rejectCallbackQueues = [];
    executor(this._resolve, this._reject);
  }

  static is(promise) {
    return promise instanceof SeanPromise;
  }

  /**
   * put this function in micro tasks
   * @param fuc
   */
  _putInMicrotasks = (fuc) => {
    queueMicrotask(fuc);
  };

  /**
   * change state to fulfilled
   * excute resolveCallbackQueues and clean it
   * @param value
   * @returns
   */
  _resolve = (value) => {
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
  _reject = (reason) => {
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

  then = (onFulfilled, onRejected) => {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected)
      ? onRejected
      : (err) => {
          throw err;
        };

    return new SeanPromise((resolve, reject) => {
      const handleFulfilled = (val) => {
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

      const handleRejected = (val) => {
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

  catch = (rejectCallback) => {
    return this.then(null, rejectCallback);
  };

  static resolve(value) {
    if (SeanPromise.is(value)) {
      return value;
    }
    return new SeanPromise((resolve) => resolve(value));
  }

  finally = (fianlCallback) => {
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
  static all = (promises) => {
    return new SeanPromise((resolve, reject) => {
      let resolvedPromisesResult = [];
      promises.forEach((promise, index) => {
        SeanPromise.resolve(promise)
          .then((res) => {
            resolvedPromisesResult.push(res);
            if (index === promises.length - 1) {
              resolve(resolvedPromisesResult);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  };
}

/**
 * use  promises-aplus-tests to validate our promise
 * @validation
 */
SeanPromise.deferred = function () {
  var result = {};
  result.promise = new SeanPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
};

module.exports = SeanPromise;
