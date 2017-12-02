var BELTSPEED = parseInt(ENV.BELTSPEED) || 50;
class Belt extends GameObject {
  // Use -1 for left and 1 for right
  get direction() {
    return this._direction;
  }
  get speed() {
    return this._speed;
  }
  set speed(value) {
    this._speed = value;
  }
  set nextBelt(belt) {
    this._nextBelt = belt;
  }
  get tier() {
    return this._tier;
  }
  constructor(opts = {}) {
    super();
    this._items = [];
    this._speed = BELTSPEED; // px/second
    this._tier = opts.tier;
    this._direction = opts.direction || 0;
    this._nextBelt = opts.nextBelt || undefined;
    this._sprite = game.add.tileSprite(this.x, this.y, 800, 100, 'belt');
    this.generateZones();

  }
  generateZones() {
    if (!this._zones) {
      this._zones = [];
    }
    // destruct zones
    let dZ;
    while ((dZ = this._zones.shift())) {
      // Deprocess zone
      console.log('Destroying zone', dZ);
    }
    const playerLevel = player.level;
    // Build level * 2 + 2 zones
    const numToBuild = playerLevel * 2 + 2;
    const width = this.sprite.width;
    const rHeight = this.sprite.height;
    const rWidth = width / numToBuild;
    for (var currZoneIdx = 0; currZoneIdx < numToBuild; currZoneIdx++) {
      const rX = currZoneIdx * rWidth;
      const rY = this.y;
      const rect = new Phaser.Rectangle(rX, rY, rWidth, rHeight);
      this._zones.push({
        rect,
        color: `rgba(${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)},${parseInt(Math.random() * 255)}, 0.5)`,
      });
    }
  }
  update(delta) {
    super.update(delta);
    const deltaPos = this._direction * this.speed * delta;
    this.sprite.tilePosition.x += deltaPos;
    for (var i = 0; i < this._items.length; i++) {
      const itemData = this._items[i];
      itemData.delta += deltaPos;
      // Set the position based on left or right
      this.setItemPosition(itemData);
      const offTheBelt = this.itemIsOnBelt(itemData.item);
      // Skip the first tick
      if (!itemData.new && offTheBelt) {
        // This item is off the conveyor!
        console.log('ITEM OFF CONVEYOR:', this, itemData);
        this.removeItem(itemData.item);
      }
      if (itemData.new) {
        itemData.new = false;
      }
    }
    // Move the zones
    for (var zIdx = 0; zIdx < this._zones.length; zIdx++) {
      this._zones[zIdx].rect.y = this.y;
    }
  }
  render() {
    if (ENV.debug) {
      for (var zoneIdx = 0; zoneIdx < this._zones.length; zoneIdx++) {
        const zoneData = this._zones[zoneIdx];
        game.debug.geom(zoneData.rect, zoneData.color);
      }
    }
  }
  connectSignals(signals) {
    if (signals.onArmKeyPress) {
      signals.onArmKeyPress.add(this.onArmKeyPress, this);
    }
  }
  disconnectSignals(signals) {
    if (signals.onArmKeyPress) {
      signals.onArmKeyPress.remove(this.onArmKeyPress, this);
    }
  }
  // add an item to this belt, starting at the beginning if pos is undefined
  addItem(item, pos = Phaser.Point(0, 0)) {
    for (var i = 0; i < this._items.length; i++) {
      if (this._items[i].item === item) {
        console.log('Item already exists in list, aborting', this, item);
        return;
      }
    }
    // Use this._direction to dictate the initial offsets so the item is exactly one pixel off the belt
    const startingDelta = (((-1 * this._direction) * item.sprite.width) * 0.5) + this._direction;
    const itemData = {
      startTime: Date.now(),
      item,
      delta: startingDelta,
      new: true,
    };
    this._items.push(itemData);
    // position it accordingly
    this.setItemPosition(itemData);
  }
  setItemPosition(itemData) {
    itemData.item.x = (this._direction === 1) ? this.sprite.left + itemData.delta : this.sprite.right + itemData.delta;
    itemData.item.y = this.sprite.bottom - itemData.item.sprite.height;
  }
  removeItem(item) {
    let index = NaN;
    for (var i = 0; i < this._items.length; i++) {
      if (this._items[i].item === item) {
        index = i;
      }
    }
    if (!isNaN(index)) {
      this._items.splice(index, 1);
    } else {
      console.log('Attempted to remove an item that is not in the list', this, item);
    }
    if (this._nextBelt) {
      this._nextBelt.addItem(item);
    } else {
      console.log('The item has nowhere to go!');
    }
  }
  itemIsOnBelt(item) {
    // Test belt right edge vs item left edge if right
    if (this._direction === 1) {
      return this.sprite.right < item.sprite.left;
    } else if (this._direction === -1) {
      return this.sprite.left > item.sprite.right;
    }
    console.warn('This belt is misconfigured', this);
    return false;
  }
  onArmKeyPress(keyData) {
    if (keyData.row !== this.tier) {
      return;
    }
    console.log('BELT RECEIVING:', keyData);
  }
}
