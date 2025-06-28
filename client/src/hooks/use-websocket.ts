import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let wsUrl = url;
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = url.startsWith('ws') ? url : `${protocol}//${window.location.host}/ws${url.startsWith('?') ? url : ''}`;
    }

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setSocket(ws);
          setReadyState(WebSocket.OPEN);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          setLastMessage(event);
        };

        ws.onclose = () => {
          setSocket(null);
          setReadyState(WebSocket.CLOSED);
          console.log('WebSocket disconnected');
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setReadyState(WebSocket.CLOSED);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setReadyState(WebSocket.CLOSED);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  };

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage,
  };
}
