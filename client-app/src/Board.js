import React from 'react'
import Square from "./Square";

export default function Board({state, squares, player, boardWinner, numOfCols, numOfRows, handleClick, checkForSplit}) {
    return (
        <div className="max-w-full max-h-72 p-1 flex overflow-auto">
            <table className={`h-full max-w-full mx-auto ${( (boardWinner !== undefined) || (state.playersInRoom.length < 2) || (player !== undefined && state.playersInRoom[state.currentPlayer] && player.socketID !== state.playersInRoom[state.currentPlayer].socketID))? " disable-board" : ""}`}>
                <tbody>
                    { squares!==undefined && [...Array(numOfRows).keys()].map((r) => (
                        <tr key={r}>
                            {[...Array(numOfCols).keys()].map((c) => (
                                squares[r] && <td key={c}>
                                    {squares[r][c] && <Square
                                        cell={squares[r][c]}
                                        squareClick={() =>
                                            handleClick(r, c, squares[r][c].cellOwner)
                                        }
                                        checkForSplit={() =>
                                            checkForSplit(r, c)
                                        }
                                    />}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
