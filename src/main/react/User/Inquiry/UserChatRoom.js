import ReactDOM from "react-dom/client";
import React, {useEffect, useState, useRef} from "react";
import './UserChatRoom.css';

function UserChatRoom() {
    const [message, setMessage] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const websocket = useRef(null);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        console.log("WebSocket 연결 시도...");
        websocket.current = new WebSocket('ws://localhost:8585/ws/chat');

        websocket.current.onopen = () => {
            console.log("WebSocket이 성공적으로 연결되었습니다!");
        };

        websocket.current.onmessage = (event) => {
            console.log("받은 메시지:", event.data);
            const received = JSON.parse(event.data);

            // UserChatRoom의 경우
            if (received.senderId === '123@naver.com' || received.recipientId === '123@naver.com') {
                setMessage(prev => [...prev, received]);
            }

            // StoreChatRoom의 경우
            if (received.senderId === '1' || received.recipientId === '1') {
                setMessage(prev => [...prev, received]);
            }
        };

        websocket.current.onerror = (error) => {
            console.error("WebSocket 에러:", error);
        };

        websocket.current.onclose = () => {
            console.log("WebSocket 연결이 종료되었습니다");
        };

        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, []);

    useEffect(() => {
        console.log("현재 메시지 목록:", message);
    }, [message]);

    // 메시지 전송 함수
    const sendMessage = (e) => {
        e.preventDefault();
        if (!websocket.current || websocket.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket이 연결되지 않았습니다!");
            return;
        }

        if (messageInput.trim()) {
            const message = {
                sender_type: 'USER',
                senderId: '123@naver.com',
                recipientId: '1',
                chatMessage: messageInput.trim()
            };

            console.log("메시지 전송 시도:", message);
            websocket.current.send(JSON.stringify(message));
            console.log("메시지가 전송되었습니다!");
            setMessageInput("");
        }
    };

    return (
        <div>
            <div className="user-chat-room-container">
                <div className="user-top-nav">
                    <div className="shop-name">(임시)우리케이크-고객</div>
                </div>

                <div className="chat-box">
                    {message.map((msg, index) => (
                        <div key={index}
                             className={`message ${msg.senderId === '123@naver.com' ? 'sender' : 'receiver'}`}>
                            <div className="bubble">
                                {msg.chatMessage}
                            </div>
                            <div className="timestamp">
                                {new Date().toLocaleTimeString('ko-KR', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="input-box">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Message here..."
                    />
                    <button onClick={sendMessage}>
                        <i className="bi bi-arrow-up-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserChatRoom/>
);