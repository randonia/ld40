class Sushi extends GameObject {
  constructor() {
    super();
    this._sprite = game.add.sprite(this.x, this.y, 'sushi', 0);
    this._sprite.anchor.x = 0.5;
  }
}
