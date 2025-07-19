import { spawn } from 'child_process';
import { Chess, Move } from 'chess.js';

export class Analyzer {
    private readonly chess: Chess;
    private readonly stockfishpath: string
    private readonly engine: any
    private readonly depth: number

    constructor() {
        this.chess = new Chess();
        this.stockfishpath = process.env.STOCKFISH_PATH as string;
        this.engine = spawn(this.stockfishpath)
        this.depth = 12
    }

    private async analyzePosition(fen: string): Promise<{ eval: number | null, bestMove: string | null }> {
        return new Promise((resolve) => {
            let lastEval: number | null = null;
            let bestMove: string | null = null;
            let resolved = false;

            this.engine.stdout.on('data', (data:any) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('info depth')) {
                        const cpMatch = line.match(/score cp (-?\d+)/);
                        if (cpMatch) lastEval = parseInt(cpMatch[1], 10);
                    }
                    if (line.startsWith('bestmove')) {
                        bestMove = line.split(' ')[1];
                        if (!resolved) {
                            resolved = true;
                            this.engine.kill();
                            resolve({ eval: lastEval, bestMove });
                        }
                    }
                }
            });
            setTimeout(() => {
                if (!resolved) {
                    this.engine.kill();
                    resolve({ eval: lastEval, bestMove });
                }
            }, 6000);
            this.engine.stdin.write('uci\n');
            this.engine.stdin.write(`position fen ${fen}\n`);
            this.engine.stdin.write(`go depth ${this.depth}\n`);
        });
    }

    private async getMoveLabel(loss: number, isTopMove: boolean, isBrilliant = false) {
        if (isTopMove) {
            return isBrilliant ? "Brilliant" : "Best";
        }
        if (loss <= 50) return "Excellent";
        if (loss <= 100) return "Good";
        if (loss <= 200) return "Inaccuracy";
        if (loss <= 500) return "Mistake";
        return "Blunder";
    }

    public async analyzePGNGame(pgnString: string) {
        if (!this.stockfishpath) {
            console.log("Please provide Stockfish Path")
        }
        this.chess.loadPgn(pgnString.trim());
        const moves = this.chess.history({ verbose: true }) as Move[];
        this.chess.reset();
        let fenBefore = this.chess.fen();
        let moveNum = 1;

        let accuracyWhite = 0;
        let accuracyBlack = 0;
        let countWhite = 0;
        let countBlack = 0;

        const finalReviewArray: any[] = [];

        for (const move of moves) {
            const justMoved = this.chess.turn() === 'b' ? 'w' : 'b';

            // Analyze position before the move
            const { eval: evalBefore, bestMove } = await this.analyzePosition(fenBefore);

            // Make the move
            this.chess.move(move);
            const fenAfter = this.chess.fen();

            // Analyze position after the move
            const { eval: evalAfter } = await this.analyzePosition(fenAfter);

            // Calculate centipawn loss (White's or Black's move)
            let loss: number | null = null;
            let moveAccuracy: number | null = null;
            let label: string | null = null;

            if (evalBefore !== null && evalAfter !== null) {
                loss = (evalBefore - evalAfter) * (this.chess.turn() === 'b' ? 1 : -1);
                loss = Math.max(0, loss);
                moveAccuracy = loss === 0 ? 100 : Math.max(0, 100 - Math.log(loss + 1) * 13.8);

                // Move matching engine
                const fromTo = move.from + move.to + (move.promotion || "");
                const isTopMove = bestMove === fromTo;

                // Simple "Brilliant" detection (optional): best move and positive swing
                const isBrilliant = isTopMove && (evalAfter - evalBefore > 150);

                label = await this.getMoveLabel(loss, isTopMove, isBrilliant);

                // Update per-color accuracy
                if (justMoved === 'w') {
                    accuracyWhite += moveAccuracy;
                    countWhite++;
                } else {
                    accuracyBlack += moveAccuracy;
                    countBlack++;
                }
            }

            finalReviewArray.push({
                move: moveNum,
                color: justMoved === 'w' ? 'White' : 'Black',
                san: move.san,
                bestMove,
                evalBefore,
                evalAfter,
                centipawnLoss: loss,
                moveAccuracy: moveAccuracy !== null ? moveAccuracy.toFixed(2) : null,
                label,
            });

            fenBefore = fenAfter;
            moveNum++;
        }

        // Output results
        const avgWhite = countWhite ? (accuracyWhite / countWhite).toFixed(2) : 'n/a';
        const avgBlack = countBlack ? (accuracyBlack / countBlack).toFixed(2) : 'n/a';
        return {
            accuracyWhite: avgWhite,
            accuracyBlack: avgBlack,
            finalReviewArray
        }
    }
}