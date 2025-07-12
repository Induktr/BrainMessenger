import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface UserStatsWidgetProps {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}

// Custom text component for the center of the PieChart
const CustomPieCenterText = ({ cx, cy, activeUsers, newUsersToday, t }: any) => {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 10} className="pie-chart-center-text__active-users-label">{t('userStats.activeUsers')} {activeUsers}</tspan>
      <tspan x={cx} y={cy + 10} className="pie-chart-center-text__new-users-today">{t('userStats.newUsersToday')} {newUsersToday}</tspan>
    </text>
  );
};

const UserStatsWidget: React.FC<UserStatsWidgetProps> = ({ totalUsers, activeUsers, newUsersToday }) => {
  const { t } = useTranslation();
  const data = [
    { name: t('userStats.activeUsers'), value: activeUsers, color: '#96C93D' }, // Vibrant Green
    { name: t('userStats.newUsersToday'), value: newUsersToday, color: '#FFD700' }, // Yellow
    { name: t('userStats.inactiveUsers'), value: totalUsers - activeUsers - newUsersToday, color: '#4F545C' }, // Dark Grey
  ];

  return (
    <div className="admin-widget user-stats-widget">
      <h2 className="admin-widget__title">{t('userStats.title')}</h2>
      <div className="user-stats-widget__chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50} // Thicker ring
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <CustomPieCenterText cx="50%" cy="50%" activeUsers={activeUsers} newUsersToday={newUsersToday} t={t} />
          </PieChart>
        </ResponsiveContainer>
        <p className="user-stats-widget__total-users-label">{t('userStats.totalUsers')} {totalUsers}</p>
      </div>
    </div>
  );
};

export default UserStatsWidget;