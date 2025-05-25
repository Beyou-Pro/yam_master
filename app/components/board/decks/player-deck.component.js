import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const PlayerDeck = () => {
    const socket = useContext(SocketContext);
    const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
    const [dices, setDices] = useState(Array(5).fill(false));
    const [displayRollButton, setDisplayRollButton] = useState(false);
    const [rollsCounter, setRollsCounter] = useState(0);
    const [rollsMaximum, setRollsMaximum] = useState(3);
    const [hasCalledDefi, setHasCalledDefi] = useState(false);

    useEffect(() => {
        socket.on("game.deck.view-state", (data) => {
            setDisplayPlayerDeck(data['displayPlayerDeck']);
            if (data['displayPlayerDeck']) {
                setDisplayRollButton(data['displayRollButton']);
                setRollsCounter(data['rollsCounter']);
                setRollsMaximum(data['rollsMaximum']);
                setDices(data['dices']);

                // Reset Defi if turn restarts
                if (data['rollsCounter'] <= 1) {
                    setHasCalledDefi(false);
                }
            }
        });
    }, []);

    const toggleDiceLock = (index) => {
        const newDices = [...dices];
        if (newDices[index].value !== '' && displayRollButton) {
            socket.emit("game.dices.lock", newDices[index].id);
        }
    };

    const rollDices = () => {
        if (rollsCounter <= rollsMaximum) {
            socket.emit("game.dices.roll");
        }
    };

    const callDefi = () => {
        socket.emit("game.defi.called");
        setHasCalledDefi(true);
    };

    const shouldShowDefiButton = rollsCounter === 2 && !hasCalledDefi;

    return (
        <View style={styles.deckPlayerContainer}>
            {displayPlayerDeck && (
                <>
                    {displayRollButton && (
                        <View style={styles.rollInfoContainer}>
                            <Text style={styles.rollInfoText}>
                                Lancer {rollsCounter} / {rollsMaximum}
                            </Text>
                        </View>
                    )}

                    <View style={styles.diceContainer}>
                        {dices.map((diceData, index) => (
                            <Dice
                                key={diceData.id}
                                index={index}
                                locked={diceData.locked}
                                value={diceData.value}
                                onPress={toggleDiceLock}
                            />
                        ))}
                    </View>

                    {shouldShowDefiButton && (
                        <TouchableOpacity style={styles.defiButton} onPress={callDefi}>
                            <Text style={styles.defiButtonText}>Call Défi</Text>
                        </TouchableOpacity>
                    )}

                    {displayRollButton && (
                        <TouchableOpacity style={styles.rollButton} onPress={rollDices}>
                            <Text style={styles.rollButtonText}>Roll</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    deckPlayerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "black"
    },
    rollInfoContainer: {
        marginBottom: 10,
    },
    rollInfoText: {
        fontSize: 14,
        fontStyle: "italic",
    },
    diceContainer: {
        flexDirection: "row",
        width: "70%",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    rollButton: {
        width: "30%",
        backgroundColor: "green",
        paddingVertical: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    rollButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    defiButton: {
        width: "30%",
        backgroundColor: "orange",
        paddingVertical: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    defiButtonText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
});

export default PlayerDeck;
