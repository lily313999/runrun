const player = document.getElementById("player");
const monsterContainer = document.getElementById("monsterContainer");
const game = document.getElementById("game");

const scoreText = document.getElementById("score");
const lifeText = document.getElementById("life");

const gameOverPanel = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const restartBtn = document.getElementById("restartBtn");

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
            6 + score / 200;

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

                    // 最後一命
                    if (life <= 0) {

                        dead = true;
                        gameRunning = false;

                        player.classList.remove("invincible");
                        player.src = "images/dead.png";

                        setTimeout(() => {

                            player.src = "images/dead_last.png";

                        }, 700);

                        setTimeout(() => {

                            gameOver();

                        }, 1200);

                        return;
                    }

                    // 受傷
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
    }

    // 移除畫面外怪物
    monsters = monsters.filter(monster => {

        if (monster.x < -200) {

            monster.el.remove();

            return false;
        }

        return true;
    });

    requestAnimationFrame(update);
}

function gameOver() {

    finalScore.textContent =
        Math.floor(score);

    gameOverPanel.style.display =
        "flex";
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
update();