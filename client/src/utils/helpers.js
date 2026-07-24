export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'in_progress':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'pending':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export const formatAssessmentType = (type) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};