export const NodeValue = Object.freeze({
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    CARRE: 7,
    FULL: 8,
    YAM: 9,
    MINUS8: 10,
    SEC: 11,
    STRAIGHT: 12,
    CHALLENGE: 13,
});

// Add a label for each
export const NodeValueLabels = {
    [NodeValue.ONE]: "One",
    [NodeValue.TWO]: "Two",
    [NodeValue.THREE]: "Three",
    [NodeValue.FOUR]: "Four",
    [NodeValue.FIVE]: "Five",
    [NodeValue.SIX]: "Six",
    [NodeValue.CARRE]: "Carré",
    [NodeValue.FULL]: "Full House",
    [NodeValue.YAM]: "Yam",
    [NodeValue.MINUS8]: "<=8",
    [NodeValue.SEC]: "Sec",
    [NodeValue.STRAIGHT]: "Straight",
    [NodeValue.CHALLENGE]: "Challenge",
};
