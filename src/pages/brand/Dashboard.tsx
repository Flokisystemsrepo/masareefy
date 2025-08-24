
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  Calendar,
  Filter,
  MoreVertical,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const costData = [
  { name: 'Marketing', value: 45000 },
  { name: 'Operations', value: 32000 },
  { name: 'Materials', value: 28000 },
  { name: 'Staff', value: 55000 },
  { name: 'Utilities', value: 12000 }
];

const revenueData = [
  { month: 'Jan', revenue: 65000, profit: 25000 },
  { month: 'Feb', revenue: 78000, profit: 32000 },
  { month: 'Mar', revenue: 85000, profit: 35000 },
  { month: 'Apr', revenue: 92000, profit: 38000 },
  { month: 'May', revenue: 88000, profit: 36000 },
  { month: 'Jun', revenue: 95000, profit: 42000 }
];

const recentActivities = [
  { id: 1, type: 'revenue', description: 'Online sales payment received', amount: 15000, time: '2 minutes ago' },
  { id: 2, type: 'cost', description: 'Marketing campaign payment', amount: -5000, time: '1 hour ago' },
  { id: 3, type: 'team', description: 'New team member added', amount: null, time: '3 hours ago' },
  { id: 4, type: 'revenue', description: 'Wholesale order completed', amount: 25000, time: '5 hours ago' },
  { id: 5, type: 'cost', description: 'Office supplies purchase', amount: -1200, time: '1 day ago' }
];

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your brand overview</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last {dateRange === '30d' ? '30 days' : dateRange === '7d' ? '7 days' : '90 days'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            title: 'Total Revenue',
            value: 'EGP 245,000',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'green'
          },
          {
            title: 'Total Costs',
            value: 'EGP 172,000',
            change: '+3.2%',
            trend: 'up',
            icon: TrendingUp,
            color: 'red'
          },
          {
            title: 'Net Profit',
            value: 'EGP 73,000',
            change: '+18.7%',
            trend: 'up',
            icon: TrendingUp,
            color: 'blue'
          },
          {
            title: 'Wallet Balance',
            value: 'EGP 85,500',
            change: '-5.3%',
            trend: 'down',
            icon: Wallet,
            color: 'purple'
          }
        ].map((metric, index) => (
          <motion.div key={metric.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center space-x-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Costs by Category */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">Costs by Category</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`EGP ${value.toLocaleString()}`, 'Cost']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">Revenue & Profit Trend</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `EGP ${value.toLocaleString()}`, 
                      name === 'revenue' ? 'Revenue' : 'Profit'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity and Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'revenue' ? 'bg-green-500' :
                        activity.type === 'cost' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <span className={`text-sm font-semibold ${
                        activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.amount > 0 ? '+' : ''}EGP {Math.abs(activity.amount).toLocaleString()}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Team Members</span>
                </div>
                <span className="text-lg font-bold text-blue-600">12</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Active Projects</span>
                </div>
                <span className="text-lg font-bold text-green-600">8</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Avg. Monthly Revenue</span>
                </div>
                <span className="text-lg font-bold text-purple-600">EGP 82K</span>
              </div>

              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                View Full Reports
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
