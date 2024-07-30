const gridSize = 6;
let blockSize;
const blocks = [
    { id: 'red1', x: 2, y: 0, width: 1, height: 2, color: 'red' },
    { id: 'red2', x: 1, y: 3, width: 1, height: 3, color: 'red' },
    { id: 'red3', x: 2, y: 3, width: 1, height: 2, color: 'red' },
    { id: 'red4', x: 4, y: 1, width: 1, height: 2, color: 'red' },
    { id: 'red5', x: 5, y: 1, width: 1, height: 2, color: 'red' },
    { id: 'red6', x: 5, y: 3, width: 1, height: 3, color: 'red' },
    { id: 'green1', x: 0, y: 1, width: 2, height: 1, color: 'green' },
    { id: 'green2', x: 0, y: 2, width: 2, height: 1, color: 'green' },
    { id: 'green3', x: 2, y: 5, width: 3, height: 1, color: 'green' },
    { id: 'green4', x: 3, y: 3, width: 2, height: 1, color: 'green' },
    { id: 'green5', x: 4, y: 0, width: 2, height: 1, color: 'green' },
    { id: 'key', x: 2, y: 2, width: 2, height: 1, color: 'key' }
];


document.addEventListener('DOMContentLoaded', () => {
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
        const GREEN = 'rgba(0, 254, 100, 0.2)';
        const RED = 'rgba(252, 20, 18, 0.2)';
        const WIN_TIME = 30;

        endTime = Date.now();

        const timeResultSeconds = (+timerValue.textContent.slice(-2));
        const timeResultMinutes = (+timerValue.textContent.slice(0, 2));
        const timeResult = timeResultMinutes ? WIN_TIME + 1 : timeResultSeconds;
        timeResult < WIN_TIME ? timerValue.style.backgroundColor = `${GREEN}` : timerValue.style.backgroundColor = `${RED}`;

        clearInterval(timerInterval);
        timerValue.classList.add('timer__value--stopped');
    }

    function resetTimer() {
        stopTimer();
        totalSeconds = 0;
        timerValue.textContent = '00:00';
        timerValue.style.backgroundColor = 'transparent';
        timerValue.classList.remove('timer__value--stopped');
        startTimer();
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
    
    function stopDrag() {
        if (selectedBlock.dataset.id === 'key' &&
            selectedBlock.dataset.x === '4') {
                if (totalSeconds <= 15) {
                    stopTimer();
                    const resultTime = formatResultTime();
                    const msg = translate(
                        `Поздравляем! Ваше время ${resultTime}.\nСделайте скриншот и отправьте его в телеграм канал, чтобы поучаствовать в розыгрыше!`,
                        `Congratulations! Your time is ${resultTime}.\nMake a screenshot and send it to the telegram channel to participate in the draw!`
                    );
                    alert(msg);
                }
                stopTimer();
            }

        if (selectedBlock) {
            selectedBlock = null;
        }
    }

    function formatResultTime() {
        const totalMilliseconds = endTime - startTime;
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

    function updateProgressBar() {
        const now = new Date();
        const targetTime = new Date(Date.UTC(2024, 6, 31, 20));

        const startOfDay = new Date(targetTime);
        startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
    
        const elapsed = now - startOfDay;
        const total = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        const progress = (elapsed / total) * 100;

        document.getElementById('progress-bar').style.width = progress + '%';
    }
    
    // Обновляем прогресс-бар каждые 1000 миллисекунд (1 секунда)
    setInterval(updateProgressBar, 1000);
    
    // Инициализируем прогресс-бар при загрузке страницы
    updateProgressBar();
    

    const buttonRefresh = document.querySelector('.refresh');
    buttonRefresh.addEventListener('click', () => {
        resetTimer();
        resetGrid();
        // location.reload();
    });

    const buttonGift = document.querySelector('.gift');
    buttonGift.addEventListener('click', () => {
        const msg = translate(
            'Разыгрываем ключи из игры Riding Extreme 3D! Подробности в телеграм-канале.',
            'We are giving away keys from the game Riding Extreme 3D! Details in the telegram channel.'
        );
        alert(msg);
    });

    // Устанавливаем скорость воспроизведения
    document.getElementById('myVideo').playbackRate = 0.75;

    function translate(ru, en) {
        const htmlLang = document.documentElement.lang;
        return htmlLang === 'ru' ? ru : en;
    }
});
