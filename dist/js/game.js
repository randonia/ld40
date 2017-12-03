var game;
window.onload = () => {
  game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container');
  game.state.add('play', new GameState());
  game.state.add('credits', new CreditState());
  game.state.start('play');
}
