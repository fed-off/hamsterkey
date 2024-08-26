const Keys = {
    config: {
        bike: {
            appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
            promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
        },
    },
}

const PARALLEL_KEYS = 6;
const EVENTS_DELAY_MIN = 25 * 1000;
const BETWEEN_KEYS_DELAY_MAX = 15 * 1000;

const generateClientId = () => {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
};

const delayRandom = () => (Math.random() / 2 + 1);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const login = async (clientId, appToken) => {
    if (!clientId) {
        throw new Error('no client id');
    }
    const response = await fetch('https://api.gamepromo.io/promo/login-client', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
        },
        body: JSON.stringify({
            appToken: appToken,
            clientId: clientId,
            clientOrigin: 'deviceid', // TODO: try random string?
        }),
    });
    const data = await response.json();
    return data.clientToken;
};

const emulateProgress = async (clientToken, promoId, attempts) => {
    if (!clientToken) {
        throw new Error('no access token');
    }
    const response = await fetch('https://api.gamepromo.io/promo/register-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
            promoId: promoId,
            eventId: crypto.randomUUID(),
            eventOrigin: 'undefined', // TODO: try random string?
        }),
    });
    const data = await response.json();
    return data.hasCode;
};

const createKey = async (clientToken, promoId, attempts) => {
    const response = await fetch('https://api.gamepromo.io/promo/create-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
            promoId: promoId,
        }),
    });
    const data = await response.json();
    return data.promoCode;
};

const generateKey = async (type) => {
    const attempts = {};

    await sleep(BETWEEN_KEYS_DELAY_MAX * Math.random());

    const clientId = generateClientId();
    const appToken = Keys.config[type].appToken;
    const clientToken = await login(clientId, appToken);
    console.log('token', clientToken);

    const promoId = Keys.config[type].promoId;
    for (let j = 0; j < 20; j++) {
        console.log('sleeping');
        await sleep(EVENTS_DELAY_MIN * delayRandom());
        const hasCode = await emulateProgress(clientToken, promoId, attempts);
        console.log('hasCode', hasCode);
        if (hasCode) {
            break;
        }
    }

    console.log('sleeping');
    await sleep(EVENTS_DELAY_MIN * delayRandom());
    const key = await createKey(clientToken, promoId, attempts);

    return key;
};



async function main() {
    console.log('Generating bike key');
    const key = await generateKey('bike');
    console.log(key);
    document.querySelector('#key').innerHTML = key;
}

main();

