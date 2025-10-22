import { useEffect, useState } from 'react';
import { REPAIR_STATUS, REPAIR_STATUS_LABELS } from '../lib/constants';

export default function DashboardChart() {
  const [chartData, setChartData] = useState({
    repairsByMonth: [],
    reportsByStatus: {},
    assetsByCategory: {}
  });

  useEffect(() => {
    // TODO: Fetch chart data from API
    // Mock data for demonstration
    setChartData({
      repairsByMonth: [
        { month: 'ม.ค.', count: 5 },
        { month: 'ก.พ.', count: 8 },
        { month: 'มี.ค.', count: 12 },
        { month: 'เม.ย.', count: 7 },
        { month: 'พ.ค.', count: 10 },
        { month: 'มิ.ย.', count: 15 }
      ],
      reportsByStatus: {
        [REPAIR_STATUS.PENDING]: 5,
        [REPAIR_STATUS.IN_PROGRESS]: 3,
        [REPAIR_STATUS.COMPLETED]: 12
      },
      assetsByCategory: {
        'เฟอร์นิเจอร์': 25,
        'อุปกรณ์ไฟฟ้า': 15,
        'คอมพิวเตอร์': 10,
        'ยานพาหนะ': 8,
        'อื่นๆ': 12
      }
    });
  }, []);

  const maxRepairs = Math.max(...chartData.repairsByMonth.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Repairs by Month Chart - TailAdmin Style */}
      <div>
        <div className="flex items-end gap-2 h-64">
          {chartData.repairsByMonth.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 relative group cursor-pointer" 
                style={{ height: `${(data.count / maxRepairs) * 100}%`, minHeight: '30px' }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    {data.count} งาน
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">{data.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">รายงานตามสถานะ</h4>
          <div className="space-y-3">
            {Object.entries(chartData.reportsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{REPAIR_STATUS_LABELS[status] || status}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-white/90">{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all" 
                    style={{ width: `${(count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets by Category */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">ทรัพย์สินตามหมวดหมู่</h4>
          <div className="space-y-3">
            {Object.entries(chartData.assetsByCategory).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{category}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-white/90">{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all" 
                    style={{ width: `${(count / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

