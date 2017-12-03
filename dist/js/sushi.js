class Sushi extends FoodItem {
  constructor() {
    super();
    this._sprite = game.add.sprite(this.x, this.y, 'sushi', 0);
    this._sprite.anchor.x = 0.5;
    this._steps = this.generateSteps();
    this._step = 0;
    this._signals = {
      onItemComplete: new Phaser.Signal(),
    };
  }
  generateSteps() {
    return [
    // Step 1: Cut
    new Step({
      scope: this,
      actionFn: () => {
        console.log('Starting Cut action for sushi');
        return new Promise((accept) => {
          setTimeout(() => {
            this._sprite.frame = 1;
            accept({ result: ACTION_RESULTS.SUCCESS })
          }, 1500);
        });
      },
      completeFn: () => {
        this.nextStep();
      },
    }),
    // Step 2: Slice
    new Step({
      scope: this,
      actionFn: () => {
        console.log('Starting slice action for sushi');
        return new Promise((accept) => {
          setTimeout(() => {
            this._sprite.frame = 2;
            accept({ result: ACTION_RESULTS.SUCCESS })
          }, 1500);
        });
      },
      completeFn: () => {
        this.nextStep();
      },
    }),
    // Step 3: Plate
    new Step({
      scope: this,
      actionFn: () => {
        console.log('Simple just add plate');
        return Promise.resolve({ result: ACTION_RESULTS.SUCCESS });
      },
      completeFn: () => {
        console.log('Give it a plate or something');
        this.nextStep();
      }
    }),
    ];
  }
  handleAction(callback) {
    this._steps[this._step].doAction(callback);
  }
  nextStep() {
    this._step++;
    if (this._step === this._steps.length) {
      // we've completed all the steps!
      console.log('COMPLETED ALL STEPS! TODO: Dispatch a signal here');
      // Dispatch the signal
      this._signals.onItemComplete.dispatch(this);
      return;
    } else {
      console.log('new step is:', this._step);
    }
    if (this._step >= this._steps.length) {
      console.error('Something bad has happened, we are past our steps');
    }
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
    this._actionFn().then(({ result }) => {
      console.log('inner promise starting and completed', result);
      callback(result);
      this._complete = true;
      this._completeFn();
    });
  }
}
