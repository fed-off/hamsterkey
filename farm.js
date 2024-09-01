const RETRY_DELAY = 61_000;

const API_URL = window.location.hostname === 'localhost' ?
                'http://localhost:3000' :
                'https://api.hamsterkey.online';

async function main(generatorId) {
  while (true) {
    try {
      await doFarmTask(generatorId);
    } catch (error) {
      console.error(error);
    }
    await sleep(RETRY_DELAY);
  }
}


async function doFarmTask(generatorId) {
  const task = await requestFarmTask();
  console.log(task);
  const tokens = [];
  while (true) {
    const clientId = generateRandomClientId();
    try {
      const clientToken = await requestClientToken(clientId, task.appToken);
      console.log(clientToken);
      if (!clientToken) {
        break;
      }
      tokens.push(clientToken);
      await sleep(100);
    } catch (error) {
      break;
    }
  }
  if (tokens.length === 0) {
    return;
  }
  await sendTokens(generatorId, task.keyType, tokens);
  console.log(`Sent ${tokens.length} ${task.keyType} tokens`);
}

function generateRandomClientId() {
  const timestamp = Date.now();
  const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
  return `${timestamp}-${randomNumbers}`;
}

async function requestFarmTask() {
  const response = await fetch(`${API_URL}/farm`);
  return await response.json();
}

async function sendTokens(generatorId, keyType, tokens) {
  const response = await fetch(`${API_URL}/farm`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
          client: generatorId,
          keyType: keyType,
          tokens: tokens,
      }),
  });
  const data = await response.json();
  if (!data.success) {
    console.error(data);
    throw new Error('Failed to send tokens');
  }
}

async function requestClientToken(clientId, appToken) {
  const response = await fetch('https://api.gamepromo.io/promo/login-client', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Host': 'api.gamepromo.io',
      },
      body: JSON.stringify({
          appToken: appToken,
          clientId: clientId,
          clientOrigin: 'deviceid',
      }),
  });
  const data = await response.json();
  return data.clientToken;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default main;
