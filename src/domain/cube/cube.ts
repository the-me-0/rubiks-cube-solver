const COLOR = {
    WHITE: 5,
    YELLOW: 4,
    RED: 3,
    ORANGE: 2,
    GREEN: 1,
    BLUE: 0
} as const;
type COLOR = (typeof COLOR)[keyof typeof COLOR];

type Slot =
    | { kind: "edge"; index: number }
    | { kind: "corner"; index: number }
    | { kind: "center" };

/**
 * Neighbours of each face, clockwise as seen from outside the cube.
 * The first one is the face drawn on top in the standard net.
 */
const FACE_NEIGHBORS: Record<COLOR, readonly [COLOR, COLOR, COLOR, COLOR]> = {
    [COLOR.WHITE]:  [COLOR.BLUE,  COLOR.RED,    COLOR.GREEN,  COLOR.ORANGE],
    [COLOR.GREEN]:  [COLOR.WHITE, COLOR.RED,    COLOR.YELLOW, COLOR.ORANGE],
    [COLOR.RED]:    [COLOR.WHITE, COLOR.BLUE,   COLOR.YELLOW, COLOR.GREEN],
    [COLOR.BLUE]:   [COLOR.WHITE, COLOR.ORANGE, COLOR.YELLOW, COLOR.RED],
    [COLOR.ORANGE]: [COLOR.WHITE, COLOR.GREEN,  COLOR.YELLOW, COLOR.BLUE],
    [COLOR.YELLOW]: [COLOR.GREEN, COLOR.RED,    COLOR.BLUE,   COLOR.ORANGE],
};

/**
 * Faces of the standard net, row by row. null = empty spot.
 *
 *          WHITE
 *  ORANGE  GREEN  RED  BLUE
 *          YELLOW
 *
 * Each face is drawn with the first neighbour of FACE_NEIGHBORS on top.
 */
const NET_LAYOUT: ReadonlyArray<ReadonlyArray<COLOR | null>> = [
    [null,         COLOR.WHITE,  null,       null      ],
    [COLOR.ORANGE, COLOR.GREEN,  COLOR.RED,  COLOR.BLUE],
    [null,         COLOR.YELLOW, null,       null      ],
];

/**
 *      PRIORITY
 * HIGH     - WHITE/YELLOW
 * MEDIUM   - RED/ORANGE
 * LOW      - GREEN/BLUE
 */

const RANK = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2
} as const;
type RANK = (typeof RANK)[keyof typeof RANK];

const colorToRank = (color: COLOR) => {
    if (color === COLOR.WHITE || color === COLOR.YELLOW) return RANK.HIGH;
    if (color === COLOR.RED || color === COLOR.ORANGE) return RANK.MEDIUM;
    else return RANK.LOW;
}

type RankDirection = "highest" | "lowest";

/**
 * Tells on which side of an edge ("colorOne" or "colorTwo") the highest or the lowest ranked color is.
 */
const resolveSideByRank = (edge: Edge, direction: RankDirection): keyof Edge => {
    const colorOneRank = colorToRank(edge.colorOne);
    const colorTwoRank = colorToRank(edge.colorTwo);

    if (colorOneRank === colorTwoRank) {
        // should not happen. edges with two sides of the same rank would mean the rubiks cube is invalid.
        throw new Error(
            "CubeError: unable to resolve the " + direction + " color rank for an edge. Are you feeding an invalid edge ? " +
            "(colorOne: " + edge.colorOne + "/rank " + colorOneRank + ", colorTwo: " + edge.colorTwo + "/rank " + colorTwoRank + ")"
        );
    }

    // RANK.HIGH is 0: the highest priority is the smallest rank value.
    const colorOneIsHighest = colorOneRank < colorTwoRank;
    const wantsColorOne = (direction === "highest") === colorOneIsHighest;

    return wantsColorOne ? "colorOne" : "colorTwo";
}

const COLOR_EMOJI: Record<COLOR, string> = {
    [COLOR.WHITE]: "⬜",
    [COLOR.YELLOW]: "🟨",
    [COLOR.RED]: "🟥",
    [COLOR.ORANGE]: "🟧",
    [COLOR.GREEN]: "🟩",
    [COLOR.BLUE]: "🟦"
};

const colorToEmoji = (color: COLOR): string => COLOR_EMOJI[color];

// Blank spots of the net are drawn with the same width as an emoji, so faces stay aligned.
const BLANK_CELL = "  ";
const BLANK_FACE_ROW = [BLANK_CELL, BLANK_CELL, BLANK_CELL].join(' ');
const BLANK_FACE = [BLANK_FACE_ROW, BLANK_FACE_ROW, BLANK_FACE_ROW];

