import React from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';

interface UserStatsWidgetProps {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}

// Custom text component for the center of the PieChart
const CustomPieCenterText = ({ cx, cy, activeUsers, newUsersToday, t }: any) => {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)">
      <tspan x={cx} y={cy - 10} className="text-sm font-semibold">{t('userStats.activeUsers')} {activeUsers}</tspan>
      <tspan x={cx} y={cy + 10} className="text-xs" fill="var(--color-text-secondary)">{t('userStats.newUsersToday')} {newUsersToday}</tspan>
    </text>
  );
};

const UserStatsWidget: React.FC<UserStatsWidgetProps> = ({ totalUsers, activeUsers, newUsersToday }) => {
  const { t } = useTranslation();
  const data = [
    { name: t('userStats.activeUsers'), value: activeUsers, color: 'var(--color-success)' },
    { name: t('userStats.newUsersToday'), value: newUsersToday, color: 'var(--color-secondary)' },
    { name: t('userStats.inactiveUsers'), value: totalUsers - activeUsers - newUsersToday, color: 'var(--color-disabled)' },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">{t('userStats.title')}</h2>
      <div className="w-full h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
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
      </div>
      <p className="text-[var(--color-text-secondary)] text-lg font-medium">{t('userStats.totalUsers')} {totalUsers}</p>
    </div>
  );
};

export default UserStatsWidget;