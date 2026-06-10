const player = document.getElementById("player");
const monsterContainer = document.getElementById("monsterContainer");
const game = document.getElementById("game");

const scoreText = document.getElementById("score");
const lifeText = document.getElementById("life");

const gameOverPanel = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const restartBtn = document.getElementById("restartBtn");

let distanceScore = 0;
let score = 0;
let life = 3;

let jumping = false;
let gameRunning = true;
let dead = false;

let playerY = 0;
let velocityY = 0;

let invincible = false;

const gravity = 0.75;
const jumpPower = 19;

let monsters = [];

let coins = [];

function jump() {

    if (jumping || !gameRunning || dead) return;

    jumping = true;
    velocityY = jumpPower;

    if (!invincible) {
        player.src = "images/jump.png";
    }
}

// 電腦點擊跳躍
window.addEventListener("mousedown", jump);

// 手機觸控跳躍
game.addEventListener(
    "touchstart",
    function (e) {

        // 點到按鈕時不要跳躍
        if (e.target.id === "restartBtn") {
            return;
        }

        e.preventDefault();
        jump();
    },
    { passive: false }
);

function createMonster() {

    if (!gameRunning) return;

    const monster = document.createElement("img");

    monster.src = "images/monster.png";
    monster.classList.add("monster");

    monster.style.left = "110%";

    monsterContainer.appendChild(monster);

    monsters.push({
        el: monster,
        x: window.innerWidth * 1.1,
        hit: false
    });

    const nextSpawn =
        Math.random() * 3000 + 2000;

    setTimeout(createMonster, nextSpawn);
}

function update() {

    if (!gameRunning && dead) {
        return;
    }

    distanceScore += 0.1;
    score += 0.1;

    scoreText.textContent =
        Math.floor(score);

    // 跳躍物理
    if (jumping && !dead) {

        velocityY -= gravity;

        playerY += velocityY;

        if (playerY <= 0) {

            playerY = 0;

            jumping = false;

            if (!invincible) {
                player.src = "images/run.png";
            }
        }
    }

    player.style.transform =
        `translateY(${-playerY}px)`;

if (!dead) {

    const speed =
        6 + distanceScore / 200;

    // 怪物移動與碰撞
    monsters.forEach(monster => {

        monster.x -= speed;

        monster.el.style.left =
            monster.x + "px";

        if (!monster.hit) {

            const p =
                player.getBoundingClientRect();

            const m =
                monster.el.getBoundingClientRect();

            const margin = 20;

            const collision =
                p.left + margin < m.right &&
                p.right - margin > m.left &&
                p.top + margin < m.bottom &&
                p.bottom - margin > m.top;

            if (collision && !invincible) {

                monster.hit = true;

                life--;

                lifeText.textContent = life;

                monster.el.style.opacity = "0.5";

                if (life <= 0) {

                    dead = true;
                    gameRunning = false;

                    player.classList.remove("invincible");
                    player.src = "images/dead.png";

                    setTimeout(() => {

                        player.src =
                            "images/dead_last.png";

                    }, 700);

                    setTimeout(() => {

                        gameOver();

                    }, 1200);

                    return;
                }

                player.src = "images/hurt.png";

                invincible = true;

                player.classList.add("invincible");

                setTimeout(() => {

                    invincible = false;

                    player.classList.remove("invincible");

                    if (dead) return;

                    if (jumping) {
                        player.src = "images/jump.png";
                    } else {
                        player.src = "images/run.png";
                    }

                }, 1500);
            }
        }
    });

    // ====================
    // 金幣移動
    // ====================

    coins.forEach(coin => {

        coin.x -= speed;

    });

    // ====================
    // 金幣漂浮動畫
    // ====================

    coins.forEach(coin => {

        if (coin.collected) return;

        coin.floatOffset += 0.08;

        coin.el.style.left =
            coin.x + "px";

        coin.el.style.bottom =
            (
                coin.baseY +
                Math.sin(
                    coin.floatOffset
                ) * 8
            ) + "px";
    });

    // ====================
    // 吃金幣
    // ====================

    coins.forEach(coin => {

        if (coin.collected) return;

        const p =
            player.getBoundingClientRect();

        const c =
            coin.el.getBoundingClientRect();

        const collision =
            p.left < c.right &&
            p.right > c.left &&
            p.top < c.bottom &&
            p.bottom > c.top;

        if (collision) {

            coin.collected = true;

            score +=
                coin.big
                ? 1000
                : 100;

            coin.el.remove();
        }
    });
}
    // 移除畫面外怪物
    monsters = monsters.filter(monster => {

        if (monster.x < -200) {

            monster.el.remove();

            return false;
        }

        return true;
    });

    // 移除畫面外金幣
    coins = coins.filter(coin => {

        if (coin.x < -100) {

            coin.el.remove();
    
        return false;
        }

        return !coin.collected;
    });

    requestAnimationFrame(update);
}

//金幣生成器
function createCoin(x, y, big = false){

    const coin = document.createElement("img");

    coin.src = big
        ? "images/bigcoin.png"
        : "images/coin.png";

    coin.classList.add("coin");

    monsterContainer.appendChild(coin);

    coins.push({
        el: coin,
        x: x,
        baseY: y,
        y: y,
        big: big,
        collected: false,
        floatOffset: Math.random() * Math.PI * 2
    });
}

//80%平地金幣
function spawnGroundCoins(){

    const count =
        Math.floor(Math.random() * 4) + 3;

    const startX =
        window.innerWidth + 300;

    for(let i=0;i<count;i++){

        createCoin(
            startX + i * 80,
            window.innerHeight * 0.15 + 20
        );
    }
}

//空中垂直列
function spawnVerticalCoins(){

    const count = 4;

    const x =
        window.innerWidth + 300;

    const baseY =
        window.innerHeight * 0.15 +
        80 +
        Math.random()*100;

    for(let i=0;i<count;i++){

        createCoin(
            x,
            baseY + i * 70
        );
    }
}

//大金幣（5%）
function spawnBigCoin(){

    createCoin(
        window.innerWidth + 300,
        window.innerHeight * 0.15 + 30,
        true
    );
}


function gameOver() {

    finalScore.textContent =
        Math.floor(score);

    gameOverPanel.style.display =
        "flex";
}

//貓咪圖案金幣
function spawnCatCoins(){

    const startX =
        window.innerWidth + 400;

    const points = [

        [1,0],[3,0],

        [0,1],[1,1],[2,1],[3,1],[4,1],

        [0,2],[4,2],

        [1,3],[2,3],[3,3],

        [1,4],[3,4]
    ];

    points.forEach(p=>{

        createCoin(
            startX + p[0]*60,
            220 + p[1]*60
        );

    });
}


//金幣產生排程
function createCoinGroup(){

    if(!gameRunning) return;

    const r = Math.random();

    if(r < 0.60){

        spawnGroundCoins();

    }else if(r < 0.80){

        spawnVerticalCoins();

    }else if(r < 0.95){

        spawnCatCoins();

    }else{

        spawnBigCoin();
    }

    setTimeout(
        createCoinGroup,
        2500 + Math.random()*2000
    );
}


// 重新開始
function restartGame() {
    location.reload();
}

restartBtn.addEventListener(
    "click",
    restartGame
);

restartBtn.addEventListener(
    "touchend",
    function(e){
        e.preventDefault();
        restartGame();
    }
);

createMonster();
createCoinGroup();
update();