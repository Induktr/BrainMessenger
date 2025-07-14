'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChatListItem from '@/entities/chat/ui/ChatListItem';
import Spinner from '@/shared/ui/Spinner/Spinner';
import { useChatList } from '@/hooks/useChatList';
import { Chat } from '@/entities/chat/model/chat.types';
import SearchWidget from '../SearchWidget/SearchWidget';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GLOBAL_SEARCH_QUERY } from '@/entities/chat/model/chat.queries';
import { FIND_OR_CREATE_PRIVATE_CHAT } from '@/entities/chat/model/chat.mutations';
import { UserDto } from '@/entities/user/model/user.types';
import UserListItem from '@/entities/user/ui/UserListItem';

interface ChatListWidgetProps {
  onSelectChat: (chatId: string, chatType: 'PRIVATE' | 'GROUP' | 'CHANNEL', chatName: string) => void;
  activeChatId: string | null;
  searchQuery: string;
}

const ChatListWidget: React.FC<ChatListWidgetProps> = ({ onSelectChat, activeChatId, searchQuery }) => {
  const { chats, loading: chatsLoading, error: chatsError } = useChatList();
  const [
    executeSearch,
    { data: searchData, loading: searchLoading, error: searchError },
  ] = useLazyQuery(GLOBAL_SEARCH_QUERY);
  const [findOrCreatePrivateChat] = useMutation(FIND_OR_CREATE_PRIVATE_CHAT);
  const { t } = useTranslation();

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      executeSearch({ variables: { query: searchQuery } });
    }
  }, [searchQuery, executeSearch]);

  const filteredChats = chats.filter((chat: Chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (userId: string, userName: string) => {
    try {
      const { data } = await findOrCreatePrivateChat({
        variables: { otherUserId: userId },
      });
      if (data?.findOrCreatePrivateChat) {
        const chat = data.findOrCreatePrivateChat;
        onSelectChat(chat.id, chat.type, chat.name);
      }
    } catch (error) {
      console.error(t('chatList.findOrCreateError'), error);
    }
  };

  return (
    <div className="chat-list-widget">
      {chatsLoading && <Spinner />}
      {chatsError && <p>{t('chatList.loadError')}</p>}
      {searchLoading && <Spinner />}
      {searchError && <p>{t('chatList.searchError')}</p>}
      {!chatsLoading && !chatsError && (
        <>
          {searchData && searchQuery.trim() !== '' ? (
            <div className="search-results">
              <h3>{t('chatList.users')}</h3>
              {searchData.globalSearch.users.length === 0 && <p>{t('chatList.noUsersFound')}</p>}
              {searchData.globalSearch.users.map((user: UserDto) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onClick={() => handleSelectUser(user.id, user.name)}
                />
              ))}
              <h3>{t('chatList.groups')}</h3>
              {searchData.globalSearch.chats.filter((c: Chat) => c.type === 'GROUP').length === 0 && <p>{t('chatList.noGroupsFound')}</p>}
              {searchData.globalSearch.chats
                .filter((chat: Chat) => chat.type === 'GROUP')
                .map((chat: Chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id, chat.type, chat.name)}
                  />
              ))}
              <h3>{t('chatList.channels')}</h3>
              {searchData.globalSearch.chats.filter((c: Chat) => c.type === 'CHANNEL').length === 0 && <p>{t('chatList.noChannelsFound')}</p>}
              {searchData.globalSearch.chats
                .filter((chat: Chat) => chat.type === 'CHANNEL')
                .map((chat: Chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id, chat.type, chat.name)}
                  />
              ))}
            </div>
          ) : (
            <div className="chat-list">
              {filteredChats.map((chat: Chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onClick={() => onSelectChat(chat.id, chat.type, chat.name)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatListWidget;