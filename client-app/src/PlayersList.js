import React from "react";
import { AnimateSharedLayout } from "framer-motion";
import PlayersDisplay from './PlayersDisplay';

export default function PlayersList({state}) {
	return (
		<div className="space-y-2">
			<p className="text-xs">
				<span className="font-semibold text-blue-400"> Players </span> :
			</p>
			<AnimateSharedLayout>
				<ul className="space-y-1 max-h-32 p-2 bg-gray-500 rounded-lg overflow-auto">
					{state.playersInRoom &&
						state.playersInRoom.length > 0 &&
						state.playersInRoom[state.currentPlayer] &&
						state.playersInRoom.map((playerInRoom) => (
							<PlayersDisplay
								key={playerInRoom.socketID}
								isSelected={
									playerInRoom.socketID ===
									state.playersInRoom[state.currentPlayer].socketID
								}
								player={playerInRoom}
							/>
						))}
				</ul>
			</AnimateSharedLayout>
		</div>
	);
}
