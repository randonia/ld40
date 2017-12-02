class Sushi extends GameObject {
  constructor() {
    super();
    this._sprite = game.add.sprite(this.x, this.y, 'sushi', 0);
  }
}
