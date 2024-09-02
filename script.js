import farmToken from './farm.js';

const gridSize = 6;
let blockSize;
const blocks = [
    { id: 'red1', x: 0, y: 1, width: 1, height: 2, color: 'red' },
    { id: 'red2', x: 1, y: 2, width: 1, height: 2, color: 'red' },
    { id: 'red3', x: 2, y: 3, width: 1, height: 3, color: 'red' },
    { id: 'red4', x: 3, y: 3, width: 1, height: 2, color: 'red' },
    { id: 'red5', x: 5, y: 0, width: 1, height: 3, color: 'red' },
    // { id: 'red6', x: 5, y: 1, width: 1, height: 3, color: 'red' },
    // { id: 'red7', x: 5, y: 3, width: 1, height: 2, color: 'red' },
    { id: 'green1', x: 0, y: 0, width: 2, height: 1, color: 'green' },
    { id: 'green2', x: 0, y: 4, width: 2, height: 1, color: 'green' },
    { id: 'green3', x: 0, y: 5, width: 2, height: 1, color: 'green' },
    { id: 'green4', x: 2, y: 1, width: 2, height: 1, color: 'green' },
    { id: 'green5', x: 3, y: 5, width: 3, height: 1, color: 'green' },
    { id: 'green6', x: 4, y: 3, width: 2, height: 1, color: 'green' },
    { id: 'key', x: 2, y: 2, width: 2, height: 1, color: 'key' }
];

const API_URL = window.location.hostname === 'localhost' ?
                'http://localhost:3000' :
                'https://api.hamsterkey.online';

