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
  get nextBelt() {
    return this._nextBelt;
  }
  get tier() {
    return this._tier;
  }
  get signals() {
    return this._signals;
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
    this._signals = {
      onInputSuccess: new Phaser.Signal(),
      onInputMiss: new Phaser.Signal(),
      onInputFailure: new Phaser.Signal(),
      onItemComplete: new Phaser.Signal(),
      onItemSelected: new Phaser.Signal(),
      onItemLeave: new Phaser.Signal(),
    };
  }
  generateZones() {
    if (!this._zones) {
      this._zones = [];
    }
    // destruct zones
    let dZ;
    while ((dZ = this._zones.shift())) {
      // Deprocess zone
      dZ.destroy();
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
      this._zones.push(new Zone({
        rect,
        tier: this.tier,
        idx: currZoneIdx,
        level: playerLevel,
      }));
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
        this.moveItemNext(itemData.item);
      }
      if (itemData.new) {
        itemData.new = false;
      }
    }
    // Move the zones
    for (var zIdx = 0; zIdx < this._zones.length; zIdx++) {
      const zone = this._zones[zIdx]
      zone.update();
      zone.rect.y = this.y;
      // If this zone already has one occupant, ignore all others
      if (zone.occupied && zone.occupant) {
        // Test if the occupant is still here
        if (zone.rect.intersects(zone.occupant.sprite.getBounds())) {
          // We're still occupied, continue;
          continue;
        } else {
          // Reset this zone and keep going
          zone.occupied = false;
          zone.occupant = undefined;
        }
      }
      // Test collision with all the items
      for (var i = 0; i < this._items.length; i++) {
        const itemData = this._items[i];
        zone.occupied = zone.rect.intersects(itemData.item.sprite.getBounds());
        if (zone.occupied) {
          zone.occupant = itemData.item;
          // make sure to break out and only use the first item
          break;
        } else {
          zone.occupant = undefined;
        }
      }
    }
  }
  render() {
    for (var zoneIdx = 0; zoneIdx < this._zones.length; zoneIdx++) {
      this._zones[zoneIdx].render();
    }
  }
  connectSignals(signals) {
    if (signals.onArmKeyPress) {
      signals.onArmKeyPress.add(this.onArmKeyPress, this);
    }
    if (signals.onLevelChange) {
      signals.onLevelChange.add(this.onPlayerLevelChange, this);
    }
    if (signals.onItemComplete) {
      signals.onItemComplete.add(this.onItemComplete, this);
    }
  }
  disconnectSignals(signals) {
    if (signals.onArmKeyPress) {
      signals.onArmKeyPress.remove(this.onArmKeyPress, this);
    }
    if (signals.onLevelChange) {
      signals.onLevelChange.remove(this.onPlayerLevelChange, this);
    }
    if (signals.onItemComplete) {
      signals.onItemComplete.remove(this.onItemComplete, this);
    }
  }
  // add an item to this belt
  addItem(item) {
    this.connectSignals(item.signals);
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
  moveItemNext(item) {
    this.removeItem(item);
    if (this._nextBelt) {
      this._nextBelt.addItem(item);
    } else {
      console.log('The item has nowhere to go!');
      const oldHealth = HEALTH;
      HEALTH--;
      if (HEALTH <= 0) {
        // Player loses
        console.log('Player loses');
      }
      this._signals.onItemLeave.dispatch({
        oldHealth,
        health: HEALTH,
      });
    }
  }
  removeItem(item) {
    this.disconnectSignals(item.signals);
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
  }
  onItemComplete(item) {
    console.warn('Item has been completed:', item);
    // Do some cleanup
    this.disconnectSignals(item.signals);
    this.removeItem(item);
    // Execute the item's completion
    item.doComplete();
    // Score it?
    // Notify the player of success
    this._signals.onItemComplete.dispatch(item);
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
  // Note that this happens asynchronously and must be guarded against in the lower levels
  onArmKeyPress(keyData) {
    // Ignore if this isn't even the right tier
    if (keyData.row !== this.tier) {
      return;
    }
    // See if there is a zone on this tier that matches this key
    for (var zIdx = 0; zIdx < this._zones.length; zIdx++) {
      const zone = this._zones[zIdx];
      // Identify them by KeyCode
      if (zone.keyCode === keyData.code) {
        zone.handleAction(
          // Complete callback first
          (result) => {
            switch (result) {
              case ACTION_RESULTS.SUCCESS:
                this._signals.onInputSuccess.dispatch({});
                break;
              case ACTION_RESULTS.FAILURE:
                this._signals.onInputFailure.dispatch({});
                break;
              case ACTION_RESULTS.MISS:
                this._signals.onInputMiss.dispatch({});
                break;
              case ACTION_RESULTS.PENDING:
                // do nothing since we're waiting
                break;
              default:
                console.warn('Unexpected result occurred: ', result);
            }
          },
          //
          (item) => {
            this._signals.onItemSelected.dispatch({
              freeArmIdx: keyData.freeArmIdx,
              item,
            });
          }
        );
      }
    }
  }
  onPlayerLevelChange(deltaData) {
    this.generateZones();
  }
}
