import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AlertModal from '../../components/AlertModal';
import { REPAIR_STATUS, REPAIR_STATUS_LABELS, PRIORITY_LABELS, getRepairStatusColor } from '../../lib/constants';

export default function TechnicianDashboard() {
  const router = useRouter();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, inprogress, completed
  const [currentUser, setCurrentUser] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('technicianUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing technicianUser:', error);
        router.push('/technician/login');
      }
    } else {
      // Redirect to login if not logged in
      router.push('/technician/login');
    }
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchMyRepairs();
    }
  }, [currentUser]);

  const showAlert = (title, message, type = 'info') => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const fetchMyRepairs = async () => {
    try {
      const technicianId = currentUser?.id;
      
      if (!technicianId) {
        console.error('No technician ID found');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/repairs?assignedTo=${technicianId}`);
      const data = await res.json();
      
      if (data.success) {
        setRepairs(data.data);
      } else {
        console.error('API Error:', data.error);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('technicianUser');
    router.push('/technician/login');
  };

  const handleViewDetail = (repair) => {
    router.push(`/technician/repair/${repair.id}`);
  };

  const handleMapNavigation = async (repair) => {
    try {
      let lat, lng;
      
      // Check if repair has coordinates directly
      if (repair.coordinates) {
        // Check for {lat, lng} format
        if (repair.coordinates.lat && repair.coordinates.lng) {
          lat = repair.coordinates.lat;
          lng = repair.coordinates.lng;
        }
        // Check for {latitude, longitude} format
        else if (repair.coordinates.latitude && repair.coordinates.longitude) {
          lat = repair.coordinates.latitude;
          lng = repair.coordinates.longitude;
        }
      }

      // If no coordinates from repair.coordinates, check location field
      if (!lat || !lng) {
        if (repair.location) {
          // Try to parse location as JSON coordinates
          try {
            const locationData = JSON.parse(repair.location);
            if (locationData.latitude && locationData.longitude) {
              lat = locationData.latitude;
              lng = locationData.longitude;
            }
          } catch (e) {
            // If not JSON, treat as location name
          }
        }
      }

      // If we have coordinates, use them
      if (lat && lng) {
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        
        let mapUrl;
        
        if (isIOS) {
          // iOS: Try Apple Maps first, fallback to Google Maps
          mapUrl = `maps://maps.google.com/maps?q=${lat},${lng}`;
        } else if (isAndroid) {
          // Android: Use Google Maps
          mapUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
        } else {
          // Desktop/Other: Use Google Maps web
          mapUrl = `https://maps.google.com/maps?q=${lat},${lng}`;
        }
        
        // Try to open native app first
        const link = document.createElement('a');
        link.href = mapUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Fallback to web version after a short delay
        setTimeout(() => {
          const webMapUrl = `https://maps.google.com/maps?q=${lat},${lng}`;
          window.open(webMapUrl, '_blank');
        }, 1000);
        
        return;
      }

      // If repair has location name, use it
      if (repair.location) {
        const mapUrl = `https://maps.google.com/maps/search/?api=1&query=${encodeURIComponent(repair.location)}`;
        
        const link = document.createElement('a');
        link.href = mapUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // If repair has assetCode, try to fetch asset details
      if (repair.assetCode) {
        const res = await fetch(`/api/assets?code=${repair.assetCode}`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
          const asset = data.data[0];
          
          if (asset.latitude && asset.longitude) {
            const userAgent = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent);
            const isAndroid = /android/.test(userAgent);
            
            let mapUrl;
            
            if (isIOS) {
              mapUrl = `maps://maps.google.com/maps?q=${asset.latitude},${asset.longitude}`;
            } else if (isAndroid) {
              mapUrl = `geo:${asset.latitude},${asset.longitude}?q=${asset.latitude},${asset.longitude}`;
            } else {
              mapUrl = `https://maps.google.com/maps?q=${asset.latitude},${asset.longitude}`;
            }
            
            const link = document.createElement('a');
            link.href = mapUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
              const webMapUrl = `https://maps.google.com/maps?q=${asset.latitude},${asset.longitude}`;
              window.open(webMapUrl, '_blank');
            }, 1000);
            
            return;
          } else if (asset.locationName) {
            const mapUrl = `https://maps.google.com/maps/search/?api=1&query=${encodeURIComponent(asset.locationName)}`;
            
            const link = document.createElement('a');
            link.href = mapUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }
        }
      }

      // If no location data available
      showAlert('ไม่พบตำแหน่ง', 'ไม่มีข้อมูลตำแหน่งสำหรับงานนี้', 'warning');
    } catch (error) {
      console.error('Error opening map:', error);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเปิดแผนที่ได้', 'error');
    }
  };

  const getStatusColor = (status) => {
    const baseColor = getRepairStatusColor(status);
    // Add border color
    const borderMap = {
      [REPAIR_STATUS.PENDING]: 'border-yellow-200',
      [REPAIR_STATUS.IN_PROGRESS]: 'border-blue-200',
      [REPAIR_STATUS.COMPLETED]: 'border-green-200',
      [REPAIR_STATUS.CANCELLED]: 'border-red-200',
    };
    return `${baseColor} ${borderMap[status] || 'border-gray-200'}`;
  };

  const getStatusLabel = (status) => {
    return REPAIR_STATUS_LABELS[status] || status;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    if (filter === 'all') return true;
    if (filter === 'pending') return repair.status === REPAIR_STATUS.PENDING;
    if (filter === 'inprogress') return repair.status === REPAIR_STATUS.IN_PROGRESS;
    if (filter === 'completed') return repair.status === REPAIR_STATUS.COMPLETED;
    return true;
  }).sort((a, b) => {
    // Priority order: PENDING -> IN_PROGRESS -> COMPLETED -> CANCELLED
    const statusOrder = {
      [REPAIR_STATUS.PENDING]: 1,
      [REPAIR_STATUS.IN_PROGRESS]: 2,
      [REPAIR_STATUS.COMPLETED]: 3,
      [REPAIR_STATUS.CANCELLED]: 4
    };
    
    const statusA = statusOrder[a.status] || 5;
    const statusB = statusOrder[b.status] || 5;
    
    // First sort by status priority
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // If same status, sort by priority (URGENT -> HIGH -> MEDIUM -> LOW)
    const priorityOrder = {
      'URGENT': 1,
      'HIGH': 2,
      'MEDIUM': 3,
      'LOW': 4
    };
    
    const priorityA = priorityOrder[a.priority] || 5;
    const priorityB = priorityOrder[b.priority] || 5;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same status and priority, sort by due date (earliest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    
    // If one has due date and other doesn't, prioritize the one with due date
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Finally, sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!currentUser) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>งานซ่อมของฉัน - Smart OBT</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">งานซ่อมของฉัน</h1>
                <p className="text-sm text-gray-500">สวัสดี, {currentUser?.name || 'ช่าง'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                title="ออกจากระบบ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-900">{repairs.length}</p>
                </div>
                <div className="bg-gray-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{REPAIR_STATUS_LABELS[REPAIR_STATUS.PENDING]}</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {repairs.filter(r => r.status === REPAIR_STATUS.PENDING).length}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {repairs.filter(r => r.status === REPAIR_STATUS.IN_PROGRESS).length}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{REPAIR_STATUS_LABELS[REPAIR_STATUS.COMPLETED]}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {repairs.filter(r => r.status === REPAIR_STATUS.COMPLETED).length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    filter === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ทั้งหมด ({repairs.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    filter === 'pending'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {REPAIR_STATUS_LABELS[REPAIR_STATUS.PENDING]} ({repairs.filter(r => r.status === REPAIR_STATUS.PENDING).length})
                </button>
                <button
                  onClick={() => setFilter('inprogress')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    filter === 'inprogress'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  กำลังดำเนินการ ({repairs.filter(r => r.status === REPAIR_STATUS.IN_PROGRESS).length})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    filter === 'completed'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {REPAIR_STATUS_LABELS[REPAIR_STATUS.COMPLETED]} ({repairs.filter(r => r.status === REPAIR_STATUS.COMPLETED).length})
                </button>
              </nav>
            </div>
          </div>

          {/* Repair List */}
          <div className="space-y-4">
            {filteredRepairs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg">ไม่มีงานซ่อมในหมวดนี้</p>
              </div>
            ) : (
              filteredRepairs.map((repair) => (
                <div
                  key={repair.id}
                  className={`rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                    repair.status === REPAIR_STATUS.PENDING 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' 
                      : 'bg-white'
                  }`}
                  onClick={() => handleViewDetail(repair)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {repair.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(repair.status)}`}>
                            {getStatusLabel(repair.status)}
                          </span>
                          {repair.status === REPAIR_STATUS.PENDING && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse">
                              ต้องทำ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {repair.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            รหัสงาน: <span className="font-mono text-gray-900">#{repair.ticketId || repair.id}</span>
                          </span>
                          <span className={`font-medium ${getPriorityColor(repair.priority)}`}>
                            ● {PRIORITY_LABELS[repair.priority] || repair.priority}
                          </span>
                          <span className="text-gray-500">
                            ประเภท: <span className="text-gray-900 font-medium">
                              {repair.reportType === 'repair' ? 'แจ้งซ่อม' : 'คำร้อง'}
                            </span>
                          </span>
                          {repair.categoryName && (
                            <span className="text-gray-500">
                              หมวดหมู่: <span className="text-gray-900 font-medium">{repair.categoryName}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-2">
                          {repair.reportedBy && (
                            <span className="text-gray-500">
                              ผู้แจ้ง: <span className="text-gray-900 font-medium">{repair.reportedBy}</span>
                            </span>
                          )}
                          {repair.reportedAt && (
                            <span className="text-gray-500">
                              แจ้งเมื่อ: <span className="text-gray-900 font-medium">
                                {new Date(repair.reportedAt).toLocaleDateString('th-TH')}
                              </span>
                            </span>
                          )}
                          {repair.dueDate && (
                            <span className="text-gray-500">
                              กำหนดเสร็จ: <span className="text-gray-900 font-medium">
                                {new Date(repair.dueDate).toLocaleDateString('th-TH')}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 ml-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {repair.estimatedCost && (
                        <div className="bg-gray-50 rounded-lg p-3 inline-block">
                          <span className="text-sm text-gray-600">ค่าใช้จ่ายประเมิน: </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ฿{repair.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {repair.status !== REPAIR_STATUS.COMPLETED && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleMapNavigation(repair);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          นำทาง
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

