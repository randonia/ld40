const MAX_LEVEL = 3;
class Player extends GameObject {
  get level() {
    return this._level;
  }
  get combo() {
    return this._combo;
  }
  get signals() {
    return this._signals;
  }
  constructor() {
    super();
    this._sprite = game.add.sprite(this.x, this.y, 'player');
    this._sprite.scale.set(2, 2);
    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 1;
    this.initialize();
    this._level = 0; // leveling - see level fn
    this._combo = 0;
  }
  initialize() {
    // Set up key signals
    this._signals = {
      onArmKeyPress: new Phaser.Signal(),
      onLevelChange: new Phaser.Signal(),
      onComboChange: new Phaser.Signal(),
      keys: {}
    }
    for (var keyRowIdx = 0; keyRowIdx < KEYS.length; keyRowIdx++) {
      const row = KEYS[keyRowIdx];
      for (var keyColIdx = 0; keyColIdx < row.length; keyColIdx++) {
        const keyCode = row[keyColIdx];
        const inputFn = game.input.keyboard.addKey(keyCode);
        game.input.keyboard.removeKeyCapture(keyCode); // this is silly
        inputFn.onDown.add(this.onArmKeyPress, this);
        this._signals.keys[keyCode] = {
          row: keyRowIdx,
          col: keyColIdx,
          code: keyCode,
          input: inputFn,
        };
      }
    }
    // Make all 8 arms upfront
    const armPositions = [
      new Phaser.Point(300, game.world.height),
      new Phaser.Point(400, game.world.height),
      new Phaser.Point(200, game.world.height),
      new Phaser.Point(500, game.world.height),
      new Phaser.Point(100, game.world.height),
      new Phaser.Point(600, game.world.height),
      new Phaser.Point(0, game.world.height),
      new Phaser.Point(700, game.world.height),
    ];
    this._arms = [];
    for (var i = 0; i < 8; i++) {
      this._arms.push(new Arm({
        startX: armPositions[i].x,
        startY: armPositions[i].y,
        targetX: armPositions[i].x,
        targetY: armPositions[i].y - 150,
        active: false,
      }));
    }
    this.checkLevel();
  }
  update() {
    super.update();
    for (var i = 0; i < this._arms.length; i++) {
      const arm = this._arms[i];
      if (!arm.active) {
        continue;
      }
      arm.targetX = game.input.mousePointer.position.x;
      arm.targetY = game.input.mousePointer.position.y;
      arm.update();
      game.world.bringToTop(this._arms[i]._noodle);
    }
  }
  connectSignals(signals) {
    if (signals.onInputSuccess) {
      signals.onInputSuccess.add(this.onInputSuccess, this);
    }
    if (signals.onInputFailure) {
      signals.onInputFailure.add(this.onInputFailure, this);
    }
    if (signals.onInputMiss) {
      signals.onInputMiss.add(this.onInputMiss, this);
    }
    if (signals.onItemComplete) {
      signals.onItemComplete.add(this.onItemComplete, this);
    }
  }
  disconnectSignals(signals) {
    if (signals.onInputSuccess) {
      signals.onInputSuccess.remove(this.onInputSuccess, this);
    }
    if (signals.onInputFailure) {
      signals.onInputFailure.remove(this.onInputFailure, this);
    }
    if (signals.onInputMiss) {
      signals.onInputMiss.remove(this.onInputMiss, this);
    }
    if (signals.onItemComplete) {
      signals.onItemComplete.remove(this.onItemComplete, this);
    }
  }
  onInputSuccess(msg) {
    console.log('Successful hit', msg);
  }
  onInputFailure(msg) {
    console.log('Failed task', msg);
    this.loseCombo();
  }
  onInputMiss(msg) {
    console.log('Tried to hit zone that is unoccupied', msg);
    this.loseCombo();
  }
  onItemComplete(item) {
    console.log('The player reporting the item is complete:', item);
    this.addCombo();
    // see what level you're on via combo
    this.checkLevel();
  }
  addCombo() {
    const oldCombo = this._combo;
    this._combo += 1;
    this._signals.onComboChange.dispatch({
      oldCombo,
      combo: this._combo,
    });
  }
  loseCombo() {
    const oldCombo = this._combo;
    this._combo = 0
    this._signals.onComboChange.dispatch({
      oldCombo,
      combo: this._combo,
    });
  }
  /**
   * level 0 is combo 0-3
   * level 1 is combo 3-6
   * level 2 is combo 6-12
   * level 3 is combo 12+
   **/
  checkLevel() {
    if (this._combo >= 12) {
      this.setLevel(3);
    } else if (this._combo >= 6) {
      this.setLevel(2);
    } else if (this._combo >= 3) {
      this.setLevel(1);
    } else {
      this.setLevel(0);
    }
  }
  /*
   * Levels go from 0->3
   * level 0 is R/U
   * level 1 is ER/UI
   * level 2 is WER/UIO
   * level 3 is QWER/UIOP
   * subsequent levels just add challenges?
   */
  setLevel(newLevel) {
    const oldLevel = this._level
    // Do not let anyone go above level 3;
    this._level = Math.max(0, Math.min(MAX_LEVEL, newLevel));
    if (oldLevel !== newLevel) {
      this._signals.onLevelChange.dispatch({
        oldLevel,
        level: this.level,
      });
    }
    // Set up the arms based on your level
    const armIdx = Math.min(this._level, 3); // safeguard against going too hard
    for (var i = 0; i < this._arms.length; i++) {
      console.log('ARM TEST:', (i < (armIdx + 1) * 2));
      console.log('ARM TEST VALS:', `${i} < (${armIdx} + ${1}) * ${2}`);
      this._arms[i].active = i < (armIdx + 1) * 2;
      game.world.bringToTop(this._arms[i]._noodle);
    }
  }
  addLevel() {
    // MAX LEVEL
    if (this._level >= MAX_LEVEL) {
      console.log('Player at max level');
      return;
    }
    const oldLevel = this._level;
    this._level += 1;
    this._signals.onLevelChange.dispatch({

      oldLevel,
      level: this.level,
    });
  }
  removeLevel() {
    const oldLevel = this._level;
    this._level = Math.max(0, oldLevel - 1);

    this._signals.onLevelChange.dispatch({
      oldLevel,
      level: this.level,
    });
  }
  onArmKeyPress(key) {
    const keyData = this._signals.keys[key.keyCode];
    this._signals.onArmKeyPress.dispatch(keyData);
  }
}
