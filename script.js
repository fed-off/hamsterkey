import blocks from './minigame-config.js';

const gridSize = 6;
let blockSize;

document.addEventListener('DOMContentLoaded', async () => {

    const grid = document.querySelector('.grid');
    const viewPortSize = document.documentElement.clientWidth;
    if (viewPortSize < 768) {
        blockSize = 48;
    } else {
        blockSize = 90;
    }
    function createBlock(block) {
        const element = document.createElement('button');
        element.classList.add('block', block.color);
        element.style.width = `${block.width * blockSize + (block.width - 1) * 5}px`;
        element.style.height = `${block.height * blockSize + (block.height - 1) * 5}px`;
        element.style.left = `${block.x * blockSize + block.x * 5}px`;
        element.style.top = `${block.y * blockSize + block.y * 5}px`;
        element.dataset.x = block.x;
        element.dataset.y = block.y;
        element.dataset.width = block.width;
        element.dataset.height = block.height;
        element.dataset.color = block.color;
        element.dataset.id = block.id;
        grid.appendChild(element);
        return element;
    }


    let blockElements = blocks.map(createBlock);

    function resetGrid() {
        blockElements.forEach(element => element.remove());
        blockElements = blocks.map(createBlock);
    }

    // Функция для форматирования чисел в формате двузначного числа
    function formatTime(number) {
        return number < 10 ? `0${number}` : number;
    }

    let totalSeconds = 0;
    const timerValue = document.querySelector('.timer__value');
    let timerInterval;
    let startTime;
    let endTime;

    // Обновление таймера каждую секунду
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            totalSeconds++;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timerValue.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
        }, 1000);
    }

    startTimer();

    // Функция для остановки таймера
    function stopTimer() {
        endTime = Date.now();

        const GREEN = 'rgba(0, 254, 100, 0.2)';
        const RED = 'rgba(252, 20, 18, 0.2)';
        const WIN_TIME = 60;

        const timeResultSeconds = (+timerValue.textContent.slice(-2));
        const timeResultMinutes = (+timerValue.textContent.slice(0, 2));
        const timeResult = timeResultMinutes ? WIN_TIME + 1 : timeResultSeconds;
        timeResult < WIN_TIME ? timerValue.style.backgroundColor = `${GREEN}` : timerValue.style.backgroundColor = `${RED}`;

        clearInterval(timerInterval);
        timerValue.classList.add('timer__value--stopped');
    }

    function resetTimer() {
        stopTimer();
        startTimer();
        totalSeconds = 0;
        timerValue.textContent = '00:00';
        timerValue.style.backgroundColor = 'transparent';
        timerValue.classList.remove('timer__value--stopped');
    }

    let selectedBlock = null;

    function startDrag(e) {
        const event = e.touches ? e.touches[0] : e;
        if (event.target.classList.contains('block')) {
            selectedBlock = event.target;
            selectedBlock.initialX = event.clientX;
            selectedBlock.initialY = event.clientY;
            selectedBlock.startX = parseInt(selectedBlock.dataset.x);
            selectedBlock.startY = parseInt(selectedBlock.dataset.y);
        }
    }
    
    async function stopDrag() {
        if (selectedBlock.dataset.id === 'key' && selectedBlock.dataset.x === '4') {
            stopTimer();
            const milliseconds = getResultTimeInMilliseconds();
            sendMiniGameResult(milliseconds);
        }

        if (selectedBlock) {
            selectedBlock = null;
        }
    }

    function getResultTimeInMilliseconds() {
        return endTime - startTime;
    }

    function formatResultTime() {
        const totalMilliseconds = getResultTimeInMilliseconds();
        const minutes = Math.floor(totalMilliseconds / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);
        return `${formatTime(minutes)}:${formatTime(seconds)}.${formatTime(milliseconds)}`;
    }

    function drag(e) {
        e.preventDefault();
        const event = e.touches ? e.touches[0] : e;
        if (selectedBlock) {
            const dx = event.clientX - selectedBlock.initialX;
            const dy = event.clientY - selectedBlock.initialY;
            const deltaX = Math.round(dx / blockSize);
            const deltaY = Math.round(dy / blockSize);
            const newX = selectedBlock.startX + (selectedBlock.dataset.color === 'green' || selectedBlock.dataset.color === 'key' ? deltaX : 0);
            const newY = selectedBlock.startY + (selectedBlock.dataset.color === 'red' ? deltaY : 0);

            if (canMove(selectedBlock, newX, newY)) {
                selectedBlock.style.left = `${newX * blockSize + newX * 5}px`;
                selectedBlock.style.top = `${newY * blockSize + newY * 5}px`;
                selectedBlock.dataset.x = newX;
                selectedBlock.dataset.y = newY;
            }
        }
    }

    grid.addEventListener('mousedown', startDrag);
    grid.addEventListener('touchstart', startDrag);

    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    grid.addEventListener('mousemove', drag);
    grid.addEventListener('touchmove', drag, {passive: false});

    function canMove(block, newX, newY) {
        const width = parseInt(block.dataset.width);
        const height = parseInt(block.dataset.height);
        const currentX = parseInt(block.dataset.x, 10);
        const currentY = parseInt(block.dataset.y, 10);

        // Check boundaries
        if (newX < 0 || newY < 0 || newX + width > gridSize || newY + height > gridSize) {
            return false;
        }

        // Check collisions
        if (newX !== currentX) {
            const step = newX > currentX ? 1 : -1;
            for (const otherBlock of document.querySelectorAll('.block')) {
                for (let x = currentX + step; x !== newX + step; x += step) {
                    if (checkCollision(x, currentY, width, height, otherBlock)) {
                        return false;
                    }
                }
            }
        }
    
        if (newY !== currentY) {
            const step = newY > currentY ? 1 : -1;
            for (const otherBlock of document.querySelectorAll('.block')) {
                for (let y = currentY + step; y !== newY + step; y += step) {
                    if (checkCollision(currentX, y, width, height, otherBlock)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    function checkCollision(newX, newY, width, height, otherBlock) {
        if (selectedBlock === otherBlock) {
            return false;
        }

        const otherX = parseInt(otherBlock.dataset.x);
        const otherY = parseInt(otherBlock.dataset.y);
        const otherWidth = parseInt(otherBlock.dataset.width);
        const otherHeight = parseInt(otherBlock.dataset.height);

        if (
            newX < otherX + otherWidth &&
            newX + width > otherX &&
            newY < otherY + otherHeight &&
            newY + height > otherY
        ) {
            return true;
        }

        return false;
    }

    const buttonRefresh = document.querySelector('.refresh');
    buttonRefresh.addEventListener('click', () => {
        resetTimer();
        resetGrid();
    });

    function translate(ru, en) {
        const htmlLang = document.documentElement.lang;
        return htmlLang === 'ru' ? ru : en;
    }

});
