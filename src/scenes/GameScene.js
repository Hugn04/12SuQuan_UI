import Phaser from "phaser"
import {socket} from '../service'
import { sizeDevice } from "../utils/breakPoints";

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.player;
        this.stars;
        this.platforms;
        this.cursors;
        this.score = 0;
        this.scoreText;
        this.gameOver;
        this.socket;
        this.others = [];
        this.othersprite = [];

        this.lastTime = 0; // Lưu thời gian của khung hình trước đó
        this.fpsDisplay = null; // Đối tượng hiển thị FPS
        this.frameCount = 0; // Lưu trữ các phím điều khiển
    }
  
    preload() {

        this.socket = socket
        this.load.image('sky', 'assets/images/sky.png');
        this.load.image('ground', 'assets/images/platform.png');
        this.load.image('star', 'assets/images/star.png');
        this.load.image('bomb', 'assets/images/bomb.png');
        this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
      
    }
  
    create() {
        this.time.addEvent({
            delay: 1000,
            callback: this.updatePing,
            callbackScope: this,
            loop: true
        });
        
        this.add.image(400, 300, 'sky')
    
        // this.Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        
        // Add this.player sprite.
        this.player = this.physics.add.sprite(100, 450, 'dude');
        
        // Set this.player physics.
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        
        // Set this.player sprites
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1 // Tells the animation to loop
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        
        // this.Stars - dynamic group as we need them to move and bounce.
        this.stars = this.physics.add.group({
            key: 'star', // texture key
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        
        // Set random bounce value for this.stars - 0 is no bounce, 1 is full bounce.
        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
        
        // Add star physics.
        this.physics.add.collider(this.stars, this.platforms); // So they don't fall through the this.platforms
        
        // Check if this.player overlaps star - if so, remove the start via the collectStar function.
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    
        // this.Bombs - dynamic group for interaction between this.stars, this.player, and this.platforms.
        this.bombs = this.physics.add.group();
    
        // Add bomb physics.
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
        
        // Set key controls.
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Set up scoring.
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        
        this.fpsDisplay = this.add.text(10, 10, 'FPS: 0', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.pingDisplay = this.add.text(this.scale.width - 150, 10, 'Ping: 0 ms', {
            font: '16px Arial',
            fill: '#ffffff'
        });
    }
    
    updatePing(){
        const _this = this
        this.socket.getPing((ping)=>{
            const pingText = `Ping: ${ping} ms`; // Ghi nhận FPS hiện tại
            this.pingDisplay.setText(pingText);
            
        })
    }
    updateFPS(time) {
        if (this.lastTime) {
            this.frameCount++;
            const deltaTime = time - this.lastTime;
            // Mỗi giây, cập nhật thông tin FPS
            if (deltaTime >= 1000) {
                const fpsText = `FPS: ${this.frameCount}`; // Ghi nhận FPS hiện tại
                this.fpsDisplay.setText(fpsText); // Cập nhật hiển thị FPS
                this.frameCount = 0; // Đặt lại đếm khung hình
                this.lastTime = time; // Cập nhật thời gian khung hình trước
            }
        } else {
            this.lastTime = time; // Lưu thời gian khung hình đầu tiên
        }
    }

    update(time) {
        this.updateFPS(time, (fps)=>{
            console.log(fps);
            
        })
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
        socket.emit('updatePlayers', {posx: this.player.x, posy: this.player.y})
        
        socket.on('updatePlayers', data=>{
            
            if(this.othersprite[0] != undefined){
                this.othersprite.forEach((sprite)=>{    
                    sprite.destroy(true)
                    this.othersprite = []
                })
            }
            this.others = data
        })
        if (this.others.length >= 0){
            this.others.forEach((other,index)=>{
                if(other.id !== this.socket.id){
                    var newplayer = this.physics.add.sprite(other.posx, other.posy, 'dude')
                    this.othersprite.push(newplayer)

                }
                
             

            })
        }
    }
    collectStar (player, star)
    {
        // Increment score and remove star.
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // If all stars are collected, release another batch of stars from the sky.
        if (this.stars.countActive(true) === 0)
        {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            // Pick a random coordinate for the bomb, always on the opposite side of the screen.
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            // Initialize bomb.
            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
    hitBomb (player, bomb)
    {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.gameOver = true;
    }
  
  }


export default GameScene;