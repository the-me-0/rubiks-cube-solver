const COLOR = {
    WHITE: 5,
    YELLOW: 4,
    RED: 3,
    ORANGE: 2,
    GREEN: 1,
    BLUE: 0
} as const;
type COLOR = (typeof COLOR)[keyof typeof COLOR];

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

const resolveLowestRank = (edge: Edge): keyof Edge  => {
    const colorOneRank = colorToRank(edge.colorOne);
    const colorTwoRank = colorToRank(edge.colorTwo);

    if (colorOneRank > colorTwoRank) return "colorOne";
    if (colorTwoRank > colorOneRank) return "colorTwo";
    // should not happen. edges with two sides of the same rank would mean the rubiks cube is invalid.
    else throw new Error("CubeError: unable to resolve lowest color rank for an edge. Are you feeding an invalid edge ?");
}

const resolveHighestRank = (edge: Edge): keyof Edge  => {
    const colorOneRank = colorToRank(edge.colorOne);
    const colorTwoRank = colorToRank(edge.colorTwo);

    if (colorOneRank < colorTwoRank) return "colorOne";
    if (colorTwoRank < colorOneRank) return "colorTwo";

    // should not happen. edges with two sides of the same rank would mean the rubiks cube is invalid.
    else {
        console.log('colorOne :' + colorOneRank + '/' + edge.colorOne + ' -------- colorTwo :' + colorTwoRank + '/' + edge.colorTwo);
        throw new Error("CubeError: unable to resolve lowest color rank for an edge. Are you feeding an invalid edge ?");
    }
}

