class Player extends GameObject {
  constructor() {
    super();
    this._sprite = game.add.sprite(this.x, this.y, 'player');
    this._sprite.scale.set(2, 2);
    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 1;
  }
}
