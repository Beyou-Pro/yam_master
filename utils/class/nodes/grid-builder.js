import { Node } from "./node";
import { NodeState } from "../../enum/nodestate";
import { NodeValue } from "../../enum/nodevalue";

const cols = 5;
const rows = 5;

const nodeValues = [
    NodeValue.ONE, NodeValue.THREE, NodeValue.CHALLENGE, NodeValue.FOUR, NodeValue.SIX,
    NodeValue.TWO, NodeValue.CARRE, NodeValue.SEC, NodeValue.FULL, NodeValue.FIVE,
    NodeValue.MINUS8, NodeValue.FULL, NodeValue.YAM, NodeValue.CHALLENGE, NodeValue.STRAIGHT,
    NodeValue.SIX, NodeValue.SEC, NodeValue.STRAIGHT, NodeValue.MINUS8, NodeValue.ONE,
    NodeValue.THREE, NodeValue.TWO, NodeValue.CARRE, NodeValue.FIVE, NodeValue.FOUR,
];

export function createLinkedGrid() {
    const nodes = [];

    for (let i = 0; i < nodeValues.length; i++) {
        const x = Math.floor(i / cols);
        const y = i % cols;
        const node = new Node(x, y, nodeValues[i]);
        node.state = NodeState.EMPTY;
        nodes.push(node);
    }

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const x = node.x;
        const y = node.y;

        const get = (xi, yi) =>
            xi >= 0 && xi < rows && yi >= 0 && yi < cols
                ? nodes[xi * cols + yi]
                : null;

        node.north = get(x - 1, y);
        node.south = get(x + 1, y);
        node.west = get(x, y - 1);
        node.east = get(x, y + 1);
        node.northWest = get(x - 1, y - 1);
        node.northEast = get(x - 1, y + 1);
        node.southWest = get(x + 1, y - 1);
        node.southEast = get(x + 1, y + 1);
    }

    return nodes;
}
