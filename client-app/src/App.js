import './App.css';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Game from "./Game";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const cardHorizontalMovement = {
  enter: (direction) => {
      return {
          x: direction > 0 ? 1000 : -1000,
          opacity: 0
      };
  },
  center: {
      zIndex: 1,
      x: 0,
      opacity: 1
  },
  exit: (direction) => {
      return {
          zIndex: 0,
          x: direction < 0 ? 1000 : -1000,
          opacity: 0
      };
  }
};

function App() {
  const [direction] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [game, setGame] = useState('');
  const [playerToJoin, setPlayerToJoin] = useState('');
  const [gameStartType, setGameStartType] = useState('');
  const [row, setRow] = useState(8);
  const [column, setColumn] = useState(8);

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
        case 0:
            return (
              <div className="w-full h-full flex p-12">
                <div className="m-auto grid grid-cols-1 gap-2">
                  
                  <h3 className="text-xs font-semibold"> Do you want to start a new game?</h3>
                  <button 
                    className="w-32 text-xs shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                    onClick={()=> {setGameStartType('NEW_GAME'); setActiveStep(2); }}> 
                    New Game 
                  </button>
                  <br/>
                  <h3 className="text-xs font-semibold"> Do you have a game name to join?</h3>
                  <button 
                    className="w-32 text-xs shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                    onClick={()=> { setGameStartType('JOIN_GAME'); setActiveStep(1);}}>  
                    Join Game 
                  </button>
                </div>
              </div>
            );
        case 1: 
            return (
              <div className="w-full h-full flex p-12">
                <div className="m-auto flex flex-row gap-2">
                  <input type="text" className="rounded-full px-4 outline-none" placeholder="Joining Game Name" defaultValue={game} onInput={(ev)=> setGame(ev.target.value)}/>
                  <button 
                    className="shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                    onClick={()=> setActiveStep(4)}> 
                    Next
                  </button>
                </div>
              </div>
            );
        case 2: 
            return (
              <div className="w-full h-full flex p-12">
                <div className="m-auto flex flex-row gap-2">
                  <input type="text" className="rounded-full px-4 outline-none" placeholder="New Game Name" defaultValue={game} onInput={(ev)=> setGame(ev.target.value)}/>
                  <button 
                    className="shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                    onClick={()=> setActiveStep(activeStep+1)}> 
                    Next
                  </button>
                </div>
              </div>
            );
        case 3:
            return (
              <div className="w-full h-full flex p-12">
                <div className="m-auto flex flex-col gap-2 items-start">
                  <h3 className="text-lg font-semibold">Board Size: </h3>
                  <div className="m-auto flex flex-row gap-2 items-center">
                    <input type="number" className="w-20 rounded-full p-2 outline-none" placeholder="Rows" defaultValue={row} onInput={(ev)=> setRow(Number(ev.target.value))}/>
                    <p className="font-semibold"> X </p>
                    <input type="number" className="w-20 rounded-full p-2 outline-none" placeholder="Columns" defaultValue={column} onInput={(ev)=> setColumn(Number(ev.target.value))}/>
                    <button 
                      className="shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                      onClick={()=> setActiveStep(activeStep+1)}> 
                      Next
                    </button>
                  </div>
                </div>
              </div>
            );
        case 4: 
            return (
              <div className="w-full h-full flex p-12">
                <div className="m-auto space-y-2">
                  <h3 className="text-center">You are about to play: <span className="text-blue-500">{game}</span> </h3>
                  <div className="flex flex-row gap-2">
                    <input type="text" className="rounded-full px-4 outline-none" placeholder="Player Name" defaultValue={playerToJoin} onInput={(ev)=> setPlayerToJoin(ev.target.value)}/>
                    <button 
                      className="shadow-2xl bg-blue-500 text-gray-50 py-2 px-6 rounded-full hover:opacity-80"
                      onClick={()=> setActiveStep(activeStep+1)}> 
                      {gameStartType === 'NEW_GAME'? 'Start': 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            );
        case 5:
          return (
            <Game startType={gameStartType} rows={row} columns={column} gameName={game} newPlayer={playerToJoin} setActiveStep={setActiveStep} />
          );
        default:
              return 'Unknown stepIndex';
      }
  }

  return (
    <div className="lg:min-h-screen grid grid-cols-1 md:grid-cols-2">
      <h1 className="heading z-10 flex items-center justify-center p-6 text-4xl bg-blue-700 text-gray-50 font-bold md:text-7xl lg:text-9xl md:min-h-screen">Chain Reaction</h1>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          className='z-0'
          key={activeStep}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          variants={cardHorizontalMovement}
          transition={{
              duration: 1,
              x: { type: "spring", stiffness: 500, damping: 30 },
              opacity: { duration: 1 }
          }}>
          {getStepContent(activeStep)}
        </motion.div>
      </AnimatePresence>
      <ToastContainer 
        theme="colored" 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false} />
    </div>
  );
}

export default App;
