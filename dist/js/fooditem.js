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
}
