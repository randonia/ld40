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
          }, (ENV.debug) ? 150 : 1500);
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
          }, (ENV.debug) ? 150 : 1500);
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
        this._sprite.frame = 3;
        this.nextStep();
      }
    }),
    ];
  }
  update(delta) {
    super.update();
    if (this._emitter) {
      this._emitter.x = this.x;
      this._emitter.y = this.sprite.bottom;
    }
  }
  doComplete() {
    // Just tween somewhere spinning I guess and maybe add some sparkes
    const emitter = game.add.emitter(this.x, this.y, 100);
    emitter.makeParticles('effects', [0,1,2,3]);
    emitter.start(false, 2000, 15);
    this._emitter = emitter;
    this._tween = game.add.tween(this).to( { _x: Math.random() * game.world.width, _y: -200 }, 3500, Phaser.Easing.Cubic.Out, true);
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
