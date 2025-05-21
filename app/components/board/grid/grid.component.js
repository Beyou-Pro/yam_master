import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import { createLinkedGrid } from "../../../../utils/class/nodes/grid-builder";
import { NodeState } from "../../../../utils/enum/nodestate";
import { NodeValueLabels } from "../../../../utils/enum/nodevalue";

const COLS = 5;

const Grid = () => {
    const socket = useContext(SocketContext);
    const [displayGrid, setDisplayGrid] = useState(true);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState(createLinkedGrid()); // flat array of Nodes

    console.log(grid);
    const handleSelectCell = (node) => {
        if (node && node.state === NodeState.EMPTY) {
            socket.emit("game.grid.selected", {
                cellId: `${node.x}-${node.y}`,
                rowIndex: node.x,
                cellIndex: node.y,
            });
        }
    };

    useEffect(() => {
        socket.on("game.grid.view-state", (data) => {
            setDisplayGrid(data.displayGrid);
            setCanSelectCells(data.canSelectCells);
        });
    }, []);

    const renderRows = () => {
        const rows = [];
        for (let i = 0; i < grid.length; i += COLS) {
            const rowNodes = grid.slice(i, i + COLS);
            const rowIndex = rowNodes[0]?.x;
            rows.push(
                <View key={rowIndex} style={styles.row}>
                    {rowNodes.map((node, colIndex) => (
                        <TouchableOpacity
                            key={`${node.x}-${node.y}`}
                            style={[
                                styles.cell,
                                node.state === NodeState.PLAYER1 && styles.playerOwnedCell,
                                node.state === NodeState.PLAYER2 && styles.opponentOwnedCell,
                                canSelectCells?.some(
                                    ([x, y]) => x === node.x && y === node.y
                                ) &&
                                node.state === NodeState.EMPTY &&
                                styles.canBeCheckedCell,
                                rowIndex !== 0 && styles.topBorder,
                                colIndex !== 0 && styles.leftBorder,
                            ]}
                            onPress={() => handleSelectCell(node)}
                            disabled={
                                !canSelectCells?.some(([x, y]) => x === node.x && y === node.y)
                            }
                        >
                            <Text style={styles.cellText}>
                                {NodeValueLabels[node.value]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return rows;
    };

    return <View style={styles.gridContainer}>{displayGrid && renderRows()}</View>;
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "black",
    },
    cellText: {
        fontSize: 11,
    },
    playerOwnedCell: {
        backgroundColor: "lightgreen",
        opacity: 0.9,
    },
    opponentOwnedCell: {
        backgroundColor: "lightcoral",
        opacity: 0.9,
    },
    canBeCheckedCell: {
        backgroundColor: "lightyellow",
    },
    topBorder: {
        borderTopWidth: 1,
    },
    leftBorder: {
        borderLeftWidth: 1,
    },
});

export default Grid;