document.addEventListener('DOMContentLoaded', async () => {

    const giftModal = document.querySelector('#gift-modal');
    const questsModal = document.querySelector('#quests-modal');
    const donateModal = document.querySelector('#donate-modal');
    const rewardList = giftModal.querySelector('.reward-list');
    const closeGiftModalButton = giftModal.querySelector('.close');
    const closeQuestsModalButton = questsModal.querySelector('.close');
    const questList = questsModal.querySelector('.quest-list');
    const questItemTemplate = document.querySelector('#quest-item-template');
    const rewardItemTemplate = document.querySelector('#reward-item-template');
    const questCounterTag = document.querySelector('.quest-counter');
    const questsModalCounter = questsModal.querySelector('.quests-modal-counter');
    const buttonQuest = document.querySelector('.gift');
    const donateButton = document.querySelector('.donate');

    let clientId = null;
    let quests = [];

    async function initQuests() {
        quests = await getQuests();
        updateQuestCounter();
        addQuestsToModal();
        if (!isMinigameOutdated()) {
            showQuestsModal();
        }
    }
    initQuests();

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
        return;
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
        return;

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
        return;
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

    function updateProgressBar() {
        const now = new Date();

        const targetTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20));
        if (now.getUTCHours() >= 20) {
            targetTime.setUTCDate(targetTime.getUTCDate() + 1);
        }

        const startOfDay = new Date(targetTime);
        startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);

        const elapsed = now - startOfDay;
        const total = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        const progress = (elapsed / total) * 100;

        document.getElementById('progress-bar').style.width = progress + '%';
    }
    
    // Обновляем прогресс-бар каждую минуту
    setInterval(updateProgressBar, 60 * 1000);
    
    // Инициализируем прогресс-бар при загрузке страницы
    updateProgressBar();

    function showSpinnerIfOutdated() {
        if (isMinigameOutdated()) {
            document.querySelector('.main-content').classList.add('hidden');
            document.querySelector('.spinner-wrapper').classList.remove('hidden');
        }
    }
    showSpinnerIfOutdated();

    function isMinigameOutdated() {
        const metaDateTag = document.querySelector('meta[name="date"]');
        const lastUpdated = new Date(metaDateTag.content + 'T20:00:00Z');
        const nextUpdate = new Date(lastUpdated);
        nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1);

        const now = new Date();
        return now > nextUpdate;
    }

    function updateQuestCounter() {
        const totalQuests = quests.length;
        const doneQuests = quests.filter(quest => quest.done).length;
        const availableQuests = quests.filter(quest => !quest.done).length;
        questCounterTag.textContent = `${availableQuests}`;
        questsModalCounter.textContent = `${doneQuests}/${totalQuests}`;
        if (availableQuests === 0) {
            buttonQuest.classList.remove('animate');
        }
    }

    function addQuestsToModal() {
        quests.forEach(quest => {
            let action = 'validate';
            const item = questItemTemplate.content.cloneNode(true);
            item.querySelector('.quest-text').textContent = translate(quest.ru, quest.en);
            const button = item.querySelector('.quest-button');
            if (quest.done) {
                button.classList.add('quest-button--done');
            } else if (quest.type === 'link' && !quest.visited) {
                button.classList.add('quest-button--link');
                action = 'link';
            }
            button.addEventListener('click', async (event) => {
                if (action === 'validate') {
                    const rewards = await sendQuestValidate(quest.id);
                    if (rewards.length > 0) {
                        showGiftModal(rewards);
                        quest.done = true;
                        updateQuestCounter();
                        event.target.classList.add('quest-button--done');
                    }
                } else if (action === 'link') {
                    window.open(quest.url, '_blank');
                    const ok = await sendQuestEventLink(quest.id);
                    if (ok) {
                        quest.visited = true;
                        event.target.classList.remove('quest-button--link');
                        action = 'validate';
                    }
                }
            });
            questList.appendChild(item);
        });
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Избегаем прокрутки
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Не удалось скопировать текст', err);
        }
        document.body.removeChild(textArea);
    }

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                console.warn('Не удалось скопировать текст', err);
                fallbackCopyTextToClipboard(text);
            }
        } catch (err) {
            console.warn('Не удалось скопировать текст', err);
            fallbackCopyTextToClipboard(text);
        }
    }

    function showGiftModal(keys) {
        keys.forEach(key => {
            const item = rewardItemTemplate.content.cloneNode(true);
            item.querySelector('p').textContent = key;
            const button = item.querySelector('.copy-button');
            button.addEventListener('click', async (event) => {
                button.classList.add('copy-button--copied');
                copyToClipboard(key);
                event.target.style.backgroundColor = "rgba(10, 250, 100, 0.7)";
                setTimeout(() => {
                    event.target.style.backgroundColor = "";
                }, 1000);
                const clientId = await getClientId();
                farmToken(clientId);
            });
            rewardList.appendChild(item);
        });
        giftModal.classList.remove('hidden');
    }

    donateModal.querySelectorAll('.copy-button').forEach((button) => {
        button.addEventListener('click', (event) => {
            const walletType = event.target.dataset.wallet;
            const wallets = {
                ton: "UQAGV0fsyCWZQ6iXqahJ_Q8-fldNr9hXgWwGLAUS6y-5Wblm",
                eth: "0x1cf750cD6235453b95f33283cb58468Dd0e4E8Ae",
                bybit: "242516986",
            };
            copyToClipboard(wallets[walletType]);
            event.target.style.backgroundColor = "rgba(10, 250, 100, 0.7)";
            setTimeout(() => {
                event.target.style.backgroundColor = "";
            }, 1000);
        });
    });

    donateButton.addEventListener('click', () => {
        donateModal.classList.remove('hidden');
    });

    function showQuestsModal() {
        questsModal.classList.remove('hidden');
    }

    const buttonRefresh = document.querySelector('.refresh');
    buttonRefresh.addEventListener('click', () => {
        resetTimer();
        resetGrid();
    });

    closeGiftModalButton.addEventListener('click', (event) => {
        const closestModal = event.target.closest('.modal');
        closestModal.classList.add('hidden');
        rewardList.innerHTML = '';
    });

    closeQuestsModalButton.addEventListener('click', (event) => {
        const closestModal = event.target.closest('.modal');
        closestModal.classList.add('hidden');
    });

    donateModal.querySelector('button.close').addEventListener('click', (event) => {
        const closestModal = event.target.closest('.modal');
        closestModal.classList.add('hidden');
    });

    const buttonGift = document.querySelector('.gift');
    buttonGift.addEventListener('click', () => {
        showQuestsModal();
    });

    // Устанавливаем скорость воспроизведения
    document.getElementById('myVideo').playbackRate = 0.75;

    function translate(ru, en) {
        const htmlLang = document.documentElement.lang;
        return htmlLang === 'ru' ? ru : en;
    }

    async function getClientId() {
        if (clientId) {
            return clientId;
        }
        // using Yandex.Metrika
        for (let i = 0; i < 20; i++) {
            if (window.yaCounter97937022) {
                clientId = window.yaCounter97937022.getClientID();
                return clientId;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        // fallback to ip
        try {
            const response = await fetch(`${API_URL}/ip`);
            if (!response.ok) {
                const errorData = await response.json();
                console.warn('Failed to get client id:', response.status, errorData.error);
                return null;
            }
            const data = await response.json();
            clientId = data.ip;
            return clientId;
        } catch (error) {
            console.error('Error fetching client id:', error);
            return null;
        }
    }

    async function getQuests() {
        const clientId = await getClientId();
        try {
            const response = await fetch(`${API_URL}/quests?client=${clientId}`, { cache: 'no-store' });
            if (!response.ok) {
                const errorData = await response.json();
                console.warn('Failed to get quests:', response.status, errorData.error);
                return [];
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching quests:', error);
            return [];
        }
    }

    async function sendMiniGameResult(milliseconds) {
        const clientId = await getClientId();
        const body = JSON.stringify({ client: clientId, milliseconds });
        try {
            const response = await fetch(`${API_URL}/minigame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.warn('Failed to send minigame result:', response.status, errorData.error);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending minigame result:', error);
            return null;
        }
    }

    async function sendQuestValidate(questId) {
        const clientId = await getClientId();
        const body = JSON.stringify({ client: clientId, quest: questId });
        try {
            const response = await fetch(`${API_URL}/quests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.warn('Failed to send quest validation:', response.status, errorData.error);
                return null;
            }
            const data = await response.json();
            return data.keys;
        } catch (error) {
            console.error('Error sending quest validation:', error);
            return null;
        }
    }

    async function sendQuestEventLink(questId) {
        const clientId = await getClientId();
        const body = JSON.stringify({ event: 'link', client: clientId, quest: questId });
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.warn('Unexpected response from api:', response.status, errorData.error);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error communicating with api', error);
            return null;
        }
    }
});
