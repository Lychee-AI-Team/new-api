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

import React, { useContext, useEffect, useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Toast } from '@douyinfe/semi-ui'

// Context
import { UserContext } from '../../context/User';
import { useIsMobile } from '../../hooks/common/useIsMobile';

// hooks
import { usePlaygroundState } from '../../hooks/playground/usePlaygroundState';
import { useMessageActions } from '../../hooks/playground/useMessageActions';
import { useApiRequest } from '../../hooks/playground/useApiRequest';
import { useSyncMessageAndCustomBody } from '../../hooks/playground/useSyncMessageAndCustomBody';
import { useMessageEdit } from '../../hooks/playground/useMessageEdit';
import { useDataLoader } from '../../hooks/playground/useDataLoader';

// Constants and utils
import {
  MESSAGE_ROLES,
  ERROR_MESSAGES,
} from '../../constants/playground.constants';
import {
  getLogo,
  stringToColor,
  buildMessageContent,
  createMessage,
  createLoadingAssistantMessage,
  getTextContent,
  buildApiPayload,
  encodeToBase64,
} from '../../helpers';

// Components
import {
  OptimizedSettingsPanel,
  OptimizedDebugPanel,
  OptimizedMessageContent,
  OptimizedMessageActions,
} from '../../components/playground/OptimizedComponents';
import ChatArea from '../../components/playground/ChatArea';
import FloatingButtons from '../../components/playground/FloatingButtons';
import { PlaygroundProvider } from '../../contexts/PlaygroundContext';
import { exportConfig, importConfig } from '../../components/playground/configStorage';
import debugEyeIcon from '../../assets/figma-playground/1.svg';
import headerIcon from '../../assets/figma-playground/27.svg';
import sendIcon from '../../assets/figma-playground/26.svg';
import exportIcon from '../../assets/figma-playground/28.svg';
import importIcon from '../../assets/figma-playground/29.svg';
import ModalPro from '@/components/common/ui/ModalPro';

