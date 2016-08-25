var game;
var ship;
var weapon;
var cursors;
var fireButton;
var restartButton;
var comet;
var comets;
var timer;
var score;
var scoreLabel;
var lifes;
var info;
var currentLifes;
var speedLeft;
var speedRight;
var cometSpeed;
var nextStage;
var memory = 0;
var highScore;
var extraLife;
var stopper;
var starfield;
var explode;
var booms;
var music;
var explosionSound;
var isPlaying = false;
var intro;
var isAgain = false;
var isReady;
var readyButton;

WebFontConfig = {
	active: function() { 
		game.time.events.add(Phaser.Timer.SECOND*0.001, mainState.updateText, this); 
	},
	google: {
		families: ['Revalia']
	}
};

var mainState = {
	preload: function(){
		game.load.spritesheet('kaboom', 'elements/explode.png', 128, 128, 16);
		game.load.image('ship', 'elements/ship.png');
		game.load.image('bullet', 'elements/bullet2.png');
		game.load.image('comet', 'elements/comet.png');
		game.load.image('stopper', 'elements/stopper.png');
		game.load.image('starfield', 'elements/starfield.png');
		game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
		game.load.audio('music', 'elements/Music.mp3');
		game.load.audio('explosionSound', 'elements/ExplosionSound.mp3');
	},

	create: function(){
		starfield = game.add.tileSprite(0,0, 450, 700, 'starfield');
		game.physics.startSystem(Phaser.Physics.ARCADE);
		ship = game.add.sprite(187,600,'ship');
		game.physics.arcade.enable(ship);
		ship.body.collideWorldBounds = true;
		booms = game.add.group();
		speedLeft = -365;
		speedRight = 365;
		lifes = 3;
		cometSpeed = 310;
		stopper = game.add.sprite(0,698, 'stopper');
		game.physics.arcade.enable(stopper);
		weapon = game.add.weapon(30, 'bullet');
		weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		weapon.bulletAngleOffset = 90;
		weapon.bulletSpeed = 700;
		weapon.fireRate = 400;
		weapon.trackSprite(ship, 35, 0);
		cursors = this.input.keyboard.createCursorKeys();
		fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
		restartButton = this.input.keyboard.addKey(Phaser.Keyboard.R);
		timer = game.time.events.loop(1000, this.addComets.bind(this));
		comets = game.add.group();
		score = 0;
		scoreLabel = game.add.text(30, 30, 'Score: 0', {
			fontSize: 25, fill: '#000000', stroke: '#ffffff', strokeThickness: 5
		});
		currentLifes = game.add.text(310, 30, 'Lifes: 3', {
			fontSize: 25, fill: '#000000', stroke: '#ffffff', strokeThickness: 5
		});
		highScore = game.add.text(30, 80, 'High Score: ' + memory, {
			fontSize: 22, fill: '#000000', stroke: '#ffffff', strokeThickness: 5
		});
		if(isAgain ==false){
			intro = game.add.text(game.world.centerX, game.world.centerY, 'Shoot down the comets!\nShooting - spacebar!\nMoving - left/right arrow!\nGood Luck!', {
				fontSize: 20, fill: '#000000', stroke: '#ffffff', strokeThickness: 5, 
			});
			intro.anchor.set(0.5);
			intro.lifespan = 2000;
			isAgain = true;
		}
		this.updateText();
		music = game.add.audio('music');
		if(isPlaying == false){
			music.play();
			isPlaying = true;
			music.volume = 0.52;
			music.loopFull();
		}
		explosionSound = game.add.audio('explosionSound');
		explosionSound.volume = 0.15;
	},

	updateText: function() {
		if(scoreLabel !== undefined){
			scoreLabel.font = 'Revalia';
			currentLifes.font = 'Revalia';
			highScore.font = 'Revalia';
			intro.font = 'Revalia';
		}
	},

	update: function(){
		starfield.tilePosition.y += 2;
		ship.body.velocity.x = 0;
		if(ship.alive == true){
			if(cursors.left.isDown){
				ship.body.velocity.x = speedLeft;
			}else if(cursors.right.isDown){
				ship.body.velocity.x = speedRight;
			}

			if(fireButton.isDown){
				weapon.fire();
			}
		}else{
			return;
		}

		if(score==10 || score==20 || score==30 || score==40 || score==50 || score==60 || score==70 || score==80 || score==90 || score==100 || score==120 || score==140 || score==160 || score==180 || score==200){
			this.raise();
			if(score==20 || score==40 || score==60 || score==80 || score==100 || score==120 || score==140 || score==160 || score==180 || score==200){
				lifes+=1;
				extraLife = game.add.text(85, 380, 'Extra Life!', {
					fontSize: 45, font: 'Revalia', fill: '#000000', stroke: '#ffffff', strokeThickness: 5
				});
				currentLifes.text = 'Lifes: ' + lifes;
				extraLife.lifespan = 1200;
			}
			++score;
			scoreLabel.text = 'Score: ' + score;
			nextStage = game.add.text(85, 200 , 'Speed Up!\nExtra point',{
				fontSize: 45, font: 'Revalia', fill: '#000000', stroke: '#ffffff', strokeThickness: 5
			});
			nextStage.lifespan = 1200;
		}

		if(score>memory){
			memory = score;
			highScore.text = 'High Score: ' + memory;
		}
		game.physics.arcade.overlap(stopper, comets, this.hitStopper, null, this);
		game.physics.arcade.overlap(ship,comets, this.hitComet, null, this);
		game.physics.arcade.overlap(weapon.bullets,comets, this.hitBullet, null, this);
	},

	raise: function() {
		speedLeft -=25;
		speedRight +=25;
		cometSpeed +=35;
		if(weapon.fireRate>250) {
			weapon.fireRate -= 25;
		}
	},

	addOneComet: function(x, y){
		comet = game.add.sprite(x, y, 'comet');
		comets.add(comet);
		game.physics.arcade.enable(comet);
		comet.body.velocity.y = cometSpeed;
		comet.checkWorldBounds = true;
		comet.outOfBoundsKill = true;
	},

	addComets: function(){
		var place = Math.floor(Math.random()*12) + 0.25;
		this.addOneComet(place * 36, 0);
	},

	restartGame: function(){
		isReady = true;
		game.state.start('main');
	},

	hitComet: function(ship, comet){
		explosionSound.play();
		lifes--;
		explode = booms.create(comet.x, comet.y, 'kaboom');
		explode.animations.add('boom');
		explode.anchor.x = 0.3;
		explode.anchor.y = 0.25;
		explode.play('boom', 30, false, true);
		comet.kill();
		currentLifes.text = 'Lifes: ' + lifes;
		if(lifes<1){
			ship.body.collideWorldBounds = false;
			ship.alive = false;
			ship.body.gravity.y = 300;
			info = game.add.text(85, 200 , 'Game Over! \nPress \'R\' \nto restart!',{
				font: '45px  Revalia', fill: '#000000', stroke: '#ffffff', strokeThickness: 5
			});
			restartButton.onDown.addOnce(this.restartGame, this);
		}else{
			return;
		}
	},

	hitBullet: function(bullet, comet){
		explosionSound.play();
		explode = booms.create(comet.x, comet.y, 'kaboom');
		explode.anchor.x = 0.3;
		explode.anchor.y = 0.41;
		explode.animations.add('boom');
		explode.play('boom', 30, false, true);
		bullet.kill();
		comet.kill();
		score +=1;
		scoreLabel.text = 'Score: ' + score;
	},

	hitStopper: function(stop, comet){
		comet.kill();
		if(score>12){
			score -=2;
		}
		scoreLabel.text = 'Score: ' + score;
	}
}

var game = new Phaser.Game(450, 700);
game.state.add('main', mainState);
game.state.start('main');