import React from 'react';
import { UserDto } from '../model/user.types';
import { generateAvatarData } from '../model/user-generate-avatar';

interface UserListItemProps {
  user: UserDto;
  onClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onClick }) => {
  const { letter, color } = generateAvatarData(user.name);

  return (
    <div className="chat-list-item" onClick={onClick}>
      <div className="chat-list-item-avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder" style={{ backgroundColor: color }}>
            <span>{letter}</span>
          </div>
        )}
      </div>
      <div className="chat-list-item-content">
        <div className="chat-list-item-header">
          <h3 className="chat-list-item-name">{user.name}</h3>
        </div>
        <div className="chat-list-item-snippet">
          <p>@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;