import { WaitLock } from '../src/index';
import 'mocha';
import chai from 'chai';

chai.use(require('sinon-chai'));


import sinon from 'sinon';

const expect = chai.expect;


describe('WaitLock', () => {
  let waitLock: WaitLock<number>;

  beforeEach(() => {
    waitLock = new WaitLock<number>();
  });

  afterEach(() => {
    waitLock.release();
  });

  it('should wait for the lock to be released', async () => {
    const promise = waitLock.wait(1000);
    const startTime = Date.now();

    setTimeout(() => {
      waitLock.release(42);
    }, 200);

    const result = await promise;
    const endTime = Date.now();

    expect(result).to.equal(42);
    expect(endTime - startTime).to.be.greaterThanOrEqual(200);
  });

  it('should resolve with undefined if no value is passed to release', async () => {
    const promise = waitLock.wait(1000);

    setTimeout(() => {
      waitLock.release();
    }, 200);

    const result = await promise;

    expect(result).to.be.equal(undefined);
  });

  it('should resolve immediately if no wait time is specified', async () => {
    const promise = waitLock.wait();

    waitLock.release(42);

    const result = await promise;

    expect(result).to.equal(42);
  });

  it('should resolve immediately if wait time is 0', async () => {
    const promise = waitLock.wait(0);

    waitLock.release(42);

    const result = await promise;

    expect(result).to.equal(42);
  });

  it('should not prevent the process from exiting when unref is true', async () => {
    const promise = waitLock.wait(1000, true);

    setTimeout(() => {
      waitLock.release(42);
    }, 200);

    const result = await promise;

    expect(result).to.equal(42);
  });

  it('should prevent the process from exiting when unref is false', async () => {
    const promise = waitLock.wait(1000, false);

    setTimeout(() => {
      waitLock.release(42);
    }, 200);

    const result = await promise;

    expect(result).to.equal(42);
  });

  it('should resolve all waiting promises when released', async () => {
    const promise1 = waitLock.wait(1000);
    const promise2 = waitLock.wait(1000);

    waitLock.release(42);

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).to.equal(42);
    expect(result2).to.equal(42);
  });

  it('should resolve with undefined after the specified wait time', async () => {
    const promise = waitLock.wait(200);

    const result = await promise;

    expect(result).to.be.equal(undefined);
  });

  it('should resolve with the value passed to release even if wait time is not over', async () => {
    const promise = waitLock.wait(1000);

    setTimeout(() => {
      waitLock.release(42);
    }, 200);

    const result = await promise;

    expect(result).to.equal(42);
  });

  it('should resolve with undefined if released without a value before wait time is over', async () => {
    const promise = waitLock.wait(1000);

    setTimeout(() => {
      waitLock.release();
    }, 200);

    const result = await promise;

    expect(result).to.be.equal(undefined);
  });

  it('should resolve with undefined if wait is called when there is no waiting list', async () => {
    const promise = waitLock.wait(100);
    waitLock['waitingList'] = [];
    const result = await promise;
    expect(result).to.be.equal(undefined);
  });

  it('should be reusable after being released', async () => {
    
    const promise1 = waitLock.wait(1000);
    setTimeout(() => {
      waitLock.release(42);
    }, 100);
    const result1 = await promise1;
    expect(result1).to.equal(42);

    const promise2 = waitLock.wait(1000);
    setTimeout(() => {
      waitLock.release(24);
    }, 100);
    const result2 = await promise2;
    expect(result2).to.equal(24);
  });

  it('should be reusable after wait time is over', async () => {
    const promise1 = waitLock.wait(100);
    const result1 = await promise1;
    expect(result1).to.be.equal(undefined);

    const promise2 = waitLock.wait(100);
    const result2 = await promise2;
    expect(result2).to.be.equal(undefined);
  });
});