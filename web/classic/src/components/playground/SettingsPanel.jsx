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
import { Select, Typography, Switch } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { renderGroupOption, selectFilter } from '../../helpers';
import ParameterControl from './ParameterControl';
import ImageUrlInput from './ImageUrlInput';
import CustomRequestEditor from './CustomRequestEditor';

// 视觉稿资源
import streamToggleIcon from '../../assets/figma-playground/14.svg';
import modelChevronIcon from '../../assets/figma-playground/15.svg';
import groupChevronIcon from '../../assets/figma-playground/18.svg';

const { Text } = Typography;

// 区块标题（视觉稿 14px 500 #17171C）
const FieldLabel = ({ children, right }) => (
  <div className='flex items-center justify-between mb-2'>
    <Text
      strong
      style={{
        color: 'var(--ps-text)',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
      }}
    >
      {children}
    </Text>
    {right}
  </div>
);

// 输入/选择框统一样式（视觉稿 #F7F4FE + 10px 圆角 + #E2DAFD 描边）
const fieldStyle = {
  background: 'var(--ps-input-bg)',
  borderRadius: '10px',
  outline: '1px solid var(--ps-outline)',
  outlineOffset: '-1px',
};

const SettingsPanel = ({
  inputs,
  parameterEnabled,
  models,
  groups,
  styleState,
  showDebugPanel,
  customRequestMode,
  customRequestBody,
  onInputChange,
  onParameterToggle,
  onCloseSettings,
  onConfigImport,
  onConfigReset,
  onCustomRequestModeChange,
  onCustomRequestBodyChange,
  previewPayload,
  messages,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className='pg-settings h-full flex flex-col overflow-hidden'
      style={{
        background: 'var(--ps-bg)',
        boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
        borderRadius: '10px',
        outline: '1px solid var(--ps-outline)',
        outlineOffset: '-1px',
        backdropFilter: 'blur(9px)',
        WebkitBackdropFilter: 'blur(9px)',
      }}
    >
      {/* 标题：模型：xxx */}
      <div className='flex-shrink-0 px-5 pt-4 pb-3'>
        <Text
          strong
          style={{
            color: 'var(--ps-text)',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}
        >
          {t('模型：')}
          {inputs.model || t('请选择模型')}
        </Text>
      </div>

      {/* 内层面板 */}
      <div
        className='flex-1 overflow-y-auto p-5 model-settings-scroll'
        style={{
          margin: '0 22px 22px',
          background: 'var(--ps-bg)',
          boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
          borderRadius: '10px',
          outline: '1px solid var(--ps-outline)',
          outlineOffset: '-1px',
        }}
      >
        <div className='flex flex-wrap gap-x-10 gap-y-6'>
          {/* 第1列：自定义请求体模式 */}
          <div className='w-[222px] min-w-[222px] max-w-full'>
            <CustomRequestEditor
              customRequestMode={customRequestMode}
              customRequestBody={customRequestBody}
              onCustomRequestModeChange={onCustomRequestModeChange}
              onCustomRequestBodyChange={onCustomRequestBodyChange}
              defaultPayload={previewPayload}
            />
          </div>

          {/* 第2列：流式输出 + 模型 */}
          <div className='w-[222px] min-w-[222px] max-w-full'>
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <Text
                  strong
                  style={{
                    color: 'var(--ps-text)',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {t('流式输出')}
                </Text>
                <Switch
                  checked={inputs.stream}
                  onChange={(checked) => onInputChange('stream', checked)}
                  size='small'
                  disabled={customRequestMode}
                />
              </div>
            </div>
            <div className={customRequestMode ? 'opacity-50' : ''}>
              <FieldLabel>{t('模型')}</FieldLabel>
              <Select
                placeholder={t('请选择模型')}
                name='model'
                required
                selection
                filter={selectFilter}
                autoClearSearchValue={false}
                onChange={(value) => onInputChange('model', value)}
                value={inputs.model}
                autoComplete='new-password'
                optionList={models}
                style={{ width: '100%', height: '38px', ...fieldStyle }}
                dropdownStyle={{ width: '100%', maxWidth: '100%' }}
                suffixIcon={
                  <img src={modelChevronIcon} alt='' style={{ width: 16, height: 16 }} />
                }
                disabled={customRequestMode}
              />
            </div>
          </div>

          {/* 第3列：分组 + 图片地址 */}
          <div className='w-[238px] min-w-[238px] max-w-full'>
            <div className={customRequestMode ? 'opacity-50' : ''}>
              <FieldLabel>{t('分组')}</FieldLabel>
              <Select
                placeholder={t('请选择分组')}
                name='group'
                required
                selection
                filter={selectFilter}
                autoClearSearchValue={false}
                onChange={(value) => onInputChange('group', value)}
                value={inputs.group}
                autoComplete='new-password'
                optionList={groups}
                renderOptionItem={renderGroupOption}
                style={{ width: '100%', height: '38px', ...fieldStyle }}
                dropdownStyle={{ width: '100%', maxWidth: '100%' }}
                suffixIcon={
                  <img src={groupChevronIcon} alt='' style={{ width: 16, height: 16 }} />
                }
                disabled={customRequestMode}
              />
            </div>
            <div className='mt-5'>
              <ImageUrlInput
                imageUrls={inputs.imageUrls}
                imageEnabled={inputs.imageEnabled}
                onImageUrlsChange={(urls) => onInputChange('imageUrls', urls)}
                onImageEnabledChange={(enabled) =>
                  onInputChange('imageEnabled', enabled)
                }
                disabled={customRequestMode}
              />
            </div>
          </div>

          {/* 第4列：Temperature + Top P */}
          <div className='w-[222px] min-w-[222px] max-w-full'>
            <ParameterControl
              inputs={inputs}
              parameterEnabled={parameterEnabled}
              onInputChange={onInputChange}
              onParameterToggle={onParameterToggle}
              disabled={customRequestMode}
              subset='temp'
            />
          </div>

          {/* 第5列：Frequency + Presence */}
          <div className='w-[222px] min-w-[222px] max-w-full'>
            <ParameterControl
              inputs={inputs}
              parameterEnabled={parameterEnabled}
              onInputChange={onInputChange}
              onParameterToggle={onParameterToggle}
              disabled={customRequestMode}
              subset='penalty'
            />
          </div>

          {/* 第6列：Max Tokens + Seed */}
          <div className='w-[222px] min-w-[222px] max-w-full'>
            <ParameterControl
              inputs={inputs}
              parameterEnabled={parameterEnabled}
              onInputChange={onInputChange}
              onParameterToggle={onParameterToggle}
              disabled={customRequestMode}
              subset='token'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
