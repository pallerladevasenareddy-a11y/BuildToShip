import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import api from '../../services/api';

export function AppLayout() {
  const [reviewCount, setReviewCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    async function fetchReviewCount() {
      try {
        const res = await api.get('/review?status=OPEN');
        if (res.data.success) {
          setReviewCount(res.data.data.length);
        }
      } catch {
        // silently fallback
      }
    }
    fetchReviewCount();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex">
      <AppSidebar reviewCount={reviewCount} />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <Topbar />
        <main className="flex-1 pt-20 pb-12 px-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
