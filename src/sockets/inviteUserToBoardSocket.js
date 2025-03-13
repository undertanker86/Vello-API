
// Parameters: socket: object
export const inviteUserToBoardSocket = (socket) => {
    // Listen to event from client emit with name: FE_invite_user_to_board  (FE)
    socket.on('FE_invite_user_to_board', (invitation) =>{
      socket.broadcast.emit('BE_invite_user_to_board', invitation)
    })
}