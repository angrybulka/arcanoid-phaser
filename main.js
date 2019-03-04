var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});

var ball, paddle;
var bricks, newBrick, brickInfo;
var scoreText, livesText, liveLostText, endGameText;
var score = 0, lives = 3;
var textStyle = { font: '18px Arial', fill: '#0095DD' };
var playing = false;
var startButton;
var isPaused = false;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlighVertically = true;

  game.stage.backgroundColor = '#eee';

  //game.load.image('ball', 'img/rico.png');
  game.load.image('paddle', 'img/paddle.png');
  game.load.image('brick', 'img/brick.png');
  game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
  game.load.spritesheet('button', 'img/button.png', 120, 40);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
  ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  //ball.body.velocity.set(100, -100);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);
  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
  paddle.anchor.set(0.5,1);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;

  initBricks();

  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
  livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
  livesText.anchor.set(1,0);
  liveLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle);
  liveLostText.anchor.set(0.5);
  liveLostText.visible = false;
  endGameText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'You win! Your score: ' + scoreText, textStyle);
  endGameText.anchor.set(0.5);
  endGameText.visible = false;

  startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  var spaceKey = game.input.keyboard.addKey(
    Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(isPause, this);
}

function update() {
  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick);
  if(playing) {
    paddle.x = game.input.x || game.world.width*0.5;
  }
}

function setPause() {
  game.paused = true;
}
function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  playing = true;
}

function ballHitPaddle(ball, paddle) {
  ball.animations.play('wobble');
  ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}

function ballLeaveScreen() {
  lives--;
  if (lives){
    livesText.setText('Lives: ' + lives);
    liveLostText.visible = true;
    ball.reset(game.world.width*0.5, game.world.height-25);
    paddle.reset(game.world.width*0.5, game.world.height-5);
    game.input.onDown.addOnce(function(){
      liveLostText.visible = false;
      ball.body.velocity.set(100, -100);
    }, this);
  }else {
    alert('you lose');
    location.reload();
  }
}

function ballHitBrick(ball, brick) {
  var killTween = game.add.tween(brick.scale);
  killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
  killTween.onComplete.addOnce(function(){
      brick.kill();
  }, this);
  killTween.start();
  score += 10;
  scoreText.setText('Points: '+score);
  if(score === brickInfo.count.row*brickInfo.count.col*10) {
      alert('You won the game, congratulations!');
      location.reload();
  }
}

function initBricks(){
  brickInfo = {
    width: 50,
    height: 20,
    count: {
      row: 3,
      col: 7
    },
    offset: {
      top: 50,
      left: 60
    },
    padding: 10
  };

  bricks = game.add.group();

  for (c = 0; c<brickInfo.count.col; c++){
    for (r = 0; r<brickInfo.count.row; r++){
      var brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
      var brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
      newBrick = game.add.sprite(brickX, brickY, 'brick');
      game.physics.enable(newBrick, Phaser.Physics.ARCADE);
      newBrick.body.immovable = true;
      newBrick.anchor.set(0.5);
      bricks.add(newBrick);
    }
  }
}