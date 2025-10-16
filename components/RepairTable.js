export default function RepairTable({ repairs, onEdit, onDelete, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return 'bg-yellow-100 text-yellow-800';
      case 'กำลังดำเนินการ':
        return 'bg-blue-100 text-blue-800';
      case 'เสร็จสิ้น':
        return 'bg-green-100 text-green-800';
      case 'ยกเลิก':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ต่ำ':
        return 'text-green-600';
      case 'ปานกลาง':
        return 'text-yellow-600';
      case 'สูง':
        return 'text-orange-600';
      case 'ฉุกเฉิน':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!repairs || repairs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่มีข้อมูลงานซ่อม
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              รหัสงาน
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              หัวข้อ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ช่างผู้รับผิดชอบ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ความสำคัญ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ค่าใช้จ่าย
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {repairs.map((repair) => (
            <tr key={repair.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                #{repair.id}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {repair.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {repair.assignedTo}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`font-medium ${getPriorityColor(repair.priority)}`}>
                  {repair.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                  {repair.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {repair.actualCost 
                  ? `฿${repair.actualCost.toLocaleString()}` 
                  : `(ประเมิน ฿${repair.estimatedCost?.toLocaleString() || 0})`
                }
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(repair)}
                    className="text-blue-600 hover:text-blue-800"
                    title="ดูรายละเอียด"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(repair)}
                    className="text-green-600 hover:text-green-800"
                    title="แก้ไข"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(repair)}
                    className="text-red-600 hover:text-red-800"
                    title="ลบ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

