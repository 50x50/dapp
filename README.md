# 50x50

Collborative drawing dApp with a twist.

## Доступные скрипты

In the project directory, you can run:

### `npm start`

Starts the application in development mode.\
Откройте [http://localhost:3000](http://localhost:3000) для просмотра в браузере.

Страница будет перезагружаться, если вы вносите изменения.\
Вы также можете увидеть любые ошибки линтера в консоли.

### `node server/server.js`

Запускает бекэнд сервер (HTTP API и WebSocket API).

### `npm run build`

Собирает приложение для продакшена в папку `build`.\
Объединяет React в режиме продакшена и оптимизирует сборку для наилучшей производительности.

Сборка минифицирована, а имена файлов включают хеши.\
Ваше приложение готово к развертыванию!

Смотрите раздел о [развертывании](https://facebook.github.io/create-react-app/docs/deployment) для получения дополнительной информации.

### `npx hardhat run scripts/deploy.js --network sepolia`

Запускает скрипт `deploy.js` с помощью инструмента Hardhat в сети Sepolia.\
Этот скрипт используется для развертывания вашего контракта в сети Sepolia.

Убедитесь, что у вас установлен Hardhat и вы настроили конфигурацию сети Sepolia в файле `hardhat.config.js`.

После успешного выполнения, вы должны увидеть адрес развернутого контракта в консоли.

### Использование параметра --network

Параметр `--network` используется для указания сети, в которой вы хотите развернуть свой контракт. В приведенном выше примере мы используем сеть Sepolia.

Вы можете добавить новую сеть в файл `hardhat.config.js`. Вот пример того, как это можно сделать:
```
module.exports = {
    solidity: "0.8.18",
    networks: {
        sepolia: {
            url: "https://eth-sepolia.public.blastapi.io",
            accounts: process.env.ADMIN_WALLET_KEY]
        },
        // Добавьте вашу новую сеть здесь
        newNetwork: {
            url: "URL_ВАШЕЙ_СЕТИ",
            accounts: [process.env.ADMIN_WALLET_KEY]
        }
        },
};
```

### Конфигурация dotenv

Мы используем пакет `dotenv` для загрузки переменных из файла `.env`. Этот файл находится в корневой директории проекта и содержит все необходимые переменные окружения в формате `NAME=VALUE`. Для настройки можно ознакомиться с комментариями в самом файле.
