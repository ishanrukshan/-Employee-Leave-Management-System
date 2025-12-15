const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
