const MAX_LEVEL = 3;
class Player extends GameObject {
  get level() {
    return this._level;
  }
  get combo() {
    return this._combo;
  }
  get score() {
    return this._score;
  }
  get signals() {
    return this._signals;
  }
  constructor(opts) {
    super();
    this._x = opts.x;
    this._y = opts.y;
    this._sprite = game.add.sprite(this.x, this.y, 'player');
    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 1;
    this.initialize();
    this._level = 0; // leveling - see level fn
    this._combo = 0;
    this._score = 0;
  }
  initialize() {
    // Set up key signals
    this._signals = {
      onArmKeyPress: new Phaser.Signal(),
      onLevelChange: new Phaser.Signal(),
      onComboChange: new Phaser.Signal(),
      onScoreChange: new Phaser.Signal(),
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
      new Phaser.Point(264, 351), // 3
      new Phaser.Point(526, 357), // 4
      new Phaser.Point(181, 355), // 2
      new Phaser.Point(619, 349), // 5
      new Phaser.Point(98, 346), // 1
      new Phaser.Point(681, 348), // 6
      new Phaser.Point(51, 356), // 0
      new Phaser.Point(749, 344), // 7
    ];
    this._arms = [];
    const offsetX = 0;
    const offsetY = this._sprite.top;
    for (var i = 0; i < 8; i++) {
      this._arms.push(new Arm({
        startX: offsetX + armPositions[i].x,
        startY: offsetY + armPositions[i].y,
        targetX: offsetX + armPositions[i].x,
        targetY: offsetY + armPositions[i].y - 200,
        active: false,
        idx: i,
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
      arm.update();
      game.world.bringToTop(this._arms[i]._noodle);
    }
  }
  render() {
    super.render();
    if (ENV.debug) {
      for (var armIdx = 0; armIdx < this._arms.length; armIdx++) {
        const arm = this._arms[armIdx];
        game.debug.text(`[${arm._index}]`, arm.x - 10, arm.y - 25);
      }
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
    if (signals.onItemSelected) {
      signals.onItemSelected.add(this.onItemSelected, this);
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
    if (signals.onItemSelected) {
      signals.onItemSelected.remove(this.onItemSelected, this);
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
    this.addScore();
    // see what level you're on via combo
    this.checkLevel();
  }
  onItemSelected(payload) {
    console.log('Player is selecting an item!', payload);
    const {
      freeArmIdx,
      item
    } = payload;

    this._arms[freeArmIdx].setTarget(item);
  }
  addScore() {
    const oldScore = this._score;
    this._score += 1;
    this._signals.onScoreChange.dispatch({
      oldScore,
      score: this._score,
    });
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
    this.checkLevel();
    this.damageEffect('combo');
  }
  // Do a fancy red tween
  damageEffect(type = 'combo') {
    if (this._damageTween) {
      this._damageTween.stop();
      delete this._damageTween;
    }
    let colorData;
    switch (type) {
      case 'combo':
        colorData = {
          r: 255,
          g: 0,
          b: 0,
        };
        break;
      case 'armsNotReady':
        colorData = {
          r: 127,
          g: 127,
          b: 127,
        };
        break;
      default:
        console.warn('Passed in unknown damageEffect', type);
        return;
    }
    const damageTween = game.add.tween(colorData).to({
      r: 255,
      g: 255,
      b: 255,
    }, 50, Phaser.Easing.Linear.None, true);
    console.log('TAKING DAMAGE:', damageTween);
    damageTween.onUpdateCallback(() => {
      this.sprite.tint = Phaser.Color.createColor(colorData.r, colorData.g, colorData.b).color;
    });
    this._damageTween = damageTween;
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
    // Make sure we have an available arm
    let freeArmIdx = undefined;
    for (var armIdx = 0; armIdx < this._arms.length; armIdx++) {
      const arm = this._arms[armIdx];
      if (arm.active && arm.ready) {
        freeArmIdx = armIdx
        break;
      }
    }
    if (freeArmIdx !== undefined) {
      const keyData = this._signals.keys[key.keyCode];
      this._signals.onArmKeyPress.dispatch(Object.assign({}, keyData, {
        freeArmIdx
      }));
    } else {
      this.damageEffect('armsNotReady');
    }
  }
}
