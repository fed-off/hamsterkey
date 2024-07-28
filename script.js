const gridSize = 6;
let blockSize;
const blocks = [
    { id: 'red1', x: 0, y: 0, width: 1, height: 2, color: 'red' },
    { id: 'red2', x: 4, y: 1, width: 1, height: 2, color: 'red' },
    { id: 'red3', x: 5, y: 1, width: 1, height: 3, color: 'red' },
    { id: 'red4', x: 2, y: 2, width: 1, height: 3, color: 'red' },
    { id: 'red5', x: 3, y: 4, width: 1, height: 2, color: 'red' },
    { id: 'green1', x: 0, y: 4, width: 2, height: 1, color: 'green' },
    { id: 'green2', x: 0, y: 5, width: 3, height: 1, color: 'green' },
    { id: 'green3', x: 1, y: 1, width: 3, height: 1, color: 'green' },
    { id: 'green4', x: 3, y: 0, width: 2, height: 1, color: 'green' },
    { id: 'green5', x: 3, y: 3, width: 2, height: 1, color: 'green' },
    { id: 'green6', x: 4, y: 4, width: 2, height: 1, color: 'green' },
    { id: 'key', x: 0, y: 2, width: 2, height: 1, color: 'key' }
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

    // Обновление таймера каждую секунду
    function startTimer() {
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
                    // alert(`Поздравляем! Ваше время ${totalSeconds} секунд!\nСделайте скриншот и отправьте его в телеграм канал, чтобы поучаствовать в розыгрыше!`);
                }
                stopTimer();
            }

        if (selectedBlock) {
            selectedBlock = null;
        }
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

        // Check boundaries
        if (newX < 0 || newY < 0 || newX + width > gridSize || newY + height > gridSize) {
            return false;
        }

        // Check collisions
        for (const otherBlock of document.querySelectorAll('.block')) {
            if (otherBlock === block) continue;
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
                return false;
            }
        }
        return true;
    }

    function updateProgressBar() {
        const now = new Date();
        const targetTime = new Date(Date.UTC(2024, 6, 29, 20));

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
        alert('Разыгрываем ключ для хомяка из игры Riding Extreme 3D! 🎁🗝️\nПобедит первый, кто пройдет новую 9-ю головоломку за 15 секунд или быстрее.\nНужно сделать скриншот и выложить его в телеграм канале. Удачи!');
    });

    // Устанавливаем скорость воспроизведения
    document.getElementById('myVideo').playbackRate = 0.75;
});
