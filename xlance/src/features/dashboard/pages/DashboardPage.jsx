import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { LoadingSpinner } from '../../../shared/components';
import FreelancerDashboard from '../components/FreelancerDashboard';
import ClientDashboard from '../components/ClientDashboard';

import usePageTitle from "../../../shared/hooks/usePageTitle";

const DashboardPage = () => {
  usePageTitle("Dashboard");
  const { role } = useParams();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  // Double check role matching
  const targetRole = (role || 'freelancer').toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      {targetRole === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />}
    </div>
  );
};

export default DashboardPage;
