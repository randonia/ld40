class UIManager {
  constructor() {
    this._hooks = {
      player: undefined,
    };
    this._group = game.add.group();
  }
  update(delta) {
    Object.keys(this._hooks).forEach(hookId => {
      const hook = this._hooks[hookId];
      if (!hook) {
        // Attempt to hook into the given item
        this.tryHook(hookId);
      }
    });
    game.world.bringToTop(this._group);
  }
  render() {
    game.world.bringToTop(this._group);
  }
  onPlayerLevelChange(delta) {
    this._levelUI.text = `Level: ${delta.level}`;
  }
  onPlayerComboChange(delta) {
    this._comboUI.text = `Combo: ${delta.combo}`;
  }
  onPlayerScoreChange(delta) {
    this._scoreUI.text = `Dishes: ${delta.score}`;
  }
  tryHook(hookId) {
    switch (hookId) {
      case 'player':
        if (!player) {
          return;
        }
        player.signals.onLevelChange.add(this.onPlayerLevelChange, this);
        player.signals.onComboChange.add(this.onPlayerComboChange, this);
        player.signals.onScoreChange.add(this.onPlayerScoreChange, this);
        this._hooks.player = player;
        this._comboUI = game.add.text(game.world.width, game.world.height, '', {
          font: '24px Permanent Marker',
          fill: '#ffffff',
        }, this._group);
        this._comboUI.anchor.set(1, 1);

        this._levelUI = game.add.text(0, game.world.height, '', {
          font: '24px Permanent Marker',
          fill: '#ffffff',
        }, this._group);
        this._levelUI.anchor.set(0, 1);

        this._scoreUI = game.add.text(0, 0, '', {
          font: '24px Permanent Marker',
          fill: '#ffffff',
        }, this._group);
        this._scoreUI.anchor.set(0, 0);


        setTimeout(() => {
          this._comboUI.text = 'Combo: 0';
          this._levelUI.text = 'Level: 0';
          this._scoreUI.text = 'Dishes: 0';
        }, 250);

        break;
      default:
        console.warn('Invalid hook id passed:', hookId);
        break;
    }
  }
}
