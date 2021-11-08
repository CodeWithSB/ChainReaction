import { useState, useEffect, useReducer, useRef } from "react";
import socketIOClient from "socket.io-client";
import { toast } from 'react-toastify';
import {Actions, reducer} from './GameReducer';
import PlayersList from "./PlayersList";
import PlayerDetails from "./PlayerDetails";
import Board from "./Board";

const ENDPOINT = "http://localhost:4002";

const intializeBoard = (rows, columns) => {
	let board = new Array(rows);
	for (let i = 0; i < rows; i++) {
		board[i] = new Array(columns).fill({
			cellValue: 0,
			cellOwner: undefined,
			maxAllowedValue: -1,
			cellColor: undefined
		});
	}

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			board[i][j] = {
				cellValue: 0,
				cellOwner: undefined,
				maxAllowedValue: calculateMaxBalls(board, i, j),
				cellColor: undefined
			};
		}
	}
	return board;
};

const calculateMaxBalls = (board, currentRow, currentColumn) => {
	let maxBalls = 4;
	if (board[currentRow - 1] === undefined) {
		maxBalls--;
	}
	if (board[currentRow][currentColumn + 1] === undefined) {
		maxBalls--;
	}
	if (board[currentRow + 1] === undefined) {
		maxBalls--;
	}
	if (board[currentRow][currentColumn - 1] === undefined) {
		maxBalls--;
	}
	return maxBalls;
};