const colorToEmoji = (color: COLOR): string => {
    switch (color) {
        case COLOR.WHITE: return "⬜";
        case COLOR.YELLOW: return "🟨";
        case COLOR.RED: return "🟥";
        case COLOR.ORANGE: return "🟧";
        case COLOR.GREEN: return "🟩";
        case COLOR.BLUE: return "🟦";
        default: return "";
    }
}

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

    public static isSolved(): boolean {
        return (this.#instance.edgesState == this.#instance.edgesSolved) && (this.#instance.cornersState == this.#instance.cornersSolved);
    }

    /**
     * Conscructs a solved rubik's cube
     */
    private constructor() {
        this.edgesState = this.edgesSolved;
        this.cornersState = "00111_00110_00101_00100_00011_00010_00001_00000";
    }

    public static get instance(): Cube {
        if (!Cube.#instance) {
            Cube.#instance = new Cube();
        }

        return Cube.#instance;
    }

    private getEdges(): Array<string> {
        return this.edgesState.split('_')
    }

    private getCorners(): Array<string> {
        return this.cornersState.split('_');
    }

    private resolveEdgeCOLOR(edgeNumber: number, faceGoal: COLOR): COLOR {
        // we reverse it to be able to read the positions easily
        const edges = this.getEdges().reverse();

        const edgeOfInterest = Cube.edgeLibrary[parseInt(edges[edgeNumber].slice(-4), 2)];
        const onPosition = Cube.edgeLibrary[edgeNumber];

        const alignedBit = edges[edgeNumber][0] == "1";
    
        if (!alignedBit) {
            // bit is 0, means aligned edge.
            if (onPosition[resolveHighestRank(onPosition)] == faceGoal) {
                // so, we look for the highest rank in the given edge
                return edgeOfInterest[resolveHighestRank(edgeOfInterest)];
            } else {
                // means the face we are looking for is the lowest ranked on this position. We have to return the lowest ranked on the given edge.
                return edgeOfInterest[resolveLowestRank(edgeOfInterest)];
            }
        } else {
            // bit is 1, means unaligned edge.
            // Same as upward, be reverse the result.
            if (onPosition[resolveHighestRank(onPosition)] == faceGoal) {
                return edgeOfInterest[resolveLowestRank(edgeOfInterest)];
            } else {
                return edgeOfInterest[resolveHighestRank(edgeOfInterest)];
            }
        }
    }

    private resolveCornerCOLOR(cornerNumber: number, faceGoal: COLOR): COLOR {
        const corners = this.getCorners().reverse();

        const cornerOfInterest = Cube.cornerLibrary[parseInt(corners[cornerNumber].slice(-3), 2)];
        const onPosition = Cube.cornerLibrary[cornerNumber];

        const alignedBit = parseInt(corners[cornerNumber].slice(0, 2), 2); // 0, 1, 2

        if (alignedBit > 2) {
            throw new Error("CubeError: couldn't determine a correct alignment for a corner from alignment bits.");
        }

        // faces of the slot (a face is identified by its center color), and stickers of the piece
        const slotFaces: COLOR[] = [onPosition.colorOne, onPosition.colorTwo, onPosition.colorThree];
        const pieceCOLORs: COLOR[] = [cornerOfInterest.colorOne, cornerOfInterest.colorTwo, cornerOfInterest.colorThree];

        const faceIndex = slotFaces.indexOf(faceGoal);
        if (faceIndex === -1) {
            throw new Error("CubeError: resolveCornerCOLOR called with a face that doesn't touch this corner position.");
        }

        // Face of the slot on which the piece's strongest color sits.
        // RANK values (HIGH=0, MEDIUM=1, LOW=2) match the alignment values, so 0/1/2 maps straight to strongest/medium/lowest face.
        const strongestFaceIndex = slotFaces.findIndex(face => colorToRank(face) === alignedBit);

        // A twisted corner keeps its cyclic color order, so the sticker on faceGoal
        // is the one offset from the strongest sticker by the same amount as the faces.
        return pieceCOLORs[(faceIndex - strongestFaceIndex + 3) % 3];
    }

    private getFace(color: COLOR): string {
        /**
         * IMPLEMENT ROTATION ARGUMENT.
         * Face in itself has no real sense. add "anchorCOLOR" argument, which would be the color one face above, so we know the face is rotated the right way.
         */

        /**
         * IMPLEMENT CORNERS
         */

        let paintedFace = "";

        switch (color) {
            case COLOR.WHITE:
                paintedFace += "          ";
                paintedFace += colorToEmoji(this.resolveCornerCOLOR(2, COLOR.WHITE)) + ' ';
                paintedFace += colorToEmoji(this.resolveEdgeCOLOR(3, COLOR.WHITE)) + ' ';
                paintedFace += colorToEmoji(this.resolveCornerCOLOR(3, COLOR.WHITE));

                paintedFace += "\n          ";
                paintedFace += colorToEmoji(this.resolveEdgeCOLOR(2, COLOR.WHITE)) + ' ⬜ ';
                paintedFace += colorToEmoji(this.resolveEdgeCOLOR(0, COLOR.WHITE));
            
                paintedFace += "\n          ";
                paintedFace += colorToEmoji(this.resolveCornerCOLOR(1, COLOR.WHITE)) + ' ';
                paintedFace += colorToEmoji(this.resolveEdgeCOLOR(1, COLOR.WHITE)) + ' ';
                paintedFace += colorToEmoji(this.resolveCornerCOLOR(0, COLOR.WHITE)) + "\n";

                break;
            case COLOR.ORANGE:
                // get positions 1, 4, 9, 5
                break;
            case COLOR.BLUE:
                // get positions 2, 5, 10, 6
                break;
            case COLOR.RED:
                // get positions 3, 6, 11, 7
                break;
            case COLOR.GREEN:
                // get positions 0, 4, 8, 7
                break;
            case COLOR.YELLOW:
                // get positions 8, 9, 10, 11
                break;
            default: throw new Error("CubeError: getFace called with invalid color.");
        }

        // return something like
        /**
         *  '🟥 🟥 🟥\r🟥 🟥 🟥\r🟥 🟥 🟥'
         */

        return paintedFace;

    }

    /**
     * Returns a printable string meant to be sent in the console, representing the cube's current state
     */
    public toString() {

        console.log(this.getFace(COLOR.WHITE));

        // console.log('          🟥 🟥 🟥');
        // console.log('          🟥 🟥 🟥');
        // console.log('          🟥 🟥 🟥');
        console.log('🟦 🟦 🟦 ⬜ ⬜ ⬜ 🟩 🟩 🟩')
        console.log('🟦 🟦 🟦 ⬜ ⬜ ⬜ 🟩 🟩 🟩')
        console.log('🟦 🟦 🟦 ⬜ ⬜ ⬜ 🟩 🟩 🟩')
        console.log('          🟧 🟧 🟧');
        console.log('          🟧 🟧 🟧');
        console.log('          🟧 🟧 🟧');
        console.log('          🟨 🟨 🟨');
        console.log('          🟨 🟨 🟨');
        console.log('          🟨 🟨 🟨');
    }

}

export default Cube;
