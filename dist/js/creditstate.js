class CreditState {
  preload() {
    // Load some sad stuff here I guess
  }
  create() {
    this._group = game.add.group();

    // create the user feedback text
    const endTextValue = `You were able to serve ${player.score} meals before becoming overwhelmed by the demand for your skill. Your highest combo was ${player.highestCombo}`;
    const endText = game.add.text(game.world.centerX, game.world.centerY, endTextValue, {
      align: 'center',
      font: '30px Permanent Marker',
      fill: '#ffffff',
      wordWrap: true,
      wordWrapWidth: 600,
    }, this._group);
    endText.anchor.set(0.5, 0.5);
    this._endText = endText;

    const promptToRestart = `Press F to restart the game`;
    const restartText = game.add.text(endText.x, endText.bottom + 25, promptToRestart,
      Object.assign({}, endText.style, {
        font: '24px Permanent Marker'
      }),
      this._group);
    restartText.alpha = 0;
    restartText.anchor.set(0.5, 0);
    this._restartText = restartText;

    const fadeInTween = game.add.tween(restartText).to({
      alpha: 1
    }, 500, Phaser.Easing.Linear.None, true);

    fadeInTween.onComplete.add(() => {
      const bounceTween = game.add.tween(restartText).to({
        y: restartText.y + 15,
      }, 250, Phaser.Easing.Linear.None, true, 1000, -1, true);
    });

    // add a one time F key listener to pay respects
    const restartKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
    restartKey.onDown.addOnce(this.restartGameState, this);
  }
  restartGameState() {
    game.state.start('play', true, false);
  }
  update() {}
  render() {}
}
