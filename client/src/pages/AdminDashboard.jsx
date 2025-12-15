import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/leaveService';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [actionModal, setActionModal] = useState({ show: false, leave: null, action: '' });
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch all leaves for stats (runs once on mount and after actions)
  const fetchAllLeaves = async () => {
    try {
      const data = await leaveService.getAllLeaves('');
      setAllLeaves(data);
    } catch (error) {
      console.error('Failed to fetch all leaves for stats');
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const data = await leaveService.getAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs');
    }
  };

  // Fetch filtered leaves for display
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getAllLeaves(filter === 'all' ? '' : filter);
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const openActionModal = (leave, action) => {
    setActionModal({ show: true, leave, action });
    setComment('');
  };

  const closeModal = () => {
    setActionModal({ show: false, leave: null, action: '' });
    setComment('');
  };

  const handleAction = async () => {
    if (!actionModal.leave) return;

    setProcessing(true);
    try {
      if (actionModal.action === 'approve') {
        await leaveService.approveLeave(actionModal.leave._id, comment);
        toast.success('Leave request approved!');
      } else {
        await leaveService.rejectLeave(actionModal.leave._id, comment);
        toast.success('Leave request rejected!');
      }
      closeModal();
      fetchLeaves();
      fetchAllLeaves(); // Refresh stats after action
      fetchAuditLogs(); // Refresh audit logs after action
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate stats from allLeaves (not filtered)
  const pendingCount = allLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = allLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = allLeaves.filter(l => l.status === 'rejected').length;

  // Filter leaves by search query
  const filteredLeaves = leaves.filter((leave) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      leave.leaveId?.toLowerCase().includes(query) ||
      leave.employee?.name?.toLowerCase().includes(query) ||
      leave.employee?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Manage leave requests here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Pending Requests</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium">Approved</h3>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Rejected</h3>
          <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-medium capitalize transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Leave Requests {filter !== 'all' && `(${filter})`}
            {searchQuery && ` - Searching: "${searchQuery}"`}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{searchQuery ? `No results found for "${searchQuery}"` : `No ${filter !== 'all' ? filter : ''} leave requests found.`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-blue-600">
                        {leave.leaveId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {leave.employee?.name}
                        </div>
                        <div className="text-sm text-gray-500">{leave.employee?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.totalDays}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openActionModal(leave, 'approve')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(leave, 'reject')}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {leave.approvedBy?.name && `By ${leave.approvedBy.name}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className={`px-6 py-4 border-b ${
              actionModal.action === 'approve' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <h3 className={`text-lg font-semibold ${
                actionModal.action === 'approve' ? 'text-green-800' : 'text-red-800'
              }`}>
                {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to {actionModal.action} the leave request from{' '}
                <strong>{actionModal.leave?.employee?.name}</strong>?
              </p>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Dates:</strong> {formatDate(actionModal.leave?.startDate)} - {formatDate(actionModal.leave?.endDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Days:</strong> {actionModal.leave?.totalDays}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Reason:</strong> {actionModal.leave?.reason}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a comment for the employee..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionModal.action === 'approve'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {processing ? 'Processing...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Section */}
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAuditLogs ? 'Hide Logs' : 'Show Logs'}
          </button>
        </div>

        {showAuditLogs && (
          <div className="p-4">
            {auditLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No audit logs found.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className={`p-3 rounded-lg border ${
                      log.action === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded uppercase ${
                            log.action === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.action}
                        </span>
                        <p className="mt-1 text-sm text-gray-700">
                          <strong>{log.performedBy?.name || 'Admin'}</strong> {log.action} leave request
                          {log.targetLeave?.employee && (
                            <> from <strong>{log.targetLeave.employee.name}</strong></>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    {log.details && (
                      <p className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
