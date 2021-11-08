import React from "react";

export default function PlayerDetails({gameName, player}) {
	return (
		<div className="space-y-2">
			<p className="text-xs">
				<span className="font-semibold text-blue-400"> Game Name: </span>
				{gameName}
			</p>
			<p className="font-semibold text-blue-400 text-xs"> You are: </p>
			<div className="flex justify-items-start items-center p-2 bg-gray-500 rounded-lg">
				<img
					className="w-6 h-6 rounded-full"
					src={`https://avatars.dicebear.com/api/initials/${player.playerName}.svg?fontSize=40&backgroundColor=${player.playerColor}`}
					alt="Player Logo"
				/>
				<p className="mx-1 font-semibold text-xs"> {player.playerName} </p>
			</div>
		</div>
	);
}
