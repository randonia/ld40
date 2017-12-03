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
    const oldLevel = this._level;
    this._level = newLevel;
    if (oldLevel !== newLevel) {
      this._signals.onLevelChange.dispatch({
        oldLevel,
        level: this.level,
      });
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
