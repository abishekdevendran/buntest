'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocketDemo = () => {
	//Public API that will echo messages sent to it back to the client
	const [socketUrl, setSocketUrl] = useState(
		'ws:'+window.location.host + '/backend/ws',
	);
	const [messageHistory, setMessageHistory] = useState<any>([]);

	const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

	useEffect(() => {
		if (lastMessage !== null) {
			setMessageHistory((prev: any) => prev.concat(lastMessage));
		}
	}, [lastMessage, setMessageHistory]);

	const handleClickSendMessage = useCallback(
		() => sendMessage('Hello'),
		[sendMessage],
	);

	const connectionStatus = {
		[ReadyState.CONNECTING]: 'Connecting',
		[ReadyState.OPEN]: 'Open',
		[ReadyState.CLOSING]: 'Closing',
		[ReadyState.CLOSED]: 'Closed',
		[ReadyState.UNINSTANTIATED]: 'Uninstantiated',
	}[readyState];

	return (
		<div>
			<button
				onClick={handleClickSendMessage}
				disabled={readyState !== ReadyState.OPEN}
			>
				{"Click Me to send 'Hello'"}{' '}
			</button>
			<span>The WebSocket is currently {connectionStatus}</span>
			{lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
		</div>
	);
};

export default WebSocketDemo;
