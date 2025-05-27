// app/components/game-summary.component.js
import { View, Text, Button, StyleSheet } from 'react-native';

const GameSummary = ({ winner, scores, tokens, onReturn }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Résumé de la Partie</Text>
            <Text>Gagnant : {winner}</Text>
            <Text>Score Joueur 1 : {scores.player1} / Pions restants : {tokens.player1}</Text>
            <Text>Score Joueur 2 : {scores.player2} / Pions restants : {tokens.player2}</Text>
            <Button title="Retour au menu" onPress={onReturn} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});

export default GameSummary;
