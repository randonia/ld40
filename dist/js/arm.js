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
  constructor(opts) {
    this._x = opts.startX;
    this._y = opts.startY;

    // Just use two points for now
    this._targetX = opts.targetX;
    this._targetY = opts.targetY;
    this._points = [
      new Phaser.Point(this._x, this._y),
      new Phaser.Point(this._targetX, this._targetY),
    ];
    // Do everything relative to world because it's easier
    this._noodle = game.add.rope(0, 0, 'noodle', null, this._points);
    this._noodle.visible = opts.active;
  }
  update() {
    this._points[1].x = this._targetX;
    this._points[1].y = this._targetY;
  }
}
