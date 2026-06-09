import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Log } from 'logging-middleware';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useWebSocket = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_user', userId);
      setIsConnected(true);
      Log('frontend', 'info', 'hook', `WebSocket connected for user ${userId}`);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      Log('frontend', 'warn', 'hook', `WebSocket disconnected for user ${userId}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return { socket, isConnected };
};

export const useNotificationSocket = (userId: string, onNewNotification: (data: any) => void) => {
  const { socket, isConnected } = useWebSocket(userId);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', onNewNotification);

    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, [socket, onNewNotification]);

  return { socket, isConnected };
};
