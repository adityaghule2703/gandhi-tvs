
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { FiFileText, FiCheckCircle, FiDollarSign, FiPackage, FiTruck } from 'react-icons/fi';
import axiosInstance from '../../axiosInstance';
import '../../css/dashboard.css';

const RTODashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState({ dashboard: true, bookings: true });
  const [error, setError] = useState({ dashboard: null, bookings: null });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/rtoProcess/stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError((prev) => ({ ...prev, dashboard: 'Failed to load dashboard data' }));
        }
      } catch (err) {
        setError((prev) => ({ ...prev, dashboard: err.message || 'Failed to fetch dashboard data' }));
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }));
      }
    };

    const fetchBookingCounts = async () => {
      try {
        const response = await axiosInstance.get('/ledger/booking-counts');
        if (response.data.status === 'success') {
          setBookingData(response.data.data);
        } else {
          setError((prev) => ({ ...prev, bookings: 'Failed to load booking data' }));
        }
      } catch (err) {
        setError((prev) => ({ ...prev, bookings: err.message || 'Failed to fetch booking data' }));
      } finally {
        setLoading((prev) => ({ ...prev, bookings: false }));
      }
    };

    fetchDashboardData();
    fetchBookingCounts();
  }, []);

  if (loading.dashboard || loading.bookings) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const isLoading = (key) => loading[key] && !error[key];
  const hasError = (key) => error[key] && !loading[key];

  const ProcessCard = ({ title, total, monthly, daily, icon, color }) => {
    const IconComponent = icon;
    return (
      <Card className="dashboard-card shadow-sm border-0" style={{ minHeight: '180px' }}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="text-uppercase text-muted mb-1">{title}</h6>
            <div className={`bg-${color} p-2 rounded`}>
              <IconComponent size={18} className="text-white" />
            </div>
          </div>
          <div className="d-flex flex-column gap-1">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Total</span>
              <Badge bg={color} className="px-3 py-1">
                {total}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Monthly</span>
              <Badge bg={color} className="px-3 py-1">
                {monthly}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Daily</span>
              <Badge bg={color} className="px-3 py-1">
                {daily}
              </Badge>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const PfnpfCard = () => (
    <Card className="dashboard-card shadow-sm border-0" style={{ minHeight: '180px' }}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="text-uppercase text-muted mb-1">Total PF/NPF Applications</h6>
          <div className="bg-primary p-2 rounded">
            <FiFileText size={18} className="text-white" />
          </div>
        </div>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Total</span>
            <Badge bg="primary" className="px-3 py-1">
              {isLoading('bookings') ? <Spinner animation="border" size="sm" /> : bookingData?.totalBookings || 0}
            </Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">PF</span>
            <Badge bg="info" className="px-3 py-1">
              {bookingData?.pfBookings || 0}
            </Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">NPF</span>
            <Badge bg="secondary" className="px-3 py-1">
              {bookingData?.npfBookings || 0}
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="account-dashboard">
      <Row className="mb-3">
        <Col md={12}>
          <h3>RTO Dashboard</h3>
        </Col>
      </Row>

      {hasError('dashboard') && (
        <Alert variant="danger" className="my-3">
          RTO Data Error: {error.dashboard}
        </Alert>
      )}
      {hasError('bookings') && (
        <Alert variant="danger" className="my-3">
          Booking Data Error: {error.bookings}
        </Alert>
      )}

      <Row className="g-3 mb-3">
        <Col md={3}>
          <PfnpfCard />
        </Col>
        <Col md={3}>
          <ProcessCard
            title="Total RTO Applications"
            total={dashboardData?.totalApplications?.total || 0}
            monthly={dashboardData?.totalApplications?.monthly || 0}
            daily={dashboardData?.totalApplications?.daily || 0}
            icon={FiFileText}
            color="primary"
          />
        </Col>
        <Col md={3}>
          <ProcessCard
            title="Paper Verification"
            total={dashboardData?.rtoPaperVerify?.total || 0}
            monthly={dashboardData?.rtoPaperVerify?.monthly || 0}
            daily={dashboardData?.rtoPaperVerify?.daily || 0}
            icon={FiCheckCircle}
            color="success"
          />
        </Col>
        <Col md={3}>
          <ProcessCard
            title="Tax Update"
            total={dashboardData?.rtoTaxUpdate?.total || 0}
            monthly={dashboardData?.rtoTaxUpdate?.monthly || 0}
            daily={dashboardData?.rtoTaxUpdate?.daily || 0}
            icon={FiDollarSign}
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <ProcessCard
            title="HSRP Ordering"
            total={dashboardData?.hsrpOrdering?.total || 0}
            monthly={dashboardData?.hsrpOrdering?.monthly || 0}
            daily={dashboardData?.hsrpOrdering?.daily || 0}
            icon={FiPackage}
            color="danger"
          />
        </Col>
        <Col md={4}>
          <ProcessCard
            title="HSRP Installation"
            total={dashboardData?.hsrpInstallation?.total || 0}
            monthly={dashboardData?.hsrpInstallation?.monthly || 0}
            daily={dashboardData?.hsrpInstallation?.daily || 0}
            icon={FiTruck}
            color="info"
          />
        </Col>
        <Col md={4}>
          <ProcessCard
            title="RC Confirmation"
            total={dashboardData?.rcConfirmation?.total || 0}
            monthly={dashboardData?.rcConfirmation?.monthly || 0}
            daily={dashboardData?.rcConfirmation?.daily || 0}
            icon={FiCheckCircle}
            color="success"
          />
        </Col>
      </Row>
    </div>
  );
};

export default RTODashboard;
