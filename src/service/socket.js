import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_SOME_SERVER);

socket.getPing = (callback) => {
    const startTime = Date.now();
    socket.emit('ping');
    socket.once('pong', () => {
        let pingTime = Date.now() - startTime;
        callback(pingTime);
    });
};
export default socket;
