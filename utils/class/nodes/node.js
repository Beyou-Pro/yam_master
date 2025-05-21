// Node class
import {NodeState} from "../../enum/nodestate";
import { Nodevalue } from "../../enum/nodevalue";

export class Node {
    x: number;
    y: number;
    value: number | null;
    state: NodeState;

    north: Node | null = null;
    northEast: Node | null = null;
    east: Node | null = null;
    southEast: Node | null = null;
    south: Node | null = null;
    southWest: Node | null = null;
    west: Node | null = null;
    northWest: Node | null = null;

    constructor(x: number, y: number, value: Nodevalue, state: NodeState.EMPTY) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.state = state;
    }

    setState(playerState: NodeState) {
        if (![NodeState.PLAYER1, NodeState.PLAYER2].includes(playerState)) {
            throw new Error("Invalid player state.");
        }

        if (this.state !== NodeState.EMPTY) {
            throw new Error("Node already occupied.");
        }

        this.state = playerState;
    }

    clear() {
        this.state = NodeState.EMPTY;
    }
}
