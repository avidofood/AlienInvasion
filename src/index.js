/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable func-names */
import spritesImages from './images/sprites.png';
import './base.css';
import './polyfill';


const Game = new function () {
    const boards = [];

    // Game Initialization
    this.initialize = function (canvasElementId, spriteData, callback) {
        this.canvas = document.getElementById(canvasElementId);

        this.playerOffset = 10;
        this.canvasMultiplier = 1;
        this.setupMobile();

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.ctx = this.canvas.getContext && this.canvas.getContext('2d');

        if (!this.ctx) {
            alert('Please upgrade your browser to play');
            return;
        }

        this.setupInput();

        this.loop();

        if (this.mobile) {
            this.setBoard(4, new TouchControls());
        }

        SpriteSheet.load(spriteData, callback);
    };


    // Handle Input
    const KEY_CODES = { 37: 'left', 39: 'right', 32: 'fire' };
    this.keys = {};

    this.setupInput = function () {
        window.addEventListener('keydown', (e) => {
            if (KEY_CODES[e.keyCode]) {
                Game.keys[KEY_CODES[e.keyCode]] = true;
                e.preventDefault();
            }
        }, false);

        window.addEventListener('keyup', (e) => {
            if (KEY_CODES[e.keyCode]) {
                Game.keys[KEY_CODES[e.keyCode]] = false;
                e.preventDefault();
            }
        }, false);
    };


    let lastTime = new Date().getTime();
    const maxTime = 1 / 30;
    // Game Loop
    this.loop = function () {
        const curTime = new Date().getTime();
        requestAnimationFrame(Game.loop);
        let dt = (curTime - lastTime) / 1000;
        if (dt > maxTime) { dt = maxTime; }

        for (let i = 0, len = boards.length; i < len; i += 1) {
            if (boards[i]) {
                boards[i].step(dt);
                boards[i].draw(Game.ctx);
            }
        }
        lastTime = curTime;
    };

    // Change an active game board
    this.setBoard = function (num, board) { boards[num] = board; };


    this.setupMobile = function () {
        const container = document.getElementById('game-container');
        const hasTouch = !!('ontouchstart' in window);
        let w = window.innerWidth;
        let h = window.innerHeight;

        if (hasTouch) { this.mobile = true; }

        if (window.screen.width >= 1280 || !hasTouch) return;

        if (w > h) {
            alert('Please rotate the device and then click OK');
            w = window.innerWidth; h = window.innerHeight;
        }

        container.style.height = `${h * 2}px`;
        window.scrollTo(0, 1);

        h = window.innerHeight + 2;
        container.style.height = `${h}px`;
        container.style.width = `${w}px`;
        container.style.padding = 0;

        if (h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
            this.canvasMultiplier = 2;
            this.canvas.width = w / 2;
            this.canvas.height = h / 2;
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
        } else {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
    };
}();


const SpriteSheet = new function () {
    this.map = { };

    this.load = function (spriteData, callback) {
        this.map = spriteData;
        this.image = new Image();
        this.image.onload = callback;
        this.image.src = spritesImages;
    };

    this.draw = function (ctx, sprite, x, y, frame) {
        const s = this.map[sprite];
        if (!frame) frame = 0;
        ctx.drawImage(this.image,
            s.sx + frame * s.w,
            s.sy,
            s.w, s.h,
            Math.floor(x), Math.floor(y),
            s.w, s.h);
    };

    return this;
}();


const TitleScreen = function TitleScreen(title, subtitle, callback) {
    let up = false;
    // eslint-disable-next-line no-unused-vars
    this.step = function (dt) {
        if (!Game.keys.fire) up = true;
        if (up && Game.keys.fire && callback) callback();
    };

    this.draw = function (ctx) {
        ctx.fillStyle = '#FFFFFF';

        ctx.font = 'bold 40px bangers';
        const measure = ctx.measureText(title);
        ctx.fillText(title, Game.width / 2 - measure.width / 2, Game.height / 2);

        ctx.font = 'bold 20px bangers';
        const measure2 = ctx.measureText(subtitle);
        ctx.fillText(subtitle, Game.width / 2 - measure2.width / 2, Game.height / 2 + 40);
    };
};

/* eslint-disable */

var GameBoard = function() {
  var board = this;

  // The current list of objects
  this.objects = [];
  this.cnt = {};

  // Add a new object to the object list
  this.add = function(obj) { 
    obj.board=this; 
    this.objects.push(obj); 
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
    return obj; 
  };

  // Mark an object for removal
  this.remove = function(obj) { 
    var idx = this.removed.indexOf(obj);
    if(idx == -1) {
      this.removed.push(obj); 
      return true;
    } else {
      return false;
    }
  };

  // Reset the list of removed objects
  this.resetRemoved = function() { this.removed = []; };

  // Removed an objects marked for removal from the list
  this.finalizeRemoved = function() {
    for(var i=0,len=this.removed.length;i<len;i++) {
      var idx = this.objects.indexOf(this.removed[i]);
      if(idx != -1) {
        this.cnt[this.removed[i].type]--;
        this.objects.splice(idx,1);
      }
    }
  };

  // Call the same method on all current objects 
  this.iterate = function(funcName) {
     var args = Array.prototype.slice.call(arguments,1);
     for(var i=0,len=this.objects.length;i<len;i++) {
       var obj = this.objects[i];
       obj[funcName].apply(obj,args);
     }
  };

  // Find the first object for which func is true
  this.detect = function(func) {
    for(var i = 0,val=null, len=this.objects.length; i < len; i++) {
      if(func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

  // Call step on all objects and them delete
  // any object that have been marked for removal
  this.step = function(dt) { 
    this.resetRemoved();
    this.iterate('step',dt);
    this.finalizeRemoved();
  };

  // Draw all the objects
  this.draw= function(ctx) {
    this.iterate('draw',ctx);
  };

  // Check for a collision between the 
  // bounding rects of two objects
  this.overlap = function(o1,o2) {
    return !((o1.y+o1.h-1<o2.y) || (o1.y>o2.y+o2.h-1) ||
             (o1.x+o1.w-1<o2.x) || (o1.x>o2.x+o2.w-1));
  };

  // Find the first object that collides with obj
  // match against an optional type
  this.collide = function(obj,type) {
    return this.detect(function() {
      if(obj != this) {
       var col = (!type || this.type & type) && board.overlap(obj,this);
       return col ? this : false;
      }
    });
  };


};

var Sprite = function() { };

Sprite.prototype.setup = function(sprite,props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w =  SpriteSheet.map[sprite].w;
  this.h =  SpriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function(props) {
  if(props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
};

Sprite.prototype.draw = function(ctx) {
  SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
};

Sprite.prototype.hit = function(damage) {
  this.board.remove(this);
};


var Level = function(levelData,callback) {
  this.levelData = [];
  for(var i =0; i<levelData.length; i++) {
    this.levelData.push(Object.create(levelData[i]));
  }
  this.t = 0;
  this.callback = callback;
};

Level.prototype.step = function(dt) {
  var idx = 0, remove = [], curShip = null;

  // Update the current time offset
  this.t += dt * 1000;

  //   Start, End,  Gap, Type,   Override
  // [ 0,     4000, 500, 'step', { x: 100 } ]
  while((curShip = this.levelData[idx]) && 
        (curShip[0] < this.t + 2000)) {
    // Check if we've passed the end time 
    if(this.t > curShip[1]) {
      remove.push(curShip);
    } else if(curShip[0] < this.t) {
      // Get the enemy definition blueprint
      var enemy = enemies[curShip[3]],
          override = curShip[4];

      // Add a new enemy with the blueprint and override
      this.board.add(new Enemy(enemy,override));

      // Increment the start time by the gap
      curShip[0] += curShip[2];
    }
    idx++;
  }

  // Remove any objects from the levelData that have passed
  for(var i=0,len=remove.length;i<len;i++) {
    var remIdx = this.levelData.indexOf(remove[i]);
    if(remIdx != -1) this.levelData.splice(remIdx,1);
  }

  // If there are no more enemies on the board or in 
  // levelData, this level is done
  if(this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0) {
    if(this.callback) this.callback();
  }

};

Level.prototype.draw = function(ctx) { };


var TouchControls = function() {

  var gutterWidth = 10;
  var unitWidth = Game.width/5;
  var blockWidth = unitWidth-gutterWidth;

  this.drawSquare = function(ctx,x,y,txt,on) {
    ctx.globalAlpha = on ? 0.9 : 0.6;
    ctx.fillStyle =  "#CCC";
    ctx.fillRect(x,y,blockWidth,blockWidth);

    ctx.fillStyle = "#FFF";
    ctx.globalAlpha = 1.0;
    ctx.font = "bold " + (3*unitWidth/4) + "px arial";

    var txtSize = ctx.measureText(txt);

    ctx.fillText(txt, 
                 x+blockWidth/2-txtSize.width/2, 
                 y+3*blockWidth/4+5);
  };

  this.draw = function(ctx) {
    ctx.save();

    var yLoc = Game.height - unitWidth;
    this.drawSquare(ctx,gutterWidth,yLoc,"\u25C0", Game.keys['left']);
    this.drawSquare(ctx,unitWidth + gutterWidth,yLoc,"\u25B6", Game.keys['right']);
    this.drawSquare(ctx,4*unitWidth,yLoc,"A",Game.keys['fire']);

    ctx.restore();
  };

  this.step = function(dt) { };

  this.trackTouch = function(e) {
    var touch, x;

    e.preventDefault();
    Game.keys['left'] = false;
    Game.keys['right'] = false;
    for(var i=0;i<e.targetTouches.length;i++) {
      touch = e.targetTouches[i];
      x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
      if(x < unitWidth) {
        Game.keys['left'] = true;
      } 
      if(x > unitWidth && x < 2*unitWidth) {
        Game.keys['right'] = true;
      } 
    }

    if(e.type == 'touchstart' || e.type == 'touchend') {
      for(i=0;i<e.changedTouches.length;i++) {
        touch = e.changedTouches[i];
        x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
        if(x > 4 * unitWidth) {
          Game.keys['fire'] = (e.type == 'touchstart');
        }
      }
    }
  };

  Game.canvas.addEventListener('touchstart',this.trackTouch,true);
  Game.canvas.addEventListener('touchmove',this.trackTouch,true);
  Game.canvas.addEventListener('touchend',this.trackTouch,true);

  // For Android
  Game.canvas.addEventListener('dblclick',function(e) { e.preventDefault(); },true);
  Game.canvas.addEventListener('click',function(e) { e.preventDefault(); },true);

  Game.playerOffset = unitWidth + 20;
};


var GamePoints = function() {
  Game.points = 0;

  var pointsLength = 8;

  this.draw = function(ctx) {
    ctx.save();
    ctx.font = "bold 18px arial";
    ctx.fillStyle= "#FFFFFF";

    var txt = "" + Game.points;
    var i = pointsLength - txt.length, zeros = "";
    while(i-- > 0) { zeros += "0"; }

    ctx.fillText(zeros + txt,10,20);
    ctx.restore();

  };

  this.step = function(dt) { };
};

var sprites = {
    ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
    missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
    enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
    enemy_ship: { sx: 116, sy: 0, w: 42, h: 36, frames: 1 },
    enemy_circle: { sx: 158, sy: 0, w: 33, h: 36, frames: 1 },
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
    enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1, }
   };
   
   var enemies = {
     straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
                 E: 100 },
     ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
                 B: 75, C: 1, E: 100, missiles: 2  },
     circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
                 A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
     wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
                 B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
     step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
                 B: 150, C: 1.2, E: 75 }
   };
   
   var OBJECT_PLAYER = 1,
       OBJECT_PLAYER_PROJECTILE = 2,
       OBJECT_ENEMY = 4,
       OBJECT_ENEMY_PROJECTILE = 8,
       OBJECT_POWERUP = 16;
   
   var startGame = function() {
     var ua = navigator.userAgent.toLowerCase();
   
     // Only 1 row of stars
     if(ua.match(/android/)) {
       Game.setBoard(0,new Starfield(50,0.6,100,true));
     } else {
       Game.setBoard(0,new Starfield(20,0.4,100,true));
       Game.setBoard(1,new Starfield(50,0.6,100));
       Game.setBoard(2,new Starfield(100,1.0,50));
     }  
     Game.setBoard(3,new TitleScreen("Food Invasion", 
                                     "Press space bar to start playing",
                                     playGame));
   };
   
   var level1 = [
    // Start,   End, Gap,  Type,   Override
     [ 0,      4000,  500, 'step' ],
     [ 6000,   13000, 800, 'ltr' ],
     [ 10000,  16000, 400, 'circle' ],
     [ 17800,  20000, 500, 'straight', { x: 50 } ],
     [ 18200,  20000, 500, 'straight', { x: 90 } ],
     [ 18200,  20000, 500, 'straight', { x: 10 } ],
     [ 22000,  25000, 400, 'wiggle', { x: 150 }],
     [ 22000,  25000, 400, 'wiggle', { x: 100 }]
   ];
   
   
   
   var playGame = function() {
     var board = new GameBoard();
     board.add(new PlayerShip());
     board.add(new Level(level1,winGame));
     Game.setBoard(3,board);
     Game.setBoard(5,new GamePoints(0));
   };
   
   var winGame = function() {
     Game.setBoard(3,new TitleScreen("You win!", 
                                     "Press fire to play again",
                                     playGame));
   };
   
   var loseGame = function() {
     Game.setBoard(3,new TitleScreen("You lose!", 
                                     "Press fire to play again",
                                     playGame));
   };
   
   var Starfield = function(speed,opacity,numStars,clear) {
   
     // Set up the offscreen canvas
     var stars = document.createElement("canvas");
     stars.width = Game.width; 
     stars.height = Game.height;
     var starCtx = stars.getContext("2d");
   
     var offset = 0;
   
     // If the clear option is set, 
     // make the background black instead of transparent
     if(clear) {
       starCtx.fillStyle = "#000";
       starCtx.fillRect(0,0,stars.width,stars.height);
     }
   
     // Now draw a bunch of random 2 pixel
     // rectangles onto the offscreen canvas
     starCtx.fillStyle = "#FFF";
     starCtx.globalAlpha = opacity;
     for(var i=0;i<numStars;i++) {
       starCtx.fillRect(Math.floor(Math.random()*stars.width),
                        Math.floor(Math.random()*stars.height),
                        2,
                        2);
     }
   
     // This method is called every frame
     // to draw the starfield onto the canvas
     this.draw = function(ctx) {
       var intOffset = Math.floor(offset);
       var remaining = stars.height - intOffset;
   
       // Draw the top half of the starfield
       if(intOffset > 0) {
         ctx.drawImage(stars,
                   0, remaining,
                   stars.width, intOffset,
                   0, 0,
                   stars.width, intOffset);
       }
   
       // Draw the bottom half of the starfield
       if(remaining > 0) {
         ctx.drawImage(stars,
                 0, 0,
                 stars.width, remaining,
                 0, intOffset,
                 stars.width, remaining);
       }
     };
   
     // This method is called to update
     // the starfield
     this.step = function(dt) {
       offset += dt * speed;
       offset = offset % stars.height;
     };
   };
   
   var PlayerShip = function() { 
     this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });
   
     this.reload = this.reloadTime;
     this.x = Game.width/2 - this.w / 2;
     this.y = Game.height - Game.playerOffset - this.h;
   
     this.step = function(dt) {
       if(Game.keys['left']) { this.vx = -this.maxVel; }
       else if(Game.keys['right']) { this.vx = this.maxVel; }
       else { this.vx = 0; }
   
       this.x += this.vx * dt;
   
       if(this.x < 0) { this.x = 0; }
       else if(this.x > Game.width - this.w) { 
         this.x = Game.width - this.w;
       }
   
       this.reload-=dt;
       if(Game.keys['fire'] && this.reload < 0) {
         Game.keys['fire'] = false;
         this.reload = this.reloadTime;
   
         this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
         this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
       }
     };
   };
   
   PlayerShip.prototype = new Sprite();
   PlayerShip.prototype.type = OBJECT_PLAYER;
   
   PlayerShip.prototype.hit = function(damage) {
     if(this.board.remove(this)) {
       loseGame();
     }
   };
   
   
   var PlayerMissile = function(x,y) {
     this.setup('missile',{ vy: -700, damage: 10 });
     this.x = x - this.w/2;
     this.y = y - this.h; 
   };
   
   PlayerMissile.prototype = new Sprite();
   PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;
   
   PlayerMissile.prototype.step = function(dt)  {
     this.y += this.vy * dt;
     var collision = this.board.collide(this,OBJECT_ENEMY);
     if(collision) {
       collision.hit(this.damage);
       this.board.remove(this);
     } else if(this.y < -this.h) { 
         this.board.remove(this); 
     }
   };
   
   
   var Enemy = function(blueprint,override) {
     this.merge(this.baseParameters);
     this.setup(blueprint.sprite,blueprint);
     this.merge(override);
   };
   
   Enemy.prototype = new Sprite();
   Enemy.prototype.type = OBJECT_ENEMY;
   
   Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                      E: 0, F: 0, G: 0, H: 0,
                                      t: 0, reloadTime: 0.75, 
                                      reload: 0 };
   
   Enemy.prototype.step = function(dt) {
     this.t += dt;
   
     this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
     this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
   
     this.x += this.vx * dt;
     this.y += this.vy * dt;
   
     var collision = this.board.collide(this,OBJECT_PLAYER);
     if(collision) {
       collision.hit(this.damage);
       this.board.remove(this);
     }
   
     if(Math.random() < 0.01 && this.reload <= 0) {
       this.reload = this.reloadTime;
       if(this.missiles == 2) {
         this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
         this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
       } else {
         this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
       }
   
     }
     this.reload-=dt;
   
     if(this.y > Game.height ||
        this.x < -this.w ||
        this.x > Game.width) {
          this.board.remove(this);
     }
   };
   
   Enemy.prototype.hit = function(damage) {
     this.health -= damage;
     if(this.health <=0) {
       if(this.board.remove(this)) {
         Game.points += this.points || 100;
         this.board.add(new Explosion(this.x + this.w/2, 
                                      this.y + this.h/2));
       }
     }
   };
   
   var EnemyMissile = function(x,y) {
     this.setup('enemy_missile',{ vy: 200, damage: 10 });
     this.x = x - this.w/2;
     this.y = y;
   };
   
   EnemyMissile.prototype = new Sprite();
   EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;
   
   EnemyMissile.prototype.step = function(dt)  {
     this.y += this.vy * dt;
     var collision = this.board.collide(this,OBJECT_PLAYER)
     if(collision) {
       collision.hit(this.damage);
       this.board.remove(this);
     } else if(this.y > Game.height) {
         this.board.remove(this); 
     }
   };
   
   
   
   var Explosion = function(centerX,centerY) {
     this.setup('explosion', { frame: 0 });
     this.x = centerX - this.w/2;
     this.y = centerY - this.h/2;
   };
   
   Explosion.prototype = new Sprite();
   
   Explosion.prototype.step = function(dt) {
     this.frame++;
     if(this.frame >= 12) {
       this.board.remove(this);
     }
   };

window.addEventListener('load', () => {
    window.events.$on('start-game', () => {
        Game.initialize('game', sprites, startGame);
    });
});
