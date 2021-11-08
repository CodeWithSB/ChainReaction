export const Actions = {
	UPDATE_SQUARES: 'Update Board Squares',
	UPDATE_PLAYERS_IN_ROOM: 'Update Players In The Room',
	UPDATE_CURRENT_PLAYER: 'Update Current Player Number'
};

export function reducer(state, action){
	switch(action.type) {
		case Actions.UPDATE_SQUARES: 
			return { ...state, squares: action.payload};
		case Actions.UPDATE_PLAYERS_IN_ROOM: 
			return { ...state, playersInRoom: action.payload};
		case Actions.UPDATE_CURRENT_PLAYER: 
			return { ...state, currentPlayer: action.payload};
		default: return state;
	}
}