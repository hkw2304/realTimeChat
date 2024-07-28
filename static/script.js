
    const socket = io('http://localhost:3000/chat');
    const roomSocket = io('http://localhost:3000/room');  // 채팅방용 네임스페이스
    
    const nickName = prompt('닉네임을 설정하시오');

    let currentRoom = '';

    function sendMessage(){

        if(currentRoom === ''){
            alert('방을 선택해주세요.');
            return;
        }

        const message = $('#message').val();
        const data = {message, nickName, room: currentRoom};
        // 서버로 데이터를 넘겨준다.
        $('#chat').append(`<div>나 : ${message}</div>`);
        roomSocket.emit('message', data);
        return false;
    }

    function createRoom() {
        const room = prompt('생성할 방의 이름을 입력하세요');
        roomSocket.emit('createRoom', {room, nickName});
    }

    function joinRoom(room) {
        roomSocket.emit('joinRoom', {room, nickName, toLeaveRoom: currentRoom});
        $('#chat').html(''); // 채팅방 이동 시 기존 메시지 삭제
        currentRoom = room;
        $('#currentChatRoom').html('');
        $('#currentChatRoom').append(`<h2>${currentRoom}</h2>`);
    }

    
    socket.on('notice', (data) => {
        $('#notice').append(`<div>${data.message}</div>`);
    })

    roomSocket.on('rooms', (data) => {
        console.log(data);
        $('#rooms').empty();
        data.forEach((room) => {
            $('#rooms').append(`<li>${room} <button onclick="joinRoom('${room}')">join</button></li>`)
        })
    })

    roomSocket.on('message', (data) => {
        console.log(data);
        $('#chat').append(`<div>${data.message}</div>`)
    })

    //서버로부터 연결을 받는다.
    socket.on('connect', () => {
        console.log('connected');
    });
    //서버로부터 메시지를 받는다.
    socket.on('message', (message) => {
        $('#chat').append(`<div>${message}</div>`)
    });
