const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uniqid = require('uniqid');
const GameService = require('./services/game.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewChoices = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
}

const updateClientsViewGrid = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200)
}

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const createGame = (player1Socket, player2Socket) => {

    // init objet (game) with this first level of structure:
    // - gameState : { .. evolutive object .. }
    // - idGame : just in case ;)
    // - player1Socket: socket instance key "joueur:1"
    // - player2Socket: socket instance key "joueur:2"
    const newGame = GameService.init.gameState();
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['player2Socket'] = player2Socket;

    // push game into 'games' global array
    games.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

    // just notifying screens that game is starting
    games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
    games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

    // we update views
    updateClientsViewTimers(games[gameIndex]);
    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);

    // timer every second
    const gameInterval = setInterval(() => {

        // timer variable decreased
        games[gameIndex].gameState.timer--;

        // emit timer to both clients every seconds
        updateClientsViewTimers(games[gameIndex]);

        // if timer is down to 0, we end turn
        if (games[gameIndex].gameState.timer === 0) {

            // switch currentTurn variable
            games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';

            // reset timer
            games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

            // reset deck / choices / grid states
            games[gameIndex].gameState.deck = GameService.init.deck();
            games[gameIndex].gameState.choices = GameService.init.choices();
            games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

            // reset views also
            updateClientsViewTimers(games[gameIndex]);
            updateClientsViewDecks(games[gameIndex]);
            updateClientsViewChoices(games[gameIndex]);
            updateClientsViewGrid(games[gameIndex]);
        }

    }, 1000);

    // remove intervals at deconnection
    player1Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });

    player2Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });

};

const newPlayerInQueue = (socket) => {

    queue.push(socket);

    // 'queue' management
    if (queue.length >= 2) {
        const player1Socket = queue.shift();
        const player2Socket = queue.shift();
        createGame(player1Socket, player2Socket);
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    }
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {

    console.log(`[${socket.id}] socket connected`);

    socket.on('queue.join', () => {
        console.log(`[${socket.id}] new player in queue `)
        newPlayerInQueue(socket);
    });

    socket.on('game.dices.roll', () => {
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

        if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {
            // si ce n'est pas le dernier lancé

            // gestion des dés
            games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
            games[gameIndex].gameState.deck.rollsCounter++;

            // gestion des combinaisons
            const dices = games[gameIndex].gameState.deck.dices;
            const isDefi = games[gameIndex].gameState.choices.isDefi;
            const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

            games[gameIndex].gameState.choices.availableChoices = GameService.choices.findCombinations(dices, isDefi, isSec);

            // gestion des vues
            updateClientsViewDecks(games[gameIndex]);
            updateClientsViewChoices(games[gameIndex]);

        } else {
            // si c'est le dernier lancer

            // gestion des dés
            games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
            games[gameIndex].gameState.deck.rollsCounter++;
            games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

            // gestion des combinaisons
            const dices = games[gameIndex].gameState.deck.dices;
            const isDefi = games[gameIndex].gameState.choices.isDefi;
            const isSec = games[gameIndex].gameState.deck.rollsCounter === 2 && !isDefi;

            // gestion des choix
            const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
            console.log(combinations);
            games[gameIndex].gameState.choices.availableChoices = combinations;

            // check de la grille si des cases sont disponibles
            const isAnyCombinationAvailableOnGridForPlayer = GameService.grid.isAnyCombinationAvailableOnGridForPlayer(games[gameIndex].gameState);
            // Si aucune combinaison n'est disponible après le dernier lancer OU si des combinaisons sont disponibles avec les dés mais aucune sur la grille
            if (combinations.length === 0) {
                games[gameIndex].gameState.timer = 5;

                games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
                games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));
            }

            updateClientsViewDecks(games[gameIndex]);
            updateClientsViewChoices(games[gameIndex]);
        }
    });

    socket.on('game.dices.lock', (idDice) => {

        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

        // reverse flag 'locked'
        games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

        updateClientsViewDecks(games[gameIndex]);
    });

    socket.on('game.defi.called', () => {
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (games[gameIndex].gameState.deck.rollsCounter === 2) {
            games[gameIndex].gameState.choices.isDefi = true;
        }
    });


    socket.on('game.choices.selected', (data) => {

        // gestion des choix
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

        // gestion de la grid
        games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
        games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

        updateClientsViewChoices(games[gameIndex]);
        updateClientsViewGrid(games[gameIndex]);
    });

    // socket.on('game.grid.selected', ...) optimized version

    const handleGridSelection = (socket, data) => {
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        const game = games[gameIndex];
        const currentPlayer = game.gameState.currentTurn;

        resetAndSelectCell(game, data);
        decrementToken(game, currentPlayer);

        const maxAligned = getMaxAlignment(game.gameState.grid, currentPlayer);
        const tokensUsed = currentPlayer === 'player:1'
            ? 12 - game.gameState.player1Tokens
            : 12 - game.gameState.player2Tokens;

        if (maxAligned >= 5 || tokensUsed >= 12) {
            endGame(game, currentPlayer);
            return;
        }

        updateScoreClients(game);
        switchTurn(game);
    };

    const resetAndSelectCell = (game, data) => {
        game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
        game.gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, game.gameState.currentTurn, game.gameState.grid);
    };

    const decrementToken = (game, currentPlayer) => {
        if (currentPlayer === 'player:1') {
            game.gameState.player1Tokens--;
        } else {
            game.gameState.player2Tokens--;
        }
    };

    const getMaxAlignment = (grid, player) => {
        let max = 0;
        const directions = [
            {dx: 1, dy: 0},
            {dx: 0, dy: 1},
            {dx: 1, dy: 1},
            {dx: 1, dy: -1}
        ];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (grid[row][col].owner !== player) continue;
                for (let {dx, dy} of directions) {
                    let count = 1;
                    let r = row + dy;
                    let c = col + dx;
                    while (r >= 0 && r < 5 && c >= 0 && c < 5 && grid[r][c].owner === player) {
                        count++;
                        r += dy;
                        c += dx;
                    }
                    r = row - dy;
                    c = col - dx;
                    while (r >= 0 && r < 5 && c >= 0 && c < 5 && grid[r][c].owner === player) {
                        count++;
                        r -= dy;
                        c -= dx;
                    }
                    if (count > max) max = count;
                }
            }
        }
        return max;
    };

    const endGame = (game, winner) => {
        const summary = {
            winner,
            scores: {
                player1: game.gameState.player1Score,
                player2: game.gameState.player2Score,
            },
            tokens: {
                player1: game.gameState.player1Tokens,
                player2: game.gameState.player2Tokens,
            }
        };
        game.player1Socket.emit('game.end', summary);
        game.player2Socket.emit('game.end', summary);
    };

    const updateScoreClients = (game) => {
        game.player1Socket.emit("game.score", {
            playerScore: game.gameState.player1Score,
            opponentScore: game.gameState.player2Score,
        });
        game.player2Socket.emit("game.score", {
            playerScore: game.gameState.player2Score,
            opponentScore: game.gameState.player1Score,
        });
    };

    const switchTurn = (game) => {
        game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
        game.gameState.timer = GameService.timer.getTurnDuration();
        game.gameState.deck = GameService.init.deck();
        game.gameState.choices = GameService.init.choices();

        game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
        game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));

        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
        updateClientsViewGrid(game);
    };

    socket.on('game.grid.selected', (data) => handleGridSelection(socket, data));


    socket.on('disconnect', reason => {
        console.log(`[${socket.id}] socket disconnected - ${reason}`);
    });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
    console.log('listening on *:3000');
});
