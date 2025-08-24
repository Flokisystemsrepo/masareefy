
import React from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const BrandLayout: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const location = useLocation();

  if (!brandId) {
    return <div>Brand ID not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar brandId={brandId} currentPath={location.pathname} />
      
      <motion.main 
        className="flex-1 ml-64 overflow-y-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default BrandLayout;