let socket;
export default function Game({ startType, gameName, newPlayer, rows, columns, setActiveStep }) {
	const [state, dispatch] = useReducer(reducer, { squares: intializeBoard(rows, columns), playersInRoom: [], currentPlayer: 0});
	const stateRef = useRef();
	stateRef.current = state;
	
    const [player, setPlayer] = useState(undefined);
	const [boardWinner, setBoardWinner] = useState(undefined);
	const [numOfRows, setNumOfRows] = useState(rows);
	const [numOfCols, setNumOfCols] = useState(columns); 

	useEffect(() => {
		socket = socketIOClient(ENDPOINT);
		socket.emit("join-room", startType, gameName, newPlayer, rows, columns);

		socket.on("board-setup", (roomDetails) => {
			dispatch({type: Actions.UPDATE_SQUARES, payload: intializeBoard(roomDetails.numberOfRows, roomDetails.numberOfColumns)});
			setNumOfRows(roomDetails.numberOfRows);
			setNumOfCols(roomDetails.numberOfColumns);
		});

		socket.on("player-joined", (playerJoined) => {
			setPlayer(playerJoined);
			console.log('color', playerJoined);
		});

		socket.on("room-players", (players) => {
			dispatch({type: Actions.UPDATE_PLAYERS_IN_ROOM, payload: players});
		});

		socket.on("receive-msg", (receivedSquares, receivingCurrentPlayer) => {
			dispatch({type: Actions.UPDATE_SQUARES, payload: receivedSquares});
			dispatch({type:Actions.UPDATE_CURRENT_PLAYER, payload:receivingCurrentPlayer});
		});

		socket.on('alert', (msg)=>{
			toast.error(msg);
			setActiveStep(0);
		})

		socket.on("player-joined-notification", (playerJoined) => {
			toast.success(`New Player Joined: ${playerJoined}`);
		});
		
		socket.on("player-disconnected", (playersLeftInRoom, playerDisconnected) => {
			reassignCellOwners(playerDisconnected);
			dispatch({type: Actions.UPDATE_PLAYERS_IN_ROOM, payload: playersLeftInRoom});
			if(stateRef.current.playersInRoom[stateRef.current.currentPlayer] === undefined){
				if(stateRef.current.currentPlayer === stateRef.current.playersInRoom.length){
					dispatch({type:Actions.UPDATE_CURRENT_PLAYER, payload:0});
				}
			}
			toast.error(`Player Disconnected: ${playerDisconnected.playerName}`);
			checkWinner(); 
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const checkForSplit = async (i, j) => {
		const squaresArr = stateRef.current.squares.slice();
		if (squaresArr[i][j].cellValue >= squaresArr[i][j].maxAllowedValue) {
			squaresArr[i][j].cellValue = 0;
			if (squaresArr[i - 1] !== undefined) {
				squaresArr[i - 1][j].cellValue++;
				squaresArr[i - 1][j].cellOwner = squaresArr[i][j].cellOwner;
				squaresArr[i - 1][j].cellColor = squaresArr[i][j].cellColor;
			}
			if (squaresArr[i][j + 1] !== undefined) {
				squaresArr[i][j + 1].cellValue++;
				squaresArr[i][j + 1].cellOwner = squaresArr[i][j].cellOwner;
				squaresArr[i][j + 1].cellColor = squaresArr[i][j].cellColor;
			}
			if (squaresArr[i + 1] !== undefined) {
				squaresArr[i + 1][j].cellValue++;
				squaresArr[i + 1][j].cellOwner = squaresArr[i][j].cellOwner;
				squaresArr[i + 1][j].cellColor = squaresArr[i][j].cellColor;
			}
			if (squaresArr[i][j - 1] !== undefined) {
				squaresArr[i][j - 1].cellValue++;
				squaresArr[i][j - 1].cellOwner = squaresArr[i][j].cellOwner;
				squaresArr[i][j - 1].cellColor = squaresArr[i][j].cellColor;
			}
			squaresArr[i][j].cellOwner = undefined;
			dispatch({type: Actions.UPDATE_SQUARES, payload: squaresArr});
			await sleep(300);
			checkWinner();
			checkLoser();
		}
	};

	const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	const getNextPlayer = (currentPlayer) => {
		if(currentPlayer === state.playersInRoom.length-1){
			return 0;
		}
		else{
			return currentPlayer+1;
		}
	}

	const handleClick = async (i, j, player) => {
		const squaresArr = stateRef.current.squares.slice();
		if (
			squaresArr[i][j].cellOwner === state.currentPlayer ||
			squaresArr[i][j].cellOwner === undefined
		) {
			squaresArr[i][j].cellValue++;
			squaresArr[i][j].cellOwner = state.currentPlayer;
			squaresArr[i][j].cellColor = state.playersInRoom[state.currentPlayer].playerColor;
			console.log('color sending', state.playersInRoom[state.currentPlayer].playerColor);
			dispatch({type: Actions.UPDATE_SQUARES, payload: squaresArr});
			const nextPlayer = getNextPlayer(state.currentPlayer);
			dispatch({type:Actions.UPDATE_CURRENT_PLAYER, payload:nextPlayer});
			await sleep(300); // make ball stay before animating
			socket.emit("send-msg", gameName, stateRef.current.squares, nextPlayer);
		}
	};

	const checkWinner = () => {
		console.log(stateRef.current.squares);
		let winner = undefined;
		for (let i = 0; i < numOfRows; i++) {
			for (let j = 0; j < numOfCols; j++) {
				if (stateRef.current.squares[i][j].cellOwner !== undefined && winner === undefined) {
					winner = stateRef.current.squares[i][j].cellOwner;
				}
				if (
					stateRef.current.squares[i][j].cellOwner !== undefined &&
					winner !== undefined &&
					winner !== stateRef.current.squares[i][j].cellOwner
				) {
					return;
				}
			}
		}
		setBoardWinner(winner);
	};

	const checkLoser = () => {
		for (let i = 0; i < numOfRows; i++) {
			for (let j = 0; j < numOfCols; j++) {
				if (
					stateRef.current.squares[i][j].cellOwner !== undefined &&
					player.socketID === stateRef.current.playersInRoom[stateRef.current.squares[i][j].cellOwner].socketID
				) {
					return;
				}
			}
		}
		setBoardWinner(-1);
		socket.disconnect();
	};

	const reassignCellOwners = (playerDisconnected) =>{
		const squaresArr = stateRef.current.squares.slice();
		const indexOfDisconnectingPlayer = stateRef.current.playersInRoom.findIndex(pl => pl.socketID === playerDisconnected.socketID);
		let playersOwningCells = new Array(stateRef.current.playersInRoom.length).fill(0);
		for (let i = 0; i < numOfRows; i++) {
			for (let j = 0; j < numOfCols; j++) {
				playersOwningCells[squaresArr[i][j].cellOwner]++;
			}
		}
		let indexOfMax = playersOwningCells.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
		console.log('DIST', playerDisconnected, stateRef.current.playersInRoom, indexOfMax, playersOwningCells, squaresArr, indexOfDisconnectingPlayer);
		if(indexOfDisconnectingPlayer === indexOfMax){
			playersOwningCells[indexOfMax] = 0;
			indexOfMax = playersOwningCells.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
		}
		// Now indexOfMax contains index of next Max balls
		for (let i = 0; i < numOfRows; i++) {
			for (let j = 0; j < numOfCols; j++) {
				if(squaresArr[i][j].cellOwner !== undefined && stateRef.current.playersInRoom[squaresArr[i][j].cellOwner].socketID === playerDisconnected.socketID){
					squaresArr[i][j].cellOwner = indexOfMax;
					squaresArr[i][j].cellColor = stateRef.current.playersInRoom[indexOfMax].playerColor;
				}
				if(squaresArr[i][j].cellOwner !== undefined && squaresArr[i][j].cellOwner>indexOfDisconnectingPlayer){
					squaresArr[i][j].cellOwner--;
				}
			}
		}
		//setSquares(squaresArr);
		dispatch({type: Actions.UPDATE_SQUARES, payload: squaresArr});
	}

	return (
		<div className="w-full p-6 text-blue-700 flex">
			<div className="w-full space-y-3">
				{
					(player !== undefined) && 
					<div className="bg-gray-600 space-y-2 rounded-lg p-6 text-gray-50 flex flex-col lg:flex-row lg:justify-between lg:space-y-0">
						<PlayerDetails gameName={gameName} player={player}/>						
						<PlayersList state={state}/>
					</div>
				}
				{
					state.playersInRoom !== undefined && boardWinner !== undefined && 
					<div className={`${state.playersInRoom[boardWinner] !==undefined && state.playersInRoom[boardWinner].socketID === player.socketID? 'bg-green-500': 'bg-red-500'} rounded-lg p-6 text-gray-50`}>
						<p className="text-center font-bold blink"> {boardWinner !==-1 && state.playersInRoom[boardWinner] !== undefined && state.playersInRoom[boardWinner].socketID === player.socketID? 'You Won. Congratulations!!!': 'Sorry. You lost :('} </p>
					</div>
				}
				{ 
					boardWinner === undefined && (state.playersInRoom.length > 1) &&
					<h3 className="uppercase text-center font-bold blink">{player && state.playersInRoom[state.currentPlayer] && player.socketID === state.playersInRoom[state.currentPlayer].socketID? "Its your turn": "Its Opponent's turn"}</h3>
				}
				{ 
					(boardWinner === undefined) && (state.playersInRoom.length < 2) &&
					<h3 className="text-center font-bold">Waiting for opponent(s)<span className="blink">...</span></h3>
				}
				<Board state={state} squares={stateRef.current.squares} player={player} boardWinner={boardWinner} numOfCols={numOfCols} numOfRows={numOfRows} handleClick={handleClick} checkForSplit={checkForSplit}/>
				
			</div>
		</div>
	);
}
