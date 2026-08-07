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

import React, { useRef, useEffect, useCallback } from 'react';
import { Toast } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next';
import { usePlayground } from '../../contexts/PlaygroundContext';
import { exportConfig, importConfig } from './configStorage';

// 视觉稿资源
import attachmentIcon from '../../assets/figma-playground/27.svg';
import sendIcon from '../../assets/figma-playground/26.svg';
import exportIcon from '../../assets/figma-playground/28.svg';
import importIcon from '../../assets/figma-playground/29.svg';
import ModalPro from '@/components/common/ui/ModalPro';

const WALLET_PRIMARY = '#635DE7';
const WALLET_GRADIENT_BTN =
  'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)';

// 输入栏中的导出/导入按钮（对应视觉稿底部操作条）
const InputBarConfigActions = ({ currentConfig, messages, onConfigImport }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const configWithTimestamp = {
        ...currentConfig,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        'playground_config',
        JSON.stringify(configWithTimestamp),
      );
      exportConfig(currentConfig, messages);
      Toast.success({ content: t('配置已导出到下载文件夹'), duration: 3 });
    } catch (error) {
      Toast.error({
        content: t('导出配置失败: ') + error.message,
        duration: 3,
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
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
          onConfigImport(importedConfig);
          Toast.success({ content: t('配置导入成功'), duration: 3 });
        },
      });
    } catch (error) {
      Toast.error({
        content: t('导入配置失败: ') + error.message,
        duration: 3,
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
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
          background: WALLET_GRADIENT_BTN,
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
          background: '#F7F4FE',
          outline: '1px solid var(--ps-outline)',
          outlineOffset: '-1px',
          border: 'none',
          color: WALLET_PRIMARY,
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
    </>
  );
};

const CustomInputRender = (props) => {
  const { t } = useTranslation();
  const { onPasteImage, imageEnabled } = usePlayground();
  const { detailProps, configManagerProps } = props;
  const { clearContextNode, inputNode, sendNode, onClick } = detailProps;
  const containerRef = useRef(null);

  const handlePaste = useCallback(
    async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();

          if (file) {
            try {
              if (!imageEnabled) {
                Toast.warning({
                  content: t('请先在设置中启用图片功能'),
                  duration: 3,
                });
                return;
              }

              const reader = new FileReader();
              reader.onload = (event) => {
                const base64 = event.target.result;

                if (onPasteImage) {
                  onPasteImage(base64);
                  Toast.success({
                    content: t('图片已添加'),
                    duration: 2,
                  });
                } else {
                  Toast.error({
                    content: t('无法添加图片'),
                    duration: 2,
                  });
                }
              };
              reader.onerror = () => {
                console.error('Failed to read image file:', reader.error);
                Toast.error({
                  content: t('粘贴图片失败'),
                  duration: 2,
                });
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error('Failed to paste image:', error);
              Toast.error({
                content: t('粘贴图片失败'),
                duration: 2,
              });
            }
          }
          break;
        }
      }
    },
    [onPasteImage, imageEnabled, t],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('paste', handlePaste);
    return () => {
      container.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // 发送按钮
  const styledSendNode = React.cloneElement(sendNode, {
    className: `!rounded-full flex-shrink-0 transition-all ${sendNode.props.className || ''}`,
    style: {
      ...sendNode.props.style,
      width: '32px',
      height: '32px',
      minWidth: '32px',
      padding: 0,
      background: WALLET_GRADIENT_BTN,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <div className='p-2 sm:p-3' ref={containerRef}>
      <div
        className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-10 sm:h-[38px] rounded-[10px] transition-shadow'
        style={{
          background: 'rgba(255,255,255,0.50)',
          boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
          outline: '1px solid var(--ps-outline)',
          outlineOffset: '-1px',
        }}
        onClick={onClick}
        title={t('支持 Ctrl+V 粘贴图片')}
      >
        <img
          src={attachmentIcon}
          alt=''
          style={{ width: 34, height: 34, flexShrink: 0 }}
        />
        <div className='flex-1 min-w-0'>{inputNode}</div>
        {clearContextNode && (
          <div className='flex-shrink-0'>{clearContextNode}</div>
        )}
        {configManagerProps && (
          <InputBarConfigActions {...configManagerProps} />
        )}
        {styledSendNode}
      </div>
    </div>
  );
};

export default CustomInputRender;
