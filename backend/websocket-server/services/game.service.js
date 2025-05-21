// websocket-server/services/game.service.js

const TURN_DURATION = 90;
const END_TURN_DURATION = 5;

const DECK_INIT = {
    dices: [
        {id: 1, value: '', locked: true},
        {id: 2, value: '', locked: true},
        {id: 3, value: '', locked: true},
        {id: 4, value: '', locked: true},
        {id: 5, value: '', locked: true},
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        grid: [],
        choices: {},
        deck: {}
    }
}

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    {value: 'Brelan1', id: 'brelan1'},
    {value: 'Brelan2', id: 'brelan2'},
    {value: 'Brelan3', id: 'brelan3'},
    {value: 'Brelan4', id: 'brelan4'},
    {value: 'Brelan5', id: 'brelan5'},
    {value: 'Brelan6', id: 'brelan6'},
    {value: 'Full', id: 'full'},
    {value: 'Carré', id: 'carre'},
    {value: 'Yam', id: 'yam'},
    {value: 'Suite', id: 'suite'},
    {value: '≤8', id: 'moinshuit'},
    {value: 'Sec', id: 'sec'},
    {value: 'Défi', id: 'defi'}
];

const GameService = {

    init: {
        gameState: () => {
            const game = {...GAME_INIT};
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = {...DECK_INIT};
            game['gameState']['choices'] = {...CHOICES_INIT};
            return game;
        },

        deck: () => {
            return {...DECK_INIT};
        },

        choices: () => {
            return {...CHOICES_INIT};
        }
    },

    send: {
        forPlayer: {

            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            viewLeaveQueueState: () => {
                return {
                    inQueue: false,
                    inGame: false,
                }
            },

            gameTimer: (playerKey, gameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return {playerTimer: playerTimer, opponentTimer: opponentTimer};
            },

            deckViewState: (playerKey, gameState) => {
                return {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
            },

            choicesViewState: (playerKey, gameState) => {
                return {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                };
            },

            gridViewState: (playerKey, gameState) => {

                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };

            }
        }
    },

    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        },

        getEndTurnDuration: () => {
            return END_TURN_DURATION;
        }
    },

    dices: {
        roll: (dicesToRoll) => {
            return dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (!dice.locked) {
                    // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        ...dice,
                        value: newValue
                    };
                } else {
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }
            });
        },

        lockEveryDice: (dicesToLock) => {
            return dicesToLock.map(dice => ({
                ...dice,
                locked: true
            }));
        }


    },

    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const allCombinations = ALL_COMBINATIONS;
            const counts = Array(6).fill(0);

            dices.forEach((dice) => {
                counts[dice.value - 1]++;
            })

            return fillCombinations(allCombinations, counts);
        }
    },

    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        }
    }
}

function fillCombinations(combinations, counts) {
    const availableCombinations = [];

    combinations.forEach((combination) => {
        switch (combination.id) {
            case 'brelan1':
            case 'brelan2':
            case 'brelan3':
            case 'brelan4':
            case 'brelan5':
            case 'brelan6':
                const idx = parseInt(combination.id.replace('brelan', '')) - 1;
                if (checkBrelan(counts, idx)) {
                    availableCombinations.push(combination.value);
                }
                break;
            case 'carre':
                if (checkCarre(counts)) {
                    availableCombinations.push(combination.value);
                }
                break;
            case 'yam':
                if (checkYams(counts)) {
                    availableCombinations.push(combination.value);
                }
                break;
            case 'full':
                if (checkFull(counts)) {
                    availableCombinations.push(combination.value);
                }
                break;
            case 'suite':
                if (checkSuite(counts)) {
                    availableCombinations.push(combination.value);
                }
                break;
            case 'moinshuit':
                if (checkMinusEight(counts)) {
                    availableCombinations.push(combination.value);
                }
                break;
        }
    });
    return availableCombinations;
}

function checkBrelan(counts, idx) {
    return counts[idx] >= 3;
}

function checkCarre(counts) {
    counts.forEach((count) => {
        if (count >= 4) {
            return true;
        }
    })

    return false;
}

function checkYams(counts) {
    counts.forEach((count) => {
        if (count >= 5) {
            return true;
        }
    })

    return false;
}

function checkFull(counts) {
    let isPair, isBrelan = false;

    counts.forEach((count) => {
        if (count === 3) {
            isBrelan = true;
        } else if (count === 2) {
            isPair = true;
        }
    })

    return isPair && isBrelan;
}

function checkSuite(counts) {
    if (counts === [1, 1, 1, 1, 1, 0]) {
        return true;
    } else return counts === [0, 1, 1, 1, 1, 1];
}

function checkMinusEight(counts) {
    return counts.reduce((acc, cur) => acc + cur, 0) <= 8;
}

module.exports = GameService;