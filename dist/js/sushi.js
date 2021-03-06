class Sushi extends FoodItem {
  constructor() {
    super({
      x: -150,
      y: -150
    });
    this._sprite = game.add.sprite(this.x, this.y, 'sushi', 0);
    this._sprite.anchor.x = 0.5;
    this._sprite.visible = false;
    this._steps = this.generateSteps();
    this._step = 0;
    this._signals = {
      onItemComplete: new Phaser.Signal(),
      onStepComplete: new Phaser.Signal(),
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
              accept({
                result: ACTION_RESULTS.SUCCESS
              })
            }, (ENV.debug) ? 150 : 1500);
          });
        },
        completeFn: () => {
          this._sprite.frame = 1;
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
              accept({
                result: ACTION_RESULTS.SUCCESS
              })
            }, (ENV.debug) ? 150 : 1500);
          });
        },
        completeFn: () => {
          this._sprite.frame = 2;
          this.nextStep();
        },
      }),
      // Step 3: Plate
      new Step({
        scope: this,
        actionFn: () => {
          console.log('Simple just add plate');
          return new Promise((accept) => {
            setTimeout(() => {
              accept({
                result: ACTION_RESULTS.SUCCESS
              });
            }, 700);
          })
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
    this._sprite.visible = true;
    if (this._emitter) {
      this._emitter.x = this.x;
      this._emitter.y = this.sprite.bottom;
    }
  }
  doComplete() {
    // Just tween somewhere spinning I guess and maybe add some sparkes
    const emitter = game.add.emitter(this.x, this.y, 100);
    emitter.makeParticles('effects', [0, 1, 2, 3]);
    emitter.start(false, 2000, 15);
    this._emitter = emitter;
    this._tween = game.add.tween(this).to({
      _x: Math.random() * game.world.width,
      _y: -200,
    }, 500, Phaser.Easing.Linear.None, true);
    this._tween.onComplete.add(() => {
      this.destroy();
    }, this);
  }
  destroy() {
    delete this._tween;
    this._sprite.destroy();
    if (this._emitter) {
      this._emitter.on = false;
      setTimeout(() => {
          this._emitter.destroy();
          delete this._emitter;
        },
        1000);
    }
    let step;
    while ((step = this._steps.pop())) {
      step.destroy();
    }
  }
  handleAction(completionFn) {
    if (this.grabbed) {
      return;
    }
    this.grabbed = true;
    if (this._step < this._steps.length) {
      this._steps[this._step].doAction(completionFn);
    }
  }
  nextStep() {
    this._signals.onStepComplete.dispatch(this);
    this._step++;
    if (this._step === this._steps.length) {
      // we've completed all the steps!
      console.log('COMPLETED ALL STEPS! TODO: Dispatch a signal here');
      // Dispatch the signal
      this._signals.onItemComplete.dispatch(this);
      return;
    } else {
      this.grabbed = false;
      console.log('new step is:', this._step);
    }
    if (this._step >= this._steps.length) {
      console.error('Something bad has happened, we are past our steps');
    }
  }
}
