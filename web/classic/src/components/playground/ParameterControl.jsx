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
import { Slider, Typography, Input } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

// 视觉稿资源
import stepperUpIcon from '../../assets/figma-playground/24.svg';
import stepperDownIcon from '../../assets/figma-playground/25.svg';

const { Text } = Typography;

// 字段输入/选择框统一样式
const fieldStyle = {
  background: 'var(--ps-input-bg)',
  borderRadius: '10px',
  outline: '1px solid var(--ps-outline)',
  outlineOffset: '-1px',
};

const ParameterControl = ({
  inputs,
  parameterEnabled,
  onInputChange,
  onParameterToggle,
  disabled = false,
  subset = null,
}) => {
  const { t } = useTranslation();

  // 滑块参数（视觉稿：标题 + 说明 + 渐变滑块）
  const sliderParams = [
    {
      key: 'temperature',
      label: 'Temperature',
      desc: t('控制输出的随机性和创造性'),
      enabled: parameterEnabled.temperature,
      value: inputs.temperature,
      onChange: (value) => onInputChange('temperature', value),
      onToggle: () => onParameterToggle('temperature'),
      min: 0.1,
      max: 1,
      step: 0.1,
    },
    {
      key: 'top_p',
      label: 'Top P',
      desc: t('核采样，控制词汇选择的多样性'),
      enabled: parameterEnabled.top_p,
      value: inputs.top_p,
      onChange: (value) => onInputChange('top_p', value),
      onToggle: () => onParameterToggle('top_p'),
      min: 0.1,
      max: 1,
      step: 0.1,
    },
    {
      key: 'frequency_penalty',
      label: 'Frequency Penalty',
      desc: t('频率惩罚，减少重复词汇的出现'),
      enabled: parameterEnabled.frequency_penalty,
      value: inputs.frequency_penalty,
      onChange: (value) => onInputChange('frequency_penalty', value),
      onToggle: () => onParameterToggle('frequency_penalty'),
      min: -2,
      max: 2,
      step: 0.1,
    },
    {
      key: 'presence_penalty',
      label: 'Presence Penalty',
      desc: t('存在惩罚，鼓励讨论新话题'),
      enabled: parameterEnabled.presence_penalty,
      value: inputs.presence_penalty,
      onChange: (value) => onInputChange('presence_penalty', value),
      onToggle: () => onParameterToggle('presence_penalty'),
      min: -2,
      max: 2,
      step: 0.1,
    },
  ];

  // 根据 subset 过滤
  const visibleSliders = sliderParams.filter((p) => {
    if (subset === 'temp') {
      return p.key === 'temperature' || p.key === 'top_p';
    }
    if (subset === 'penalty') {
      return p.key === 'frequency_penalty' || p.key === 'presence_penalty';
    }
    if (subset === 'token') {
      return false;
    }
    return p.key !== 'frequency_penalty' && p.key !== 'presence_penalty';
  });

  const showTokenSection =
    !subset || subset === 'token' || subset === null;

  // Max Tokens 步进器
  const stepMaxTokens = (delta) => {
    const current = inputs.max_tokens || 0;
    const next = Math.max(0, current + delta);
    onInputChange('max_tokens', next);
  };

  return (
    <>
      {visibleSliders.map((p) => (
        <div
          key={p.key}
          className={`mb-4 ${!p.enabled || disabled ? 'opacity-50' : ''}`}
        >
          <div className='flex items-center justify-between mb-1'>
            <Text
              strong
              style={{
                color: 'var(--ps-text)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              {p.label}
            </Text>
            <button
              type='button'
              onClick={p.onToggle}
              disabled={disabled}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: p.enabled ? 'none' : '1px solid var(--ps-outline)',
                background: p.enabled ? 'var(--ps-input-bg)' : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                fontSize: '10px',
                lineHeight: 1,
                color: 'var(--ps-text-2)',
              }}
              title={p.enabled ? t('点击停用该参数') : t('点击启用该参数')}
            >
              {p.enabled ? '✓' : '×'}
            </button>
          </div>
          <Text
            style={{
              color: 'var(--ps-text-2)',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
            }}
          >
            {p.desc}
          </Text>
          <Slider
            step={p.step}
            min={p.min}
            max={p.max}
            value={p.value}
            onChange={p.onChange}
            className='pg-slider mt-3'
            disabled={!p.enabled || disabled}
          />
        </div>
      ))}

      {showTokenSection && (
        <>
          {/* Max Tokens */}
          <div
            className={`mb-4 ${!parameterEnabled.max_tokens || disabled ? 'opacity-50' : ''}`}
          >
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
                Max Tokens
              </Text>
              <button
                type='button'
                onClick={() => onParameterToggle('max_tokens')}
                disabled={disabled}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: parameterEnabled.max_tokens
                    ? 'none'
                    : '1px solid var(--ps-outline)',
                  background: parameterEnabled.max_tokens
                    ? 'var(--ps-input-bg)'
                    : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  fontSize: '10px',
                  lineHeight: 1,
                  color: 'var(--ps-text-2)',
                }}
              >
                {parameterEnabled.max_tokens ? '✓' : '×'}
              </button>
            </div>
            <div className='flex items-stretch' style={{ gap: '4px' }}>
              <input
                type='text'
                inputMode='numeric'
                value={inputs.max_tokens}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  onInputChange(
                    'max_tokens',
                    isNaN(num) ? 0 : num,
                  );
                }}
                style={{
                  flex: '1 1 auto',
                  width: '196px',
                  maxWidth: '196px',
                  height: '38px',
                  padding: '0 12px',
                  background: 'var(--ps-input-bg)',
                  border: 'none',
                  outline: '1px solid var(--ps-outline)',
                  outlineOffset: '-1px',
                  borderRadius: '10px',
                  color: 'var(--ps-text)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                }}
                disabled={!parameterEnabled.max_tokens || disabled}
              />
              <div
                className='flex flex-col'
                style={{
                  width: '16px',
                  height: '38px',
                  flexShrink: 0,
                  background: 'var(--ps-input-bg)',
                  borderRadius: '6px',
                  outline: '1px solid var(--ps-outline)',
                  outlineOffset: '-1px',
                }}
              >
                <button
                  type='button'
                  onClick={() => stepMaxTokens(1)}
                  disabled={!parameterEnabled.max_tokens || disabled}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img src={stepperUpIcon} alt='+' style={{ width: 8, height: 8 }} />
                </button>
                <button
                  type='button'
                  onClick={() => stepMaxTokens(-1)}
                  disabled={!parameterEnabled.max_tokens || disabled}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderTop: '1px solid var(--ps-outline)',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img src={stepperDownIcon} alt='-' style={{ width: 8, height: 8 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Seed */}
          <div
            className={`mb-4 ${!parameterEnabled.seed || disabled ? 'opacity-50' : ''}`}
          >
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
                {t('Seed(可选，用于复现结果)')}
              </Text>
              <button
                type='button'
                onClick={() => onParameterToggle('seed')}
                disabled={disabled}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: parameterEnabled.seed
                    ? 'none'
                    : '1px solid var(--ps-outline)',
                  background: parameterEnabled.seed
                    ? 'var(--ps-input-bg)'
                    : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  fontSize: '10px',
                  lineHeight: 1,
                  color: 'var(--ps-text-2)',
                }}
              >
                {parameterEnabled.seed ? '✓' : '×'}
              </button>
            </div>
            <Input
              placeholder={t('随机种子（留空为随机）')}
              name='seed'
              autoComplete='new-password'
              value={inputs.seed || ''}
              onChange={(value) =>
                onInputChange('seed', value === '' ? null : value)
              }
              style={{ ...fieldStyle, height: '38px' }}
              disabled={!parameterEnabled.seed || disabled}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ParameterControl;
