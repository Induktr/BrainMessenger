import React from 'react';
import { UserDto } from '../model/user.types';
import Avatar from '@/shared/ui/Avatar/Avatar';

interface UserListItemProps {
  user: UserDto;
  onClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onClick }) => {
  return (
    <div
      className="flex items-center p-3 cursor-pointer transition-colors duration-200 hover:bg-[var(--color-surface)]"
      onClick={onClick}
    >
      <div className="relative mr-4">
        <Avatar src={user.avatarUrl} name={user.name} size="lg" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate text-[var(--color-text-primary)]">{user.name}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] truncate">@{user.username}</p>
      </div>
    </div>
  );
};

export default UserListItem;