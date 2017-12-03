class UIManager {
  constructor() {
    this._hooks = {
      player: undefined,
      belt3: undefined,
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
  onLastBeltItemLeave(delta) {
    // Set visibility based on health
    for (var cIdx = 0; cIdx < this._healthGroup.children.length; cIdx++) {
      this._healthGroup.children[cIdx].visible = cIdx < delta.health;
    }
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
      case 'belt3':
        // belt3 is the belt that is referenced at the end of the reference chain from belt1
        if (!belt1) {
          return;
        }
        let lastBelt;
        let currBelt = belt1;
        // Follow the chain of next belts
        while (currBelt.nextBelt) {
          currBelt = currBelt.nextBelt
        }
        if (currBelt === belt1) {
          return;
        } else {
          this._hooks.belt3 = currBelt;
        }

        this._healthGroup = game.add.group();
        this._healthText = game.add.text(game.world.width - 200, 0, '', {
          font: '24px Permanent Marker',
          fill: '#ffffff',
        }, this._group);
        setTimeout(() => {
          this._healthText.text = 'Health:';
          this._healthGroup.align(3, -1, 32, 32);
          this._healthGroup.visible = true;
          this._healthGroup.x = this._healthText.getBounds().right;
        }, 250);

        for (var idx = 0; idx < 3; idx++) {
          const healthSprite = game.add.sprite(0, 0, 'hp');
          this._healthGroup.add(healthSprite);
        }
        this._healthGroup.visible = false;
        this._healthGroup.x = game.world.width;
        this._healthGroup.y = 0;
        this._group.add(this._healthGroup);

        // Set up the last belt watcher
        currBelt.signals.onItemLeave.add(this.onLastBeltItemLeave, this);
        break;
      default:
        console.warn('Invalid hook id passed:', hookId);
        break;
    }
  }
}
