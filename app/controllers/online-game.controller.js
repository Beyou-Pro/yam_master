// app/controller/online-game.controller.js

import React, {useEffect, useState, useContext} from "react";
import {StyleSheet, Text, View, Button} from "react-native";
import {SocketContext} from '../contexts/socket.context';
import Board from "../components/board/board.component";
import GameSummary from "../components/summary/GameSummary";

export default function OnlineGameController({navigation}) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [setIdOpponent] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [summary, setSummary] = useState(null);


    useEffect(() => {
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
        });

        socket.on('queue.left', (data) => {
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            navigation.navigate('HomeScreen');
        });

        socket.on("game.end", (data) => {
            setSummary(data);
            setGameEnded(true);
        });
    }, []);

    return (
        <View style={styles.container}>
            {!inQueue && !inGame && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for server datas...
                    </Text>
                </>
            )}

            {inQueue && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for another player...
                    </Text>
                    <View>
                        <Button
                            title="Quittez la file d'attente"
                            onPress={() => {
                                socket.emit("queue.leave")
                            }
                            }
                        />
                    </View>
                </>
            )}

            {inGame && !gameEnded && <Board />}
            {inGame && gameEnded && summary && (
                <GameSummary
                    winner={summary.winner}
                    scores={summary.scores}
                    tokens={summary.tokens}
                    onReturn={() => {
                        setGameEnded(false);
                        setInGame(false);
                        setSummary(null);
                        navigation.navigate('HomeScreen');
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
    }
});