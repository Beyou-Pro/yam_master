// Durée d'un tour en secondes
const TURN_DURATION = 40;

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

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const GRID_INIT = [
    [
        {viewContent: '1', id: 'brelan1', owner: null, canBeChecked: true},
        {viewContent: '3', id: 'brelan3', owner: null, canBeChecked: true},
        {viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: true},
        {viewContent: '4', id: 'brelan4', owner: null, canBeChecked: true},
        {viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false},
        {viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false},
        {viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false},
        {viewContent: 'Full', id: 'full', owner: null, canBeChecked: false},
        {viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false},
        {viewContent: 'Full', id: 'full', owner: null, canBeChecked: false},
        {viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false},
        {viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false},
        {viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false},
        {viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false},
        {viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false},
        {viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false},
        {viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false},
        {viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false},
        {viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false},
        {viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false},
        {viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false},
    ]
];

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

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        choices: {},
        deck: {},
        player1Tokens: 12,
        player2Tokens: 12,
    }
}

const GameService = {

    init: {
        gameState: () => {
            const game = {...GAME_INIT};
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = {...DECK_INIT};
            game['gameState']['choices'] = {...CHOICES_INIT};
            game['gameState']['grid'] = [...GRID_INIT];
            game['gameState']['player1Tokens'] = 12;
            game['gameState']['player2Tokens'] = 12;
            return game;
        },

        deck: () => {
            return {...DECK_INIT};
        },

        choices: () => {
            return {...CHOICES_INIT};
        },

        grid: () => {
            return [...GRID_INIT];
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
        }
    },

    dices: {
        roll: (dicesToRoll) => {
            return dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1); // Convertir la valeur en chaîne de caractères
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
                locked: true // Verrouille chaque dé
            }));
        }
    },

    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = Array(7).fill(0);
            let hasPair = false;
            let threeOfAKindValue = null;
            let hasThreeOfAKind = false;
            let hasFourOfAKind = false;
            let hasFiveOfAKind = false;
            let hasStraight = false;
            let sum = 0;

            for (let i = 0; i < dices.length; i++) {
                const diceValue = parseInt(dices[i].value);
                counts[diceValue]++;
                sum += diceValue;
            }

            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b);

            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            const isLessThanEqual8 = sum <= 8;

            allCombinations.forEach(combination => {
                if ((combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8)
                ) {
                    availableCombinations.push(combination);
                }
            });

            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isDefi) {
                if (notOnlyBrelan) {
                    return [ALL_COMBINATIONS.find(combination => combination.id === 'defi')];
                }
                return [];
            }

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            return availableCombinations;
        }
    },

    grid: {

        resetcanBeCheckedCells: (grid) => {
            return grid.map(row => row.map(cell => {
                return {...cell, canBeChecked: false};
            }));
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {

            return grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return {...cell, canBeChecked: true};
                } else {
                    return cell;
                }
            }));
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            return grid.map((row, rowIndexParsing) => row.map((cell, cellIndexParsing) => {
                if ((cell.id === idCell) && (rowIndexParsing === rowIndex) && (cellIndexParsing === cellIndex)) {
                    return {...cell, owner: currentTurn};
                } else {
                    return cell;
                }
            }));
        },

        isAnyCombinationAvailableOnGridForPlayer: (gameState) => {
            const grid = gameState.grid;
            const availableChoices = gameState.choices.availableChoices;

            for (let row of grid) {
                for (let cell of row) {
                    if (cell.owner === null) {
                        for (let combination of availableChoices) {
                            if (cell.id === combination.id) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }
    },

    utils: {
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i;
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                    return i;
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i;
                }
            }
            return -1;
        }
    },

    score: {
        getAlignmentScore(grid, player) {
            const directions = [
                { dx: 1, dy: 0 },  // horizontal
                { dx: 0, dy: 1 },  // vertical
                { dx: 1, dy: 1 },  // diagonal TL-BR
                { dx: 1, dy: -1 }, // diagonal TR-BL
            ];

            const visited = new Set();
            let totalScore = 0;

            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (grid[row][col].owner !== player) continue;

                    for (const { dx, dy } of directions) {
                        const keyStart = `${row},${col},${dx},${dy}`;
                        if (visited.has(keyStart)) continue;

                        const coords = [];
                        let r = row;
                        let c = col;

                        while (
                            r >= 0 && r < 5 &&
                            c >= 0 && c < 5 &&
                            grid[r][c].owner === player
                            ) {
                            coords.push(`${r},${c}`);
                            r += dy;
                            c += dx;
                        }

                        if (coords.length === 3) {
                            totalScore += 1;
                            visited.add(keyStart);
                        } else if (coords.length === 4) {
                            totalScore += 2;
                            visited.add(keyStart);
                        } else if (coords.length > 4) {
                            visited.add(keyStart);
                        }
                    }
                }
            }

            return totalScore;
        }
    }
}

module.exports = GameService;
