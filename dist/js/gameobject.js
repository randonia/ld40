class GameObject {
  get sprite() {
    return this._sprite;
  }
  get x() {
    return this._x;
  }
  set x(value) {
    this._x = value;
  }
  get y() {
    return this._y;
  }
  set y(value) {
    this._y = value;
  }
  constructor() {
    this.x = this.y = 0;
  }
  update(delta) {
    if (this._sprite) {
      this._sprite.position.set(this.x, this.y);
    }
  }
  render() {}
}
