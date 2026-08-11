const gameContainer =
    document.getElementById("gameContainer");

const bird =
    document.getElementById("bird");

const pipesContainer =
    document.getElementById("pipesContainer");

const gameScore =
    document.getElementById("gameScore");

const headerScore =
    document.getElementById("headerScore");

const bestScoreElement =
    document.getElementById("bestScore");

const footerBestScore =
    document.getElementById("footerBestScore");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const homeButton =
    document.getElementById("homeButton");

const pauseButton =
    document.getElementById("pauseButton");

const resumeButton =
    document.getElementById("resumeButton");

const finalScore =
    document.getElementById("finalScore");

const finalBestScore =
    document.getElementById("finalBestScore");

const newBestMessage =
    document.getElementById("newBestMessage");


const GAME_SETTINGS = {

    gravity: 0.42,

    jumpStrength: -7.2,

    pipeSpeed: 2.8,

    pipeWidth: 62,

    pipeGap: 155,

    pipeInterval: 1450,

    startBirdX: 23,

    maxBirdFallSpeed: 10,

    groundHeight: 58

};


let gameState = "ready";

let birdX = 0;

let birdY = 0;

let birdVelocity = 0;

let score = 0;

let bestScore = 0;

let pipeTimer = 0;

let lastTime = 0;

let animationFrame = null;

let isNewBest = false;


function loadBestScore() {

    try {

        const savedScore =
            localStorage.getItem(
                "flappyBirdBestScore"
            );

        if (savedScore !== null) {

            bestScore =
                parseInt(
                    savedScore,
                    10
                );

        }

    } catch (error) {

        bestScore = 0;

    }


    if (
        Number.isNaN(bestScore) ||
        bestScore < 0
    ) {

        bestScore = 0;

    }


    updateBestScore();

}


function saveBestScore() {

    try {

        localStorage.setItem(
            "flappyBirdBestScore",
            String(bestScore)
        );

    } catch (error) {

        console.log(
            "Unable to save best score."
        );

    }

}


function updateBestScore() {

    bestScoreElement.textContent =
        String(bestScore);

    footerBestScore.textContent =
        String(bestScore);

    finalBestScore.textContent =
        String(bestScore);

}


function updateScore() {

    const value =
        String(score);

    gameScore.textContent =
        value;

    headerScore.textContent =
        value;

}


function getGameWidth() {

    return gameContainer.clientWidth;

}


function getGameHeight() {

    return gameContainer.clientHeight;

}


function getBirdWidth() {

    return bird.offsetWidth;

}


function getBirdHeight() {

    return bird.offsetHeight;

}


function resetBird() {

    birdX =
        getGameWidth() *
        (GAME_SETTINGS.startBirdX / 100);

    birdY =
        getGameHeight() * 0.42;

    birdVelocity = 0;

    bird.style.left =
        birdX + "px";

    bird.style.top =
        birdY + "px";

    bird.style.transform =
        "rotate(0deg)";

}


function flap() {

    if (gameState === "ready") {

        startGame();

        birdVelocity =
            GAME_SETTINGS.jumpStrength;

        return;

    }

    if (gameState !== "playing") {

        return;

    }

    birdVelocity =
        GAME_SETTINGS.jumpStrength;

    bird.style.transform =
        "rotate(-20deg)";

}


