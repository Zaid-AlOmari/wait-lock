
/** A promise that can be resolved from outside */
type Waiter<T> = ((value: T | PromiseLike<T> | undefined) => void);

/**
 * A lock that can be waited on and released from outside
 */
export class WaitLock<T = boolean> {

  /** A list of waiting promises */
  private waitingList: {
    resolve: Waiter<T>,
    timer?: NodeJS.Timeout
  }[] = [];

  /**
   * Wait for the lock to be released
   * @param ms time to wait in ms before resolving with undefined
   * @param unref a flag when it's true the timer will not prevent the node.js process from exiting
   * @returns a promise that resolves with the value passed to release
   */
  wait(ms?: number, unref = true) {
    const p = new Promise<T | undefined>(
      resolve => {
        let timer: NodeJS.Timeout | undefined = undefined;
        if (typeof ms !== 'undefined') {
          timer = setTimeout(() => {
            const index = this.waitingList.indexOf(waiter);
            if (index !== -1) this.waitingList.splice(index, 1);
            waiter.resolve(undefined);
          }, ms);
          if (unref) timer.unref();
        }
        const waiter = { resolve, timer };
        this.waitingList.push(waiter);
      }
    );
    return p;
  }

  /**
   * Release the lock and resolve all waiting promises with the value passed to this function
   * @param value the value to resolve the waiting promises with
   */
  release(value?: T) {
    const oldList = this.waitingList;
    this.waitingList = [];
    for (const waiter of oldList) {
      if (waiter.timer) clearTimeout(waiter.timer);
      waiter.resolve(value);
    }
  }
}