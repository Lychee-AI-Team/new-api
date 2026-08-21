/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Chat } from '@douyinfe/semi-ui';

const ChatArea = ({
  chatRef,
  message,
  roleInfo,
  onMessageSend,
  onMessageCopy,
  onMessageReset,
  onMessageDelete,
  onStopGenerator,
  onClearMessages,
  renderCustomChatContent,
  renderChatBoxAction,
}) => {
  // 隐藏 Semi Chat 内置输入框（输入栏由页面底部独立渲染）
  const renderInputArea = React.useCallback(() => {
    return <div style={{ display: 'none' }} />;
  }, []);

  return (
    <div
      className='pg-chat h-full flex flex-col overflow-hidden'
      style={{
        background: 'var(--ps-bg)',
        boxShadow:
          '0px 4px 8px rgba(106,58,199,0.08), -4px -4px 4px rgba(255,255,255,0.25) inset, 0px 4px 4px rgba(255,255,255,0.25) inset',
        borderRadius: '10px',
        outline: '1px solid var(--ps-outline)',
        outlineOffset: '-1px',
        backdropFilter: 'blur(9px)',
        WebkitBackdropFilter: 'blur(9px)',
      }}
    >
      <div className='flex-1 overflow-hidden'>
        <Chat
          ref={chatRef}
          chatBoxRenderConfig={{
            renderChatBoxContent: renderCustomChatContent,
            renderChatBoxAction: renderChatBoxAction,
            renderChatBoxTitle: () => null,
          }}
          renderInputArea={renderInputArea}
          roleConfig={roleInfo}
          style={{
            height: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
          chats={message}
          onMessageSend={onMessageSend}
          onMessageCopy={onMessageCopy}
          onMessageReset={onMessageReset}
          onMessageDelete={onMessageDelete}
          showClearContext={false}
          showStopGenerate={false}
          onStopGenerator={onStopGenerator}
          onClear={onClearMessages}
          className='h-full'
        />
      </div>
    </div>
  );
};

export default ChatArea;
