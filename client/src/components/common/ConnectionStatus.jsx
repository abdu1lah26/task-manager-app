import { useSocket } from '../../hooks/useSocket';

const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  if (isConnected) {
    return (
      <div className="connection-status online">
        <span className="status-dot"></span>
        <span>Live</span>
      </div>
    );
  }

  return (
    <div className="connection-status offline">
      <span className="status-dot"></span>
      <span>Offline</span>
    </div>
  );
};

export default ConnectionStatus;