function startGame() {

    if (gameState === "playing") {

        return;

    }

    gameState = "playing";

    score = 0;

    pipeTimer = 0;

    lastTime = performance.now();

    isNewBest = false;

    updateScore();

    resetBird();

    clearPipes();

    hideOverlay(startScreen);

    hideOverlay(gameOverScreen);

    hideOverlay(pauseScreen);

    gameContainer.classList.remove(
        "is-game-over"
    );

    gameContainer.classList.remove(
        "is-paused"
    );

    gameContainer.classList.add(
        "is-playing"
    );

    birdVelocity =
        GAME_SETTINGS.jumpStrength;

    if (animationFrame !== null) {

        cancelAnimationFrame(
            animationFrame
        );

    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


function gameLoop(currentTime) {

    if (gameState !== "playing") {

        return;

    }

    let deltaTime =
        currentTime - lastTime;

    lastTime =
        currentTime;

    if (deltaTime > 40) {

        deltaTime = 40;

    }

    const frameMultiplier =
        deltaTime / 16.6667;

    updateBird(frameMultiplier);

    updatePipes(frameMultiplier);

    checkCollisions();

    if (
        gameState !== "playing"
    ) {

        return;

    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


function updateBird(frameMultiplier) {

    birdVelocity +=
        GAME_SETTINGS.gravity *
        frameMultiplier;

    if (
        birdVelocity >
        GAME_SETTINGS.maxBirdFallSpeed
    ) {

        birdVelocity =
            GAME_SETTINGS.maxBirdFallSpeed;

    }

    birdY +=
        birdVelocity *
        frameMultiplier;

    const height =
        getGameHeight();

    const groundLimit =
        height -
        GAME_SETTINGS.groundHeight -
        getBirdHeight();

    if (birdY < 0) {

        birdY = 0;

        birdVelocity = 0;

    }

    if (
        birdY >
        groundLimit
    ) {

        birdY =
            groundLimit;

    }

    bird.style.top =
        birdY + "px";

    let rotation =
        birdVelocity * 5;

    if (rotation < -20) {

        rotation = -20;

    }

    if (rotation > 90) {

        rotation = 90;

    }

    bird.style.transform =
        "rotate(" +
        rotation +
        "deg)";

}


function createPipe() {

    const gameWidth =
        getGameWidth();

    const gameHeight =
        getGameHeight();

    const groundHeight =
        GAME_SETTINGS.groundHeight;

    let gap =
        GAME_SETTINGS.pipeGap;

    if (gameWidth < 400) {

        gap = 140;

    }

    if (gameWidth < 340) {

        gap = 128;

    }

    const playableHeight =
        gameHeight -
        groundHeight;

    const minimumTop = 75;

    const minimumBottom = 75;

    const maximumTop =
        playableHeight -
        gap -
        minimumBottom;

    const topHeight =
        randomNumber(
            minimumTop,
            Math.max(
                minimumTop,
                maximumTop
            )
        );

    const bottomHeight =
        playableHeight -
        topHeight -
        gap;

    const pipePair =
        document.createElement(
            "div"
        );

    pipePair.className =
        "pipe-pair";

    pipePair.dataset.scored =
        "false";

    pipePair.dataset.x =
        String(gameWidth);

    pipePair.dataset.topHeight =
        String(topHeight);

    pipePair.dataset.bottomHeight =
        String(bottomHeight);

    const topPipe =
        document.createElement(
            "div"
        );

    topPipe.className =
        "pipe pipe-top";

    topPipe.style.height =
        topHeight + "px";

    const bottomPipe =
        document.createElement(
            "div"
        );

    bottomPipe.className =
        "pipe pipe-bottom";

    bottomPipe.style.height =
        bottomHeight + "px";

    pipePair.appendChild(
        topPipe
    );

    pipePair.appendChild(
        bottomPipe
    );

    pipePair.style.left =
        gameWidth + "px";

    pipePair.style.width =
        GAME_SETTINGS.pipeWidth +
        14 +
        "px";

    pipesContainer.appendChild(
        pipePair
    );

}


function updatePipes(frameMultiplier) {

    pipeTimer +=
        16.6667 *
        frameMultiplier;

    if (
        pipeTimer >=
        GAME_SETTINGS.pipeInterval
    ) {

        createPipe();

        pipeTimer = 0;

    }

    const pipes =
        Array.from(
            pipesContainer.children
        );

    const speed =
        getCurrentPipeSpeed();

    pipes.forEach(
        function (pipePair) {

            let x =
                parseFloat(
                    pipePair.dataset.x
                );

            x -=
                speed *
                frameMultiplier;

            pipePair.dataset.x =
                String(x);

            pipePair.style.left =
                x + "px";

            const scored =
                pipePair.dataset.scored ===
                "true";

            if (
                !scored &&
                x +
                GAME_SETTINGS.pipeWidth <
                birdX
            ) {

                pipePair.dataset.scored =
                    "true";

                increaseScore();

            }

            if (
                x <
                -GAME_SETTINGS.pipeWidth -
                30
            ) {

                pipePair.remove();

            }

        }
    );

}


function getCurrentPipeSpeed() {

    const bonus =
        Math.min(
            score * 0.06,
            1.4
        );

    return (
        GAME_SETTINGS.pipeSpeed +
        bonus
    );

}


function increaseScore() {

    score += 1;

    updateScore();

    if (gameScore) {

        gameScore.animate(
            [
                {
                    transform:
                        "translateX(-50%) scale(1)"
                },
                {
                    transform:
                        "translateX(-50%) scale(1.2)"
                },
                {
                    transform:
                        "translateX(-50%) scale(1)"
                }
            ],
            {
                duration: 180,
                easing: "ease-out"
            }
        );

    }

    if (
        score >
        bestScore
    ) {

        bestScore =
            score;

        isNewBest = true;

        saveBestScore();

        updateBestScore();

    }

}


function checkCollisions() {

    const birdRect =
        getBirdRect();

    if (
        birdRect.top <= 0
    ) {

        gameOver();

        return;

    }

    const groundTop =
        getGameHeight() -
        GAME_SETTINGS.groundHeight;

    if (
        birdRect.bottom >=
        groundTop
    ) {

        gameOver();

        return;

    }

    const pipePairs =
        Array.from(
            pipesContainer.children
        );

    for (
        let i = 0;
        i < pipePairs.length;
        i++
    ) {

        const pipePair =
            pipePairs[i];

        const topHeight =
            parseFloat(
                pipePair.dataset.topHeight
            );

        const pipeX =
            parseFloat(
                pipePair.dataset.x
            );

        const pipeWidth =
            GAME_SETTINGS.pipeWidth +
            14;

        const horizontalCollision =
            birdRect.right >
            pipeX &&
            birdRect.left <
            pipeX + pipeWidth;

        if (!horizontalCollision) {

            continue;

        }

        let gap =
            GAME_SETTINGS.pipeGap;

        if (
            getGameWidth() < 400
        ) {

            gap = 140;

        }

        if (
            getGameWidth() < 340
        ) {

            gap = 128;

        }

        const topPipeCollision =
            birdRect.top <
            topHeight;

        const gapBottom =
            topHeight +
            gap;

        const bottomPipeCollision =
            birdRect.bottom >
            gapBottom;

        if (
            topPipeCollision ||
            bottomPipeCollision
        ) {

            gameOver();

            return;

        }

    }

}


function getBirdRect() {

    const width =
        getBirdWidth();

    const height =
        getBirdHeight();

    const paddingX =
        width * 0.14;

    const paddingY =
        height * 0.12;

    return {

        left:
            birdX +
            paddingX,

        right:
            birdX +
            width -
            paddingX,

        top:
            birdY +
            paddingY,

        bottom:
            birdY +
            height -
            paddingY

    };

}


function gameOver() {

    if (
        gameState !== "playing"
    ) {

        return;

    }

    gameState =
        "gameover";

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }

    const groundLimit =
        getGameHeight() -
        GAME_SETTINGS.groundHeight -
        getBirdHeight();

    if (
        birdY >
        groundLimit
    ) {

        birdY =
            groundLimit;

    }

    bird.style.top =
        birdY + "px";

    bird.style.transform =
        "rotate(90deg)";

    finalScore.textContent =
        String(score);

    finalBestScore.textContent =
        String(bestScore);

    if (isNewBest) {

        newBestMessage.classList.add(
            "active"
        );

    } else {

        newBestMessage.classList.remove(
            "active"
        );

    }

    gameContainer.classList.remove(
        "is-playing"
    );

    gameContainer.classList.add(
        "is-game-over"
    );

    showOverlay(
        gameOverScreen
    );

}


function pauseGame() {

    if (
        gameState !== "playing"
    ) {

        return;

    }

    gameState =
        "paused";

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }

    gameContainer.classList.remove(
        "is-playing"
    );

    gameContainer.classList.add(
        "is-paused"
    );

    showOverlay(
        pauseScreen
    );

}


function resumeGame() {

    if (
        gameState !== "paused"
    ) {

        return;

    }

    gameState =
        "playing";

    lastTime =
        performance.now();

    hideOverlay(
        pauseScreen
    );

    gameContainer.classList.remove(
        "is-paused"
    );

    gameContainer.classList.add(
        "is-playing"
    );

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


function restartGame() {

    hideOverlay(
        gameOverScreen
    );

    clearPipes();

    score = 0;

    pipeTimer = 0;

    isNewBest = false;

    updateScore();

    resetBird();

    gameContainer.classList.remove(
        "is-game-over"
    );

    gameState =
        "ready";

    startGame();

}


function returnToHome() {

    gameState =
        "ready";

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }

    clearPipes();

    score = 0;

    pipeTimer = 0;

    updateScore();

    resetBird();

    hideOverlay(
        gameOverScreen
    );

    hideOverlay(
        pauseScreen
    );

    showOverlay(
        startScreen
    );

    gameContainer.classList.remove(
        "is-playing"
    );

    gameContainer.classList.remove(
        "is-game-over"
    );

    gameContainer.classList.remove(
        "is-paused"
    );

}


function clearPipes() {

    pipesContainer.innerHTML =
        "";

}


function showOverlay(overlay) {

    if (!overlay) {

        return;

    }

    overlay.classList.add(
        "active"
    );

}


function hideOverlay(overlay) {

    if (!overlay) {

        return;

    }

    overlay.classList.remove(
        "active"
    );

}


function randomNumber(
    minimum,
    maximum
) {

    return (
        Math.random() *
        (
            maximum -
            minimum
        ) +
        minimum
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            if (
                gameState ===
                "paused"
            ) {

                resumeGame();

                return;

            }

            if (
                gameState ===
                "gameover"
            ) {

                restartGame();

                return;

            }

            flap();

        }


        if (
            event.code ===
            "ArrowUp"
        ) {

            event.preventDefault();

            if (
                gameState ===
                "paused"
            ) {

                resumeGame();

                return;

            }

            flap();

        }


        if (
            event.code ===
            "KeyP"
        ) {

            event.preventDefault();

            if (
                gameState ===
                "playing"
            ) {

                pauseGame();

            } else if (
                gameState ===
                "paused"
            ) {

                resumeGame();

            }

        }


        if (
            event.code ===
            "Escape"
        ) {

            event.preventDefault();

            if (
                gameState ===
                "playing"
            ) {

                pauseGame();

            } else if (
                gameState ===
                "paused"
            ) {

                resumeGame();

            }

        }

    }
);


gameContainer.addEventListener(
    "mousedown",
    function (event) {

        if (
            event.target.closest(
                "button"
            )
        ) {

            return;

        }

        if (
            event.target.closest(
                ".overlay-card"
            )
        ) {

            return;

        }

        if (
            gameState ===
            "playing"
        ) {

            flap();

        }

    }
);


gameContainer.addEventListener(
    "touchstart",
    function (event) {

        if (
            gameState ===
            "playing"
        ) {

            event.preventDefault();

        }

        if (
            event.target.closest(
                "button"
            )
        ) {

            return;

        }

        if (
            event.target.closest(
                ".overlay-card"
            )
        ) {

            return;

        }

        if (
            gameState ===
            "playing"
        ) {

            flap();

        }

    },
    {
        passive: false
    }
);


startButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        startGame();

    }
);


restartButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        restartGame();

    }
);


homeButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        returnToHome();

    }
);


pauseButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        pauseGame();

    }
);


resumeButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        resumeGame();

    }
);


window.addEventListener(
    "resize",
    function () {

        if (
            gameState ===
            "ready"
        ) {

            resetBird();

        }

    }
);


loadBestScore();

updateScore();

resetBird();

showOverlay(
    startScreen
);