// 生成头像
const generateAvatarDataUrl = (username) => {
  if (!username) {
    return 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png';
  }
  const firstLetter = username[0].toUpperCase();
  const bgColor = stringToColor(username);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="${bgColor}" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="16" fill="#ffffff" font-family="sans-serif">${firstLetter}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${encodeToBase64(svg)}`;
};

const Playground = () => {
  const { t } = useTranslation();
  const [userState] = useContext(UserContext);
  const isMobile = useIsMobile();
  const styleState = { isMobile };
  const [searchParams] = useSearchParams();

  const state = usePlaygroundState();
  const {
    inputs,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
    showSettings,
    models,
    groups,
    status,
    message,
    debugData,
    activeDebugTab,
    previewPayload,
    sseSourceRef,
    chatRef,
    handleInputChange,
    handleParameterToggle,
    debouncedSaveConfig,
    saveMessagesImmediately,
    handleConfigImport,
    handleConfigReset,
    setShowSettings,
    setModels,
    setGroups,
    setStatus,
    setMessage,
    setDebugData,
    setActiveDebugTab,
    setPreviewPayload,
    setShowDebugPanel,
    setCustomRequestMode,
    setCustomRequestBody,
  } = state;

  // API 请求相关
  const { sendRequest, onStopGenerator } = useApiRequest(
    setMessage,
    setDebugData,
    setActiveDebugTab,
    sseSourceRef,
    saveMessagesImmediately,
  );

  // 数据加载
  useDataLoader(userState, inputs, handleInputChange, setModels, setGroups);

  // 消息编辑
  const {
    editingMessageId,
    editValue,
    setEditValue,
    handleMessageEdit,
    handleEditSave,
    handleEditCancel,
  } = useMessageEdit(
    setMessage,
    inputs,
    parameterEnabled,
    sendRequest,
    saveMessagesImmediately,
  );

  // 消息和自定义请求体同步
  const { syncMessageToCustomBody, syncCustomBodyToMessage } =
    useSyncMessageAndCustomBody(
      customRequestMode,
      customRequestBody,
      message,
      inputs,
      setCustomRequestBody,
      setMessage,
      debouncedSaveConfig,
    );

  // 角色信息
  const roleInfo = {
    user: {
      name: userState?.user?.username || 'User',
      avatar: generateAvatarDataUrl(userState?.user?.username),
    },
    assistant: {
      name: 'Assistant',
      avatar: getLogo(),
    },
    system: {
      name: 'System',
      avatar: getLogo(),
    },
  };

  // 消息操作
  const messageActions = useMessageActions(
    message,
    setMessage,
    onMessageSend,
    saveMessagesImmediately,
  );

  // 构建预览请求体
  const constructPreviewPayload = useCallback(() => {
    try {
      // 如果是自定义请求体模式且有自定义内容，直接返回解析后的自定义请求体
      if (customRequestMode && customRequestBody && customRequestBody.trim()) {
        try {
          return JSON.parse(customRequestBody);
        } catch (parseError) {
          console.warn('自定义请求体JSON解析失败，回退到默认预览:', parseError);
        }
      }

      // 默认预览逻辑
      let messages = [...message];

      // 如果存在用户消息
      if (
        !(
          messages.length === 0 ||
          messages.every((msg) => msg.role !== MESSAGE_ROLES.USER)
        )
      ) {
        // 处理最后一个用户消息的图片
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === MESSAGE_ROLES.USER) {
            if (inputs.imageEnabled && inputs.imageUrls) {
              const validImageUrls = inputs.imageUrls.filter(
                (url) => url.trim() !== '',
              );
              if (validImageUrls.length > 0) {
                const textContent = getTextContent(messages[i]) || '示例消息';
                const content = buildMessageContent(
                  textContent,
                  validImageUrls,
                  true,
                );
                messages[i] = { ...messages[i], content };
              }
            }
            break;
          }
        }
      }

      return buildApiPayload(messages, null, inputs, parameterEnabled);
    } catch (error) {
      console.error('构造预览请求体失败:', error);
      return null;
    }
  }, [inputs, parameterEnabled, message, customRequestMode, customRequestBody]);

  // 发送消息
  function onMessageSend(content, attachment) {
    console.log('attachment: ', attachment);

    // 创建用户消息和加载消息
    const userMessage = createMessage(MESSAGE_ROLES.USER, content);
    const loadingMessage = createLoadingAssistantMessage();

    // 如果是自定义请求体模式
    if (customRequestMode && customRequestBody) {
      try {
        const customPayload = JSON.parse(customRequestBody);

        setMessage((prevMessage) => {
          const newMessages = [...prevMessage, userMessage, loadingMessage];

          // 发送自定义请求体
          sendRequest(customPayload, customPayload.stream !== false);

          // 发送消息后保存，传入新消息列表
          setTimeout(() => saveMessagesImmediately(newMessages), 0);

          return newMessages;
        });
        return;
      } catch (error) {
        console.error('自定义请求体JSON解析失败:', error);
        Toast.error(ERROR_MESSAGES.JSON_PARSE_ERROR);
        return;
      }
    }

    // 默认模式
    const validImageUrls = inputs.imageUrls.filter((url) => url.trim() !== '');
    const messageContent = buildMessageContent(
      content,
      validImageUrls,
      inputs.imageEnabled,
    );
    const userMessageWithImages = createMessage(
      MESSAGE_ROLES.USER,
      messageContent,
    );

    setMessage((prevMessage) => {
      const newMessages = [...prevMessage, userMessageWithImages];

      const payload = buildApiPayload(
        newMessages,
        null,
        inputs,
        parameterEnabled,
      );
      sendRequest(payload, inputs.stream);

      // 禁用图片模式
      if (inputs.imageEnabled) {
        setTimeout(() => {
          handleInputChange('imageEnabled', false);
        }, 100);
      }

      // 发送消息后保存，传入新消息列表（包含用户消息和加载消息）
      const messagesWithLoading = [...newMessages, loadingMessage];
      setTimeout(() => saveMessagesImmediately(messagesWithLoading), 0);

      return messagesWithLoading;
    });
  }

  // 切换推理展开状态
  const toggleReasoningExpansion = useCallback(
    (messageId) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId && msg.role === MESSAGE_ROLES.ASSISTANT
            ? { ...msg, isReasoningExpanded: !msg.isReasoningExpanded }
            : msg,
        ),
      );
    },
    [setMessage],
  );

  // 渲染函数
  const renderCustomChatContent = useCallback(
    ({ message, className }) => {
      const isCurrentlyEditing = editingMessageId === message.id;

      return (
        <OptimizedMessageContent
          message={message}
          className={className}
          styleState={styleState}
          onToggleReasoningExpansion={toggleReasoningExpansion}
          isEditing={isCurrentlyEditing}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          editValue={editValue}
          onEditValueChange={setEditValue}
        />
      );
    },
    [
      styleState,
      editingMessageId,
      editValue,
      handleEditSave,
      handleEditCancel,
      setEditValue,
      toggleReasoningExpansion,
    ],
  );

  const renderChatBoxAction = useCallback(
    (props) => {
      const { message: currentMessage } = props;
      const isAnyMessageGenerating = message.some(
        (msg) => msg.status === 'loading' || msg.status === 'incomplete',
      );
      const isCurrentlyEditing = editingMessageId === currentMessage.id;

      return (
        <OptimizedMessageActions
          message={currentMessage}
          styleState={styleState}
          onMessageReset={messageActions.handleMessageReset}
          onMessageCopy={messageActions.handleMessageCopy}
          onMessageDelete={messageActions.handleMessageDelete}
          onRoleToggle={messageActions.handleRoleToggle}
          onMessageEdit={handleMessageEdit}
          isAnyMessageGenerating={isAnyMessageGenerating}
          isEditing={isCurrentlyEditing}
        />
      );
    },
    [messageActions, styleState, message, editingMessageId, handleMessageEdit],
  );

  // Effects

  // 同步消息和自定义请求体
  useEffect(() => {
    syncMessageToCustomBody();
  }, [message, syncMessageToCustomBody]);

  useEffect(() => {
    syncCustomBodyToMessage();
  }, [customRequestBody, syncCustomBodyToMessage]);

  // 处理URL参数
  useEffect(() => {
    if (searchParams.get('expired')) {
      Toast.warning(t('登录过期，请重新登录！'));
    }
  }, [searchParams, t]);

  // Playground 组件无需再监听窗口变化，isMobile 由 useIsMobile Hook 自动更新

  // 构建预览payload
  useEffect(() => {
    const timer = setTimeout(() => {
      const preview = constructPreviewPayload();
      setPreviewPayload(preview);
      setDebugData((prev) => ({
        ...prev,
        previewRequest: preview ? JSON.stringify(preview, null, 2) : null,
        previewTimestamp: preview ? new Date().toISOString() : null,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [
    message,
    inputs,
    parameterEnabled,
    customRequestMode,
    customRequestBody,
    constructPreviewPayload,
    setPreviewPayload,
    setDebugData,
  ]);

  // 自动保存配置
  useEffect(() => {
    debouncedSaveConfig();
  }, [
    inputs,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
    debouncedSaveConfig,
  ]);

  // 清空对话的处理函数
  const handleClearMessages = useCallback(() => {
    setMessage([]);
    // 清空对话后保存，传入空数组
    setTimeout(() => saveMessagesImmediately([]), 0);
  }, [setMessage, saveMessagesImmediately]);

  // 处理粘贴图片
  const handlePasteImage = useCallback(
    (base64Data) => {
      if (!inputs.imageEnabled) {
        return;
      }
      // 添加图片到 imageUrls 数组
      const newUrls = [...(inputs.imageUrls || []), base64Data];
      handleInputChange('imageUrls', newUrls);
    },
    [inputs.imageEnabled, inputs.imageUrls, handleInputChange],
  );

  // Playground Context 值
  const playgroundContextValue = {
    onPasteImage: handlePasteImage,
    imageUrls: inputs.imageUrls || [],
    imageEnabled: inputs.imageEnabled || false,
  };

  // 底部输入栏状态
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef(null);
  const isGenerating = message.some((m) => m.status === 'loading');

  const handleSendInput = useCallback(() => {
    const text = inputText.trim();
    if (!text || isGenerating) return;
    onMessageSend(text);
    setInputText('');
  }, [inputText, isGenerating, onMessageSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendInput();
      }
    },
    [handleSendInput],
  );

  // 导出/导入配置（顶部操作栏）
  const currentConfig = {
    inputs,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
  };

  const handleExport = useCallback(() => {
    try {
      localStorage.setItem('playground_config', JSON.stringify(currentConfig));
      exportConfig(currentConfig, message);
      Toast.success({ content: t('配置已导出到下载文件夹'), duration: 3 });
    } catch (error) {
      Toast.error({ content: t('导出配置失败: ') + error.message, duration: 3 });
    }
  }, [currentConfig, message, t]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const importedConfig = await importConfig(file);
        ModalPro.confirm({
          title: t('确认导入配置'),
          content: t('导入的配置将覆盖当前设置，是否继续？'),
          okText: t('确定导入'),
          cancelText: t('取消'),
          onOk: () => {
            handleConfigImport(importedConfig);
            Toast.success({ content: t('配置导入成功'), duration: 3 });
          },
        });
      } catch (error) {
        Toast.error({ content: t('导入配置失败: ') + error.message, duration: 3 });
      } finally {
        event.target.value = '';
      }
    },
    [handleConfigImport, t],
  );

  // 粘贴图片
  const handleInputPaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            if (!inputs.imageEnabled) {
              Toast.warning({ content: t('请先在设置中启用图片功能'), duration: 3 });
              return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => handlePasteImage(ev.target.result);
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    },
    [inputs.imageEnabled, handlePasteImage, t],
  );

  return (
    <PlaygroundProvider value={playgroundContextValue}>
      <div className='h-full'>
        <Layout className='h-full bg-transparent'>
          <Layout.Content className='relative flex-1 overflow-hidden'>
            <div className='flex flex-col lg:flex-row h-[calc(100vh-66px)] mt-[60px]'>
              {/* 主区域 */}
              <div className='flex-1 flex flex-col gap-3 min-w-0 min-h-0 p-7'>
                {/* 顶部行：AI对话 + 模型名 ... 显示调试 + 导出 + 导入 */}
                <div className='flex-shrink-0 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={headerIcon}
                      alt=''
                      style={{ width: 34, height: 34, flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          color: 'var(--ps-text)',
                          fontSize: '16px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {t('AI对话')}
                      </div>
                      <div
                        style={{
                          color: 'var(--ps-text-2)',
                          fontSize: '13px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          marginTop: '2px',
                        }}
                      >
                        {inputs.model || t('选择模型开始对话')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    {/* 显示调试 */}
                    <button
                      type='button'
                      onClick={() => setShowDebugPanel(!showDebugPanel)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <img src={debugEyeIcon} alt='' style={{ width: 14, height: 14 }} />
                      <span
                        style={{
                          background:
                            'linear-gradient(180deg, #635DE7 0%, #81CBFA 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          fontSize: '16px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {showDebugPanel ? t('隐藏调试') : t('显示调试')}
                      </span>
                    </button>
                    {/* 导出 */}
                    <button
                      type='button'
                      onClick={handleExport}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        width: '86px',
                        height: '28px',
                        borderRadius: '8px',
                        background:
                          'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <img src={exportIcon} alt='' style={{ width: 12, height: 12 }} />
                      {t('导出')}
                    </button>
                    {/* 导入 */}
                    <button
                      type='button'
                      onClick={handleImportClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        width: '86px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'var(--ps-btn-bg)',
                        outline: '1px solid var(--ps-outline)',
                        outlineOffset: '-1px',
                        border: 'none',
                        color: 'var(--ps-text)',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <img src={importIcon} alt='' style={{ width: 12, height: 12 }} />
                      {t('导入')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.json'
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* 聊天卡片（仅消息） */}
                <div className='flex-1 min-h-0'>
                  <ChatArea
                    chatRef={chatRef}
                    message={message}
                    roleInfo={roleInfo}
                    onMessageSend={onMessageSend}
                    onMessageCopy={messageActions.handleMessageCopy}
                    onMessageReset={messageActions.handleMessageReset}
                    onMessageDelete={messageActions.handleMessageDelete}
                    onStopGenerator={onStopGenerator}
                    onClearMessages={handleClearMessages}
                    renderCustomChatContent={renderCustomChatContent}
                    renderChatBoxAction={renderChatBoxAction}
                  />
                </div>

                {/* 参数面板（下）- 桌面端常驻 */}
                {!isMobile && (
                  <div className='flex-shrink-0 h-[300px]'>
                    <OptimizedSettingsPanel
                      inputs={inputs}
                      parameterEnabled={parameterEnabled}
                      models={models}
                      groups={groups}
                      styleState={styleState}
                      showSettings={showSettings}
                      showDebugPanel={showDebugPanel}
                      customRequestMode={customRequestMode}
                      customRequestBody={customRequestBody}
                      onInputChange={handleInputChange}
                      onParameterToggle={handleParameterToggle}
                      onCloseSettings={() => setShowSettings(false)}
                      onConfigImport={handleConfigImport}
                      onConfigReset={handleConfigReset}
                      onCustomRequestModeChange={setCustomRequestMode}
                      onCustomRequestBodyChange={setCustomRequestBody}
                      previewPayload={previewPayload}
                      messages={message}
                    />
                  </div>
                )}

                {/* 底部输入栏 */}
                <div
                  className='flex-shrink-0 flex items-center gap-3 px-4'
                  style={{
                    height: '54px',
                    background: 'var(--ps-bg)',
                    boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
                    borderRadius: '10px',
                    outline: '1px solid var(--ps-outline)',
                    outlineOffset: '-1px',
                  }}
                  onPaste={handleInputPaste}
                >
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('请输入您的问题...')}
                    rows={1}
                    style={{
                      flex: '1 1 auto',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      resize: 'none',
                      color: 'var(--ps-text)',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      height: '38px',
                      lineHeight: '38px',
                    }}
                  />
                  {isGenerating ? (
                    <button
                      type='button'
                      onClick={onStopGenerator}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '12px',
                      }}
                    >
                      ■
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={handleSendInput}
                      disabled={!inputText.trim()}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: inputText.trim()
                          ? 'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)'
                          : 'rgba(106,58,199,0.15)',
                        border: 'none',
                        cursor: inputText.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        opacity: inputText.trim() ? 1 : 0.5,
                      }}
                    >
                      <img src={sendIcon} alt='' style={{ width: 20, height: 20 }} />
                    </button>
                  )}
                </div>
              </div>

              {/* 调试面板 - 桌面端右侧 */}
              {showDebugPanel && !isMobile && (
                <div className='w-96 flex-shrink-0 h-full pt-3 pr-3'>
                  <OptimizedDebugPanel
                    debugData={debugData}
                    activeDebugTab={activeDebugTab}
                    onActiveDebugTabChange={setActiveDebugTab}
                    styleState={styleState}
                    customRequestMode={customRequestMode}
                  />
                </div>
              )}
            </div>

            {/* 参数面板 - 移动端覆盖层 */}
            {isMobile && showSettings && (
              <div className='fixed top-0 left-0 right-0 bottom-0 z-[1000] bg-white overflow-auto shadow-lg'>
                <OptimizedSettingsPanel
                  inputs={inputs}
                  parameterEnabled={parameterEnabled}
                  models={models}
                  groups={groups}
                  styleState={styleState}
                  showSettings={showSettings}
                  showDebugPanel={showDebugPanel}
                  customRequestMode={customRequestMode}
                  customRequestBody={customRequestBody}
                  onInputChange={handleInputChange}
                  onParameterToggle={handleParameterToggle}
                  onCloseSettings={() => setShowSettings(false)}
                  onConfigImport={handleConfigImport}
                  onConfigReset={handleConfigReset}
                  onCustomRequestModeChange={setCustomRequestMode}
                  onCustomRequestBodyChange={setCustomRequestBody}
                  previewPayload={previewPayload}
                  messages={message}
                />
              </div>
            )}

            {/* 调试面板 - 移动端覆盖层 */}
            {showDebugPanel && isMobile && (
              <div className='fixed top-0 left-0 right-0 bottom-0 z-[1000] bg-white overflow-auto shadow-lg'>
                <OptimizedDebugPanel
                  debugData={debugData}
                  activeDebugTab={activeDebugTab}
                  onActiveDebugTabChange={setActiveDebugTab}
                  styleState={styleState}
                  showDebugPanel={showDebugPanel}
                  onCloseDebugPanel={() => setShowDebugPanel(false)}
                  customRequestMode={customRequestMode}
                />
              </div>
            )}

            {/* 浮动按钮 */}
            <FloatingButtons
              styleState={styleState}
              showSettings={showSettings}
              showDebugPanel={showDebugPanel}
              onToggleSettings={() => setShowSettings(!showSettings)}
              onToggleDebugPanel={() => setShowDebugPanel(!showDebugPanel)}
            />
          </Layout.Content>
        </Layout>
      </div>
    </PlaygroundProvider>
  );
};

export default Playground;
