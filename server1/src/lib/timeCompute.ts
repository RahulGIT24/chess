export function computeLeftTime(lastMoveTime: number, player1Color: string, currentColor: string, player1Time: number, player2Time: number) {
    const currentTimeinMil = Date.now()
    const diff = currentTimeinMil - lastMoveTime
    if (currentColor === player1Color) {
        player1Time = Math.max(0, player1Time - diff);
    } else {
        player2Time = Math.max(0, player2Time - diff);
    }
    return {p1:player1Time,p2:player2Time}
}