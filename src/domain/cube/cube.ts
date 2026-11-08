const Color = {
    White: 5,
    Yellow: 4,
    Red: 3,
    Orange: 2,
    Green: 1,
    Blue: 0
} as const;
type Color = (typeof Color)[keyof typeof Color];

/**
 *      PRIORITY
 * HIGH     - WHITE/YELLOW
 * MEDIUM   - RED/ORANGE
 * LOW      - GREEN/BLUE
 */

// 1 OBJET CUBE
// propriété "arete" entier 64 bits, 5 bits par arete. 4 pour id, sa position est déterminée par son emplacement dans l'entier binaire.
//   le dernier bit est un bit de positionnement : si sur cette edge, la couleur la plus importante est du même côté que si on la remplaçait par la bonne edge
// veut dire que l'on doit pouvoir faire "numero 0~11 = 2 couleurs"

type Edge = {
    colorOne: Color;
    colorTwo: Color;
};
type Corner = Edge & { colorThree: Color };

class Cube {
    static #instance: Cube;
    private edgesState: string;
    private cornersState: string;

    public static edgeToColors: Array<Edge> = [
        { colorOne: Color.White, colorTwo: Color.Green },
        { colorOne: Color.White, colorTwo: Color.Orange },
        { colorOne: Color.White, colorTwo: Color.Blue },
        { colorOne: Color.White, colorTwo: Color.Red },
        { colorOne: Color.Orange, colorTwo: Color.Green },
        { colorOne: Color.Blue, colorTwo: Color.Orange },
        { colorOne: Color.Red, colorTwo: Color.Blue },
        { colorOne: Color.Green, colorTwo: Color.Red },
        { colorOne: Color.Yellow, colorTwo: Color.Green },
        { colorOne: Color.Yellow, colorTwo: Color.Orange },
        { colorOne: Color.Yellow, colorTwo: Color.Blue },
        { colorOne: Color.Yellow, colorTwo: Color.Red }
    ];
    public static cornerToColors: Array<Corner> = [
        { colorOne: Color.White, colorTwo: Color.Green, colorThree: Color.Orange },
        { colorOne: Color.White, colorTwo: Color.Orange, colorThree: Color.Blue },
        { colorOne: Color.White, colorTwo: Color.Blue, colorThree: Color.Red },
        { colorOne: Color.White, colorTwo: Color.Red, colorThree: Color.Green },
        { colorOne: Color.Yellow, colorTwo: Color.Green, colorThree: Color.Orange },
        { colorOne: Color.Yellow, colorTwo: Color.Orange, colorThree: Color.Blue },
        { colorOne: Color.Yellow, colorTwo: Color.Blue, colorThree: Color.Red },
        { colorOne: Color.Yellow, colorTwo: Color.Red, colorThree: Color.Green }
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
        this.cornersState = this.cornersSolved;
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

    private getFace(color: Color): string {
        const edges = this.getEdges();

        switch (color) {
            case Color.White:
                // get 4 last items of the array, which are positions 0 to 3
                break;
            case Color.Orange:
                // get positions 1, 4, 9, 5
                break;
            case Color.Blue:
                // get positions 2, 5, 10, 6
                break;
            case Color.Red:
                // get positions 3, 6, 11, 7
                break;
            case Color.Green:
                // get positions 0, 4, 8, 7
                break;
            case Color.Yellow:
                // get positions 8, 9, 10, 11
                break;
            default: throw new Error("CubeError: getFace called with invalid color.");
        }

        // return something like
        /**
         *  '🟥 🟥 🟥\r🟥 🟥 🟥\r🟥 🟥 🟥'
         */

    }

    /**
     * Returns a printable string meant to be sent in the console, representing the cube's current state
     */
    public toString() {


        console.log('          🟥 🟥 🟥');
        console.log('          🟥 🟥 🟥');
        console.log('          🟥 🟥 🟥');
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
