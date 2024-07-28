import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

// 웹소켓 서버 설정 데코레이터
// 내부적으로 socket.io서버를 생성한다.

/* 
네임스페이스

socket.io를 사용하면 서버와 클라간의 실시간 통신이 가능해지는데
데이터를 모든 socket에서 받게되서 낭비가 있다.
그래서 네임스페이스를 지정해 같은 소켓끼리만 통신하게 해준다.

*/
@WebSocketGateway({namespace: 'chat'})
export class ChatGateway{
     
    @WebSocketServer() server : Server;

    // message 이벤트 구독, 클라에서 message 이벤트가 올 경우 작동
    @SubscribeMessage('message')
    handleMessage(socket: Socket, data: any): void {
        // emit : 클라 전체에 message이벤트로 두 번째 인수를 보낸다.
        const {message, nickName} = data;
        // 데이터를 클라로 보낸다.
        // broadcast : 전송 요청한 클라를 제외하고 다른 클라에게 데이터를 전송해준다.
        socket.broadcast.emit('message', `${nickName}: ${message}`);
    }
}

@WebSocketGateway({namespace: 'room'})
export class RoomGateway{

    constructor(private readonly chatGateway : ChatGateway) {}

    rooms = [];

    @WebSocketServer() server : Server;

    @SubscribeMessage('message')
    handleMessageToRoom(socket: Socket, data){
        const {nickName, room, message} = data;
        console.log(data);
        socket.broadcast.to(room).emit('message', {
            message: `${nickName} : ${message}`,
        });
    }

    @SubscribeMessage('createRoom')
    handleMessage(@MessageBody() data) {
        const {nickName, room } = data;

        this.chatGateway.server.emit('notice', {
            message: `${nickName}님이 ${room}을 만들었습니다.`,
        });

        this.rooms.push(room);
        this.server.emit('rooms', this.rooms);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(socket: Socket, data){
        const {nickName, room, toLeaveRoom} = data;
        if(toLeaveRoom === ''){
        socket.leave(toLeaveRoom);
        this.chatGateway.server.emit('notice', {
            message:`${nickName}님이 ${room}에 입장했습니다.`,
        });``
        socket.join(room);
        }
        else{
            socket.leave(toLeaveRoom);
        this.chatGateway.server.emit('notice', {
            message:`${nickName}님이 ${toLeaveRoom}을 나갔습니다.<br>${nickName}님이 ${room}에 입장했습니다.`,
        });
        socket.join(room);
        }
        }
}

