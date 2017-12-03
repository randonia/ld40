class FoodItem extends GameObject {
  get signals() {
    return this._signals;
  }
  constructor() {
    super();
    this._rounds = 0;
  }
  generateSteps() {
    throw new Error('Not Implemented');
  }
  // Implement a callback function
  handleAction() {
    throw new Error('Not Implemented');
  }
  doComplete() {
    throw new Error('Not Implemented');
  }
  destroy() {
    throw new Error('Not Implemented');
  }
}

// Helper class, kind of like an internal state machine
class Step {
  get complete() {
    return this._complete;
  }
  constructor(opts) {
    this._scope = opts.scope; // To be assigned if needed
    this._actionFn = opts.actionFn; // Make this resolve a promise
    this._completeFn = opts.completeFn; // Handles anything else
    this._ready = true;
  }
  doAction(callback) {
    if (!this._ready) {
      console.log('Cannot do this action: not ready', this);
      callback(ACTION_RESULTS.PENDING);
      return;
    }
    this._ready = false;
    this._actionFn().then(({
      result
    }) => {
      console.log('inner promise starting and completed', result);
      callback(result);
      this._complete = true;
      this._completeFn();
    });
  }
  destroy() {
    delete this._actionFn;
    delete this._completeFn;
    delete this._scope;
  }
}
