// Map the Tier:Level:Index values to each keyCode
var ZONE_TIERS = [
  [
    [Phaser.KeyCode.R, Phaser.KeyCode.U],
    [Phaser.KeyCode.E, Phaser.KeyCode.R, Phaser.KeyCode.U, Phaser.KeyCode.I],
    [Phaser.KeyCode.W, Phaser.KeyCode.E, Phaser.KeyCode.R, Phaser.KeyCode.U, Phaser.KeyCode.I, Phaser.KeyCode.O],
    [Phaser.KeyCode.Q, Phaser.KeyCode.W, Phaser.KeyCode.E, Phaser.KeyCode.R, Phaser.KeyCode.U, Phaser.KeyCode.I, Phaser.KeyCode.O, Phaser.KeyCode.P],
  ],
  [
    [Phaser.KeyCode.F, Phaser.KeyCode.J],
    [Phaser.KeyCode.D, Phaser.KeyCode.F, Phaser.KeyCode.J, Phaser.KeyCode.K],
    [Phaser.KeyCode.S, Phaser.KeyCode.D, Phaser.KeyCode.F, Phaser.KeyCode.J, Phaser.KeyCode.K, Phaser.KeyCode.L],
    [Phaser.KeyCode.A, Phaser.KeyCode.S, Phaser.KeyCode.D, Phaser.KeyCode.F, Phaser.KeyCode.J, Phaser.KeyCode.K, Phaser.KeyCode.L, Phaser.KeyCode.COLON],
  ],
  [
    [Phaser.KeyCode.V, Phaser.KeyCode.N],
    [Phaser.KeyCode.C, Phaser.KeyCode.V, Phaser.KeyCode.N, Phaser.KeyCode.M],
    [Phaser.KeyCode.X, Phaser.KeyCode.C, Phaser.KeyCode.V, Phaser.KeyCode.N, Phaser.KeyCode.M, Phaser.KeyCode.COMMA],
    [Phaser.KeyCode.Z, Phaser.KeyCode.X, Phaser.KeyCode.C, Phaser.KeyCode.V, Phaser.KeyCode.N, Phaser.KeyCode.M, Phaser.KeyCode.COMMA, Phaser.KeyCode.PERIOD],
  ],
]
// Message flags
const ACTION_RESULTS = {
  SUCCESS: 0x0001,
  FAILURE: 0x0002,
  MISS: 0x0004,
  PENDING: 0x0008,
};
class Zone extends GameObject {
  // Given _tier and _idx, return a sprite index
  get spriteIndex() {
    const row = this._tier;
    const col = KEYS[row].indexOf(this.keyCode);
    const spriteIdx = (row * 8) + (col);
    return spriteIdx;
  }
  // KeyCode is a function of tier & index
  get keyCode() {
    if ([0, 1, 2, 3].includes(this._tier)) {
      return ZONE_TIERS[this._tier][this._level][this._idx];
    }
    console.warn('Tried to get keyCode for a misconfigured Zone');
    return -1;
  }
  get color() {
    return Object.assign({}, this._color);
  }
  get rect() {
    return this._rect;
  }
  constructor(opts) {
    super();
    this._rect = opts.rect;
    this._tier = opts.tier;
    this._level = opts.level;
    this._idx = opts.idx; // Map to keycode
    this._sprite = game.add.sprite(this.x, this.y, 'letters', this.spriteIndex);
    this._sprite.anchor.set(0.5, 0.5);
    this._color = {
      r: parseInt(Math.random() * 255),
      g: parseInt(Math.random() * 255),
      b: parseInt(Math.random() * 255),
    };
  }
  // Pass in a function callback that accepts an ACTION_RESULTS value
  handleAction(callback) {
    if (this.occupied && this.occupant) {
      this.occupant.handleAction(callback);
    } else {
      callback(ACTION_RESULTS.MISS);
    }
  }
  update() {
    // Intentionally do not update the sprite using regular GameObject#update
    this._sprite.position.set(this._rect.centerX, this._rect.centerY - this._sprite.height);
    const occupied = this.occupied && this.occupant;
    if (ENV.debug) {
      // For debugging just tint it disabled looking
      this._sprite.tint = (occupied) ? 0xFFFFFF : 0xFF3333;
    } else {
      this._sprite.visible = occupied;
    }
  }
  render() {
    if (ENV.debug) {
      const alpha = this.occupied ? 0.75 : 0.25;
      const cD = this.color
      const color = `rgba(${cD.r},${cD.g},${cD.b},${alpha})`;
      game.debug.geom(this.rect, color);
    }
  }
  destroy() {
    this._sprite.destroy();
  }
}