// 1 OBJET CUBE
// propriété "arete" entier 64 bits, 5 bits par arete. 4 pour id, sa position est déterminée par son emplacement dans l'entier binaire.
//   le dernier bit est un bit de positionnement : si sur cette edge, la couleur la plus importante est du même côté que si on la remplaçait par la bonne edge
// veut dire que l'on doit pouvoir faire "numero 0~11 = 2 couleurs"

type Edge = {
    colorOne: COLOR;
    colorTwo: COLOR;
};
type Corner = Edge & { colorThree: COLOR };

class Cube {
    static #instance: Cube;
    private edgesState: string;
    private cornersState: string;

    public static edgeLibrary: Array<Edge> = [
        { colorOne: COLOR.WHITE, colorTwo: COLOR.GREEN },
        { colorOne: COLOR.WHITE, colorTwo: COLOR.ORANGE },
        { colorOne: COLOR.WHITE, colorTwo: COLOR.BLUE },
        { colorOne: COLOR.WHITE, colorTwo: COLOR.RED },
        { colorOne: COLOR.ORANGE, colorTwo: COLOR.GREEN },
        { colorOne: COLOR.BLUE, colorTwo: COLOR.ORANGE },
        { colorOne: COLOR.RED, colorTwo: COLOR.BLUE },
        { colorOne: COLOR.GREEN, colorTwo: COLOR.RED },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.GREEN },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.ORANGE },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.BLUE },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.RED }
    ];
    public static cornerLibrary: Array<Corner> = [
        { colorOne: COLOR.WHITE,  colorTwo: COLOR.GREEN,  colorThree: COLOR.ORANGE },
        { colorOne: COLOR.WHITE,  colorTwo: COLOR.ORANGE, colorThree: COLOR.BLUE },
        { colorOne: COLOR.WHITE,  colorTwo: COLOR.BLUE,   colorThree: COLOR.RED },
        { colorOne: COLOR.WHITE,  colorTwo: COLOR.RED,    colorThree: COLOR.GREEN },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.ORANGE, colorThree: COLOR.GREEN },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.BLUE,   colorThree: COLOR.ORANGE },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.RED,    colorThree: COLOR.BLUE },
        { colorOne: COLOR.YELLOW, colorTwo: COLOR.GREEN,  colorThree: COLOR.RED }
    ];

    private readonly edgesSolved: string = "01011_01010_01001_01000_00111_00110_00101_00100_00011_00010_00001_00000";
    private readonly cornersSolved: string = "00111_00110_00101_00100_00011_00010_00001_00000";

    public isSolved(): boolean {
        return (this.edgesState == this.edgesSolved) && (this.cornersState == this.cornersSolved);
    }

    /**
     * Constructs a solved rubik's cube
     */
    private constructor() {
        this.edgesState = this.edgesSolved;
        this.cornersState = this.cornersSolved;
    }

    public static get instance(): Cube {
        if (!Cube.#instance) {
            Cube.#instance = new Cube();
        }

        return Cube.#instance;
    }

    /**
     * Index of the edge slot lying between two faces. Order of the arguments does not matter:
     * we look for the edge that shows both colors, wherever they sit in the library entry.
     */
    private static findEdgeSlot(face: COLOR, neighbor: COLOR): number {
        return Cube.edgeLibrary.findIndex(edgePiece => {
            const pieceColors = Object.values(edgePiece);
            return pieceColors.includes(face) && pieceColors.includes(neighbor);
        });
    }

    /**
     * Index of the corner slot lying between three faces. Order of the arguments does not matter.
     */
    private static findCornerSlot(face: COLOR, firstNeighbor: COLOR, secondNeighbor: COLOR): number {
        return Cube.cornerLibrary.findIndex(cornerPiece => {
            const pieceColors = Object.values(cornerPiece);
            return pieceColors.includes(face)
                && pieceColors.includes(firstNeighbor)
                && pieceColors.includes(secondNeighbor);
        });
    }

    /** The 9 cells of a face, row by row, with `up` drawn on top. */
    private static faceLayout(face: COLOR, up: COLOR): Slot[] {
        const neighbors = FACE_NEIGHBORS[face];
        const start = neighbors.indexOf(up);
        if (start === -1) {
            throw new Error("CubeError: `up` must be a face adjacent to the requested face.");
        }
        const neighborAt = (offset: number): COLOR => neighbors[(start + offset) % 4] as COLOR;
        const [top, right, bottom, left] = [neighborAt(0), neighborAt(1), neighborAt(2), neighborAt(3)];

        const edge = (neighbor: COLOR): Slot =>
            ({ kind: "edge", index: Cube.findEdgeSlot(face, neighbor) });
        const corner = (firstNeighbor: COLOR, secondNeighbor: COLOR): Slot =>
            ({ kind: "corner", index: Cube.findCornerSlot(face, firstNeighbor, secondNeighbor) });

        return [
            corner(left, top),      edge(top),          corner(top, right),
            edge(left),             { kind: "center" }, edge(right),
            corner(bottom, left),   edge(bottom),       corner(right, bottom),
        ];
    }

    public getFaceStickers(face: COLOR, up: COLOR = FACE_NEIGHBORS[face][0]): COLOR[][] {
        const stickers = Cube.faceLayout(face, up).map(slot => {
            switch (slot.kind) {
                case "edge":   return this.resolveEdgeColor(slot.index, face);
                case "corner": return this.resolveCornerColor(slot.index, face);
                case "center": return face;
            }
        });
        return [stickers.slice(0, 3), stickers.slice(3, 6), stickers.slice(6, 9)];
    }

    private getEdges(): Array<string> {
        return this.edgesState.split('_')
    }

    private getCorners(): Array<string> {
        return this.cornersState.split('_');
    }

    private resolveEdgeColor(edgeNumber: number, faceGoal: COLOR): COLOR {
        // we reverse it to be able to read the positions easily
        const edges = this.getEdges().reverse();

        const edgeOfInterest = Cube.edgeLibrary[parseInt(edges[edgeNumber].slice(-4), 2)];
        const onPosition = Cube.edgeLibrary[edgeNumber];

        const flipped = edges[edgeNumber][0] == "1";

        // is the face we are drawing the highest ranked one on this position ?
        const faceIsHighestOnPosition = onPosition[resolveSideByRank(onPosition, "highest")] === faceGoal;

        // an aligned edge shows its highest color on the highest face of the position (and its lowest on the lowest).
        // a flipped edge shows the opposite.
        const wantsHighestColor = faceIsHighestOnPosition !== flipped;

        return edgeOfInterest[resolveSideByRank(edgeOfInterest, wantsHighestColor ? "highest" : "lowest")];
    }

    private resolveCornerColor(cornerNumber: number, faceGoal: COLOR): COLOR {
        const corners = this.getCorners().reverse();

        const cornerOfInterest = Cube.cornerLibrary[parseInt(corners[cornerNumber].slice(-3), 2)];
        const onPosition = Cube.cornerLibrary[cornerNumber];

        const alignedBit = parseInt(corners[cornerNumber].slice(0, 2), 2); // 0, 1, 2

        if (alignedBit > 2) {
            throw new Error("CubeError: couldn't determine a correct alignment for a corner from alignment bits.");
        }

        // faces of the slot (a face is identified by its center color), and stickers of the piece
        const slotFaces: COLOR[] = [onPosition.colorOne, onPosition.colorTwo, onPosition.colorThree];
        const pieceColors: COLOR[] = [cornerOfInterest.colorOne, cornerOfInterest.colorTwo, cornerOfInterest.colorThree];

        const faceIndex = slotFaces.indexOf(faceGoal);
        if (faceIndex === -1) {
            throw new Error("CubeError: resolveCornerColor called with a face that doesn't touch this corner position.");
        }

        // Face of the slot on which the piece's strongest color sits.
        // RANK values (HIGH=0, MEDIUM=1, LOW=2) match the alignment values, so 0/1/2 maps straight to strongest/medium/lowest face.
        const strongestFaceIndex = slotFaces.findIndex(face => colorToRank(face) === alignedBit);

        // A twisted corner keeps its cyclic color order, so the sticker on faceGoal
        // is the one offset from the strongest sticker by the same amount as the faces.
        return pieceColors[(faceIndex - strongestFaceIndex + 3) % 3];
    }

    private getFace(face: COLOR, up?: COLOR): string {
        return this.getFaceStickers(face, up)
            .map(row => row.map(colorToEmoji).join(' '))
            .join('\n');
    }

    /**
     * Returns a printable string representing the whole cube as a net (see NET_LAYOUT).
     */
    public toString(): string {
        return NET_LAYOUT
            .map(netRow => {
                // each face is 3 lines of text; faces sharing a net row are glued together line by line
                const facesLines = netRow.map(face => face === null ? BLANK_FACE : this.getFace(face).split('\n'));

                const netLines: string[] = [];
                for (let lineIndex = 0; lineIndex < BLANK_FACE.length; lineIndex++) {
                    netLines.push(
                        facesLines.map(faceLines => faceLines[lineIndex]).join(' ').trimEnd()
                    );
                }
                return netLines.join('\n');
            })
            .join('\n');
    }

}

export default Cube;