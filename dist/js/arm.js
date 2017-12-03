class Arm {
  set targetX(value) {
    this._targetX = value;
  }
  set targetY(value) {
    this._targetY = value;
  }
  set active(value) {
    this._noodle.visible = value;
  }
  get active() {
    return this._noodle.visible;
  }
  get ready() {
    return this.active && !this._target;
  }
  constructor(opts) {
    this._x = opts.startX;
    this._y = opts.startY;

    // Just use two points for now
    this._targetX = opts.targetX;
    this._targetY = opts.targetY;
    this._originalTargetX = opts.targetX;
    this._originalTargetY = opts.targetY;
    this._points = [
      new Phaser.Point(this._x, this._y),
      new Phaser.Point(this._targetX, this._targetY),
    ];
    // Do everything relative to world because it's easier
    this._noodle = game.add.rope(0, 0, 'noodle', null, this._points);
    this._noodle.visible = opts.active;
  }
  setTarget(target) {
    if (this._target) {
      return;
    }
    // Start tweening the second point to the target on set
    this._points[1].x = this._points[0].x;
    this._points[1].y = this._points[0].y;

    if (target.signals.onStepComplete) {
      target.signals.onStepComplete.add(this.onStepCompleteHandler, this);
    }
    this._tween = game.add.tween(this._points[1]).to({
      x: target.x,
      y: target.y
    }, 250, Phaser.Easing.Linear.None, true);
    this._tween.onComplete.add(() => {
      this._tween = undefined;
    });
    this._target = target;
  }
  onStepCompleteHandler(target) {
    if (target.signals.onStepComplete) {
      target.signals.onStepComplete.remove(this.onStepCompleteHandler, this);
      this._target = undefined;
    }
  }
  update() {
    if (this._target && !this._tween) {
      this._points[1].x = this._target.x;
      this._points[1].y = this._target.y;
    } else if (!this._target) {
      this._points[1].x = this._originalTargetX;
      this._points[1].y = this._originalTargetY;
    }
  }
}
