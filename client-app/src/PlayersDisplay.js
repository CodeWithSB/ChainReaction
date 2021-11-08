import React from 'react'
import { motion } from "framer-motion";

const spring = {
	type: "spring",
	stiffness: 500,
	damping: 30
  };

export default function PlayersDisplay({ player, isSelected }) {
    return (
        <li className='relative rounded-lg text-white'>
            <div className="rounded-lg p-2 flex justify-items-start items-center">
                <img className="w-6 h-6 rounded-full" src={`https://avatars.dicebear.com/api/initials/${ player.playerName }.svg?fontSize=40&backgroundColor=${player.playerColor}`} alt="Player Logo" />
                <p className='mx-1 text-xs'> {player.playerName} </p>
            </div>
            {
                isSelected && (
                <motion.div 		
                className="outline rounded-lg"										
                layoutId="outline"
                initial={false}
                animate={{ borderColor: 'dodgerblue' }}
                transition={spring}/>)
            }
        </li>
    )
}
