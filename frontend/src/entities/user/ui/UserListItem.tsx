import React from 'react';
import { UserDto } from '../model/user.types';
import { generateAvatarData } from '../model/user-generate-avatar';

interface UserListItemProps {
  user: UserDto;
  onClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onClick }) => {
  const { letter } = generateAvatarData(user.name);

  return (
    <div
      className="flex items-center p-3 cursor-pointer transition-colors duration-200 hover:bg-[var(--color-surface)]"
      onClick={onClick}
    >
      <div className="relative mr-4">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--color-disabled)] flex items-center justify-center">
            <span className="text-xl font-bold text-[var(--color-text-primary)]">{letter}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate text-[var(--color-text-primary)]">{user.name}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] truncate">@{user.username}</p>
      </div>
    </div>
  );
};

export default UserListItem;