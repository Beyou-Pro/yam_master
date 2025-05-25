import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const ScoreComponent = ({ isPlayer }) => {
    const socket = useContext(SocketContext);
    const [score, setScore] = useState(0);

    useEffect(() => {
        socket.on("game.score", (data) => {
            setScore(isPlayer ? data.playerScore : data.opponentScore);
        });
    }, []);

    return (
        <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    scoreContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightgrey",
    },
    scoreText: {
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default ScoreComponent;
