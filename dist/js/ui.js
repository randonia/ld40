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
    console.log('UI reporting level change', delta);
    this._levelUI.text = `Level: ${delta.level}`;
  }
  onPlayerComboChange(delta) {
    console.log('UI reporting combo change', delta);
    this._comboUI.text = `Combo: ${delta.combo}`;
  }
  tryHook(hookId) {
    switch (hookId) {
      case 'player':
        if (!player) {
          return;
        }
        player.signals.onLevelChange.add(this.onPlayerLevelChange, this);
        player.signals.onComboChange.add(this.onPlayerComboChange, this);
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

        setTimeout(() => {
          this._comboUI.text = 'Combo: 0';
          this._levelUI.text = 'Level: 0';
        }, 250);

        break;
      default:
        console.warn('Invalid hook id passed:', hookId);
        break;
    }
  }
}
