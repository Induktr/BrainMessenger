import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../graphql/queries'; // Исправленный путь
import Avatar from './ui/Avatar'; // Импортируем Avatar

// TODO: Определить или импортировать тип User, если он есть
interface User {
  id: string;
  name: string;
  email: string;
  // Добавить bio, username, status позже
}

const MyAccountSettings: React.FC = () => {
  const { data, loading, error } = useQuery<{ getCurrentUser: User }>(GET_CURRENT_USER);

  // Skeleton UI Component (можно вынести в отдельный файл при желании)
  const SkeletonLoader = () => (
    <div className="p-6 bg-background-light dark:bg-surface-dark rounded-lg shadow-md animate-pulse">
      <h2 className="text-2xl font-semibold mb-6 text-center h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></h2>
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div> {/* Avatar Placeholder */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div> {/* Name Placeholder */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div> {/* Status Placeholder */}
      </div>
      <div className="mb-6 p-4 bg-surface-light dark:bg-background-dark rounded">
         <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div> {/* Bio Placeholder */}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  // Отображаем SkeletonLoader и при загрузке, и при ошибке
  if (loading || error) {
    // Можно добавить логирование ошибки в консоль, чтобы не терять информацию
    if (error) {
        console.error("Error loading account details:", error);
    }
    return <SkeletonLoader />;
  }

  if (!data || !data.getCurrentUser) {
    return <div className="p-4 text-center">Could not load user data.</div>;
  }

  const user = data.getCurrentUser;

  // TODO: Получить реальный статус (status), bio и avatarUrl с бэкенда, когда они будут добавлены
  const status = 'Online'; // Заглушка для статуса
  const bio = null; // Заглушка для bio (или можно оставить текст из макета, если хотите)
  const username = `@${user.name}`; // Заглушка username на основе name (пока нет отдельного поля)

  return (
    <div className="p-6 bg-background-light dark:bg-surface-dark rounded-lg shadow-md text-textPrimary-light dark:text-textPrimary-dark">
      <h2 className="text-2xl font-semibold mb-6 text-center">My Account</h2>

      <div className="flex flex-col items-center mb-6">
        <Avatar
          // avatarUrl={user.avatarUrl} // TODO: Раскомментировать, когда avatarUrl будет в данных
          name={user.name}
          seed={user.email} // Используем email для генерации цвета аватара
          size="large" // Увеличим размер для профиля
          className="mb-4"
        />
        <h3 className="text-xl font-medium">{user.name}</h3>
        <p className={`text-sm ${status === 'Online' ? 'text-green-500' : 'text-gray-500'}`}>{status}</p>
      </div>

      <div className="mb-6 p-4 bg-surface-light dark:bg-background-dark rounded">
        <p className="text-textSecondary-light dark:text-textSecondary-dark text-center italic">{bio || 'Bio not available yet.'}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <span className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark">Email</span>
          <span className="text-sm">{user.email}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <span className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark">Name</span>
          <span className="text-sm">{user.name}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-surface-light dark:bg-background-dark rounded">
          <span className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark">Username</span>
          <span className="text-sm italic">{username || 'Username not set'}</span>
        </div>
        {/* TODO: Добавить кнопку редактирования */}
      </div>
    </div>
  );
};

export default MyAccountSettings;