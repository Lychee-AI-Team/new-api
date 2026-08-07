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

import React, { useContext, useEffect, useState } from 'react';
import { Switch, Select } from '@douyinfe/semi-ui';
import {
  API,
  showError,
  showSuccess,
  setUserData,
  renderQuotaWithPrompt,
} from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { useTranslation } from 'react-i18next';

import SubPageBreadcrumb from '../components/SubPageBreadcrumb';
import CodeViewer from '../../../playground/CodeViewer';

// 分隔线
const Divider = () => (
  <div
    style={{
      width: '100%',
      height: '0',
      borderTop: '1px solid var(--ps-divider)',
    }}
  />
);

// 可复用的设置区块标题
const SectionTitle = ({ children }) => (
  <div
    className='md:!text-[20px]'
    style={{
      color: 'var(--ps-text)',
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

// 可复用的描述文字
const SectionDescription = ({ children }) => (
  <div
    className='mt-2 md:!text-[16px]'
    style={{
      color: 'var(--ps-text-2)',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      maxWidth: '600px',
    }}
  >
    {children}
  </div>
);

// 可复用的标签
const FieldLabel = ({ children }) => (
  <div
    className='mb-2 md:!text-[16px]'
    style={{
      color: 'var(--ps-text)',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

// 可复用的输入框
const StyledInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className='w-full transition-all duration-200 focus:outline-none'
    style={{
      height: '38px',
      background: 'var(--ps-input-bg)',
      borderRadius: '10px',
      outline: '1px solid var(--ps-outline)',
      outlineOffset: '-1px',
      border: 'none',
      padding: '0 12px',
      color: 'var(--ps-text-2)',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
    }}
  />
);

// 可复用的保存按钮
const SaveButton = ({ onClick, loading, children }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className='flex items-center justify-center transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full md:!w-[98px]'
    style={{
      height: '38px',
      background: 'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
      borderRadius: '10px',
      border: 'none',
      color: 'white',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
    }}
  >
    {children}
  </button>
);

// 通知方式选项卡片
const NotifyTypeOption = ({ label, description, selected, onClick }) => (
  <div
    onClick={onClick}
    className='cursor-pointer transition-all duration-200 flex items-center gap-3 p-3 md:p-4'
    style={{
      background: selected ? 'rgba(137, 189, 249, 0.08)' : 'var(--ps-input-bg)',
      borderRadius: '10px',
      outline: selected ? '1px solid #8164FF' : '1px solid var(--ps-outline)',
      outlineOffset: '-1px',
    }}
  >
    <div
      className='flex-shrink-0 flex items-center justify-center'
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: selected ? '5px solid #8164FF' : '2px solid #C9C9D4',
        transition: 'all 0.2s',
      }}
    />
    <div className='flex-1 min-w-0'>
      <div
        style={{
          color: 'var(--ps-text)',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {description && (
        <div
          className='mt-1'
          style={{
            color: 'var(--ps-text-2)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
          }}
        >
          {description}
        </div>
      )}
    </div>
  </div>
);

const NotificationPage = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notify_type: '',
    quota_warning_threshold: '',
    webhook_url: '',
    webhook_secret: '',
    bark_url: '',
    gotify_url: '',
    gotify_token: '',
    gotify_priority: 5,
    upstream_model_update_notify_enabled: false,
  });

  const isAdminOrRoot = (userState?.user?.role || 0) >= 10;

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        setUserData(data);
        setSettings({
          notify_type: data.notify_type || '',
          quota_warning_threshold: String(data.quota_warning_threshold || ''),
          webhook_url: data.webhook_url || '',
          webhook_secret: data.webhook_secret || '',
          bark_url: data.bark_url || '',
          gotify_url: data.gotify_url || '',
          gotify_token: data.gotify_token || '',
          gotify_priority: data.gotify_priority || 5,
          upstream_model_update_notify_enabled:
            data.upstream_model_update_notify_enabled || false,
        });
      } else {
        showError(message);
      }
    } catch (error) {
      // ignore
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const threshold = Number(settings.quota_warning_threshold);
    if (settings.quota_warning_threshold && (isNaN(threshold) || threshold <= 0)) {
      showError(t('预警阈值必须为正数'));
      return;
    }
    if (settings.notify_type === 'webhook' && !settings.webhook_url) {
      showError(t('请输入Webhook地址'));
      return;
    }
    if (settings.notify_type === 'bark' && !settings.bark_url) {
      showError(t('请输入Bark推送URL'));
      return;
    }
    if (settings.notify_type === 'gotify' && !settings.gotify_url) {
      showError(t('请输入Gotify服务器地址'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        notify_type: settings.notify_type,
        quota_warning_threshold: threshold,
        webhook_url: settings.webhook_url,
        webhook_secret: settings.webhook_secret,
        bark_url: settings.bark_url,
        gotify_url: settings.gotify_url,
        gotify_token: settings.gotify_token,
        gotify_priority: Number(settings.gotify_priority) || 5,
        upstream_model_update_notify_enabled:
          settings.upstream_model_update_notify_enabled,
      };
      const res = await API.put('/api/user/self', payload);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('保存成功'));
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('保存失败'));
    }
    setSaving(false);
  };

  const notifyTypeOptions = [
    { value: '', label: t('不通知'), description: t('不发送任何通知') },
    // { value: 'email', label: t('邮件通知'), description: t('通过绑定的邮箱发送通知') },
    { value: 'webhook', label: t('Webhook通知'), description: t('通过自定义Webhook发送通知') },
    { value: 'bark', label: t('Bark通知'), description: t('通过Bark App推送通知') },
    { value: 'gotify', label: t('Gotify通知'), description: t('通过Gotify服务器推送通知') },
  ];

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={t('通知配置')} />

          {/* 通知配置主卡片 */}
          <div
            style={{
              background: 'var(--ps-bg)',
              boxShadow:
                '0px 4px 8px rgba(106, 58, 199, 0.08), inset -4px -4px 4px rgba(255, 255, 255, 0.25), inset 0px 4px 4px rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              outline: '1px solid var(--ps-outline)',
              outlineOffset: '-1px',
              backdropFilter: 'blur(9px)',
            }}
          >
            <div className='px-4 py-6 md:px-[50px] md:py-[40px]'>
              {/* === Section 1: 额度预警阈值 === */}
              <div>
                <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                  <SectionTitle>{t('额度预警阈值')}</SectionTitle>
                  {settings.quota_warning_threshold &&
                    Number(settings.quota_warning_threshold) > 0 && (
                      <span
                        className='md:!text-[20px]'
                        style={{
                          color: 'var(--ps-text-2)',
                          fontSize: '16px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {renderQuotaWithPrompt(
                          Number(settings.quota_warning_threshold),
                        )}
                      </span>
                    )}
                </div>
                <div className='mt-3 md:mt-[12px]'>
                  <StyledInput
                    type='number'
                    value={settings.quota_warning_threshold}
                    onChange={(val) =>
                      handleChange('quota_warning_threshold', val)
                    }
                    placeholder={t('请输入预警额度')}
                  />
                </div>
                <SectionDescription>
                  {t(
                    '当钱包或订阅剩余额度低于此数值时，系统将通过选择的方式发送通知',
                  )}
                </SectionDescription>
              </div>

              <div className='my-6 md:my-[36px]'>
                <Divider />
              </div>

              {/* === Section 2: 通知方式 === */}
              <div>
                <SectionTitle>{t('通知方式')}</SectionTitle>
                <SectionDescription>
                  {t('选择接收额度预警通知的方式')}
                </SectionDescription>
                <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {notifyTypeOptions.map((option) => (
                    <NotifyTypeOption
                      key={option.value}
                      label={option.label}
                      description={option.description}
                      selected={settings.notify_type === option.value}
                      onClick={() => handleChange('notify_type', option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* === Section 3: Webhook 配置 === */}
              {settings.notify_type === 'webhook' && (
                <>
                  <div className='my-6 md:my-[36px]'>
                    <Divider />
                  </div>
                  <div>
                    <SectionTitle>{t('Webhook 配置')}</SectionTitle>
                    <SectionDescription>
                      {t(
                        '只支持HTTPS，系统将以POST方式发送通知，请确保地址可以接收POST请求',
                      )}
                    </SectionDescription>
                    <div className='mt-4 space-y-4'>
                      <div>
                        <FieldLabel>{t('Webhook地址')}</FieldLabel>
                        <StyledInput
                          value={settings.webhook_url}
                          onChange={(val) => handleChange('webhook_url', val)}
                          placeholder={t(
                            '请输入Webhook地址，例如: https://example.com/webhook',
                          )}
                        />
                      </div>
                      <div>
                        <FieldLabel>{t('接口凭证')}</FieldLabel>
                        <StyledInput
                          value={settings.webhook_secret}
                          onChange={(val) =>
                            handleChange('webhook_secret', val)
                          }
                          placeholder={t('请输入密钥')}
                        />
                        <div
                          className='mt-2'
                          style={{
                            color: 'var(--ps-text-2)',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                          }}
                        >
                          {t(
                            '密钥将以Bearer方式添加到请求头中，用于验证webhook请求的合法性',
                          )}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>{t('Webhook请求结构说明')}</FieldLabel>
                        <div style={{ height: '200px', marginBottom: '12px' }}>
                          <CodeViewer
                            content={{
                              type: 'quota_exceed',
                              title: '额度预警通知',
                              content:
                                '您的额度即将用尽，当前剩余额度为 {{value}}',
                              values: ['$0.99'],
                              timestamp: 1739950503,
                            }}
                            title='webhook'
                            language='json'
                          />
                        </div>
                        <div
                          className='text-xs leading-relaxed'
                          style={{ color: 'var(--ps-text-2)' }}
                        >
                          <div>
                            <strong>type:</strong>{' '}
                            {t('通知类型 (quota_exceed: 额度预警)')}
                          </div>
                          <div>
                            <strong>title:</strong> {t('通知标题')}
                          </div>
                          <div>
                            <strong>content:</strong>{' '}
                            {t('通知内容，支持 {{value}} 变量占位符')}
                          </div>
                          <div>
                            <strong>values:</strong>{' '}
                            {t('按顺序替换content中的变量占位符')}
                          </div>
                          <div>
                            <strong>timestamp:</strong> {t('Unix时间戳')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === Section 4: Bark 配置 === */}
              {settings.notify_type === 'bark' && (
                <>
                  <div className='my-6 md:my-[36px]'>
                    <Divider />
                  </div>
                  <div>
                    <SectionTitle>{t('Bark 配置')}</SectionTitle>
                    <SectionDescription>
                      {t(
                        '支持HTTP和HTTPS，模板变量: {{title}} (通知标题), {{content}} (通知内容)',
                      )}
                    </SectionDescription>
                    <div className='mt-4'>
                      <FieldLabel>{t('Bark推送URL')}</FieldLabel>
                      <StyledInput
                        value={settings.bark_url}
                        onChange={(val) => handleChange('bark_url', val)}
                        placeholder={t(
                          '请输入Bark推送URL，例如: https://api.day.app/yourkey/{{title}}/{{content}}',
                        )}
                      />
                    </div>
                    <div
                      className='mt-4 p-4 rounded-xl'
                      style={{
                        background: 'var(--ps-bg)',
                        outline: '1px solid var(--ps-outline)',
                        outlineOffset: '-1px',
                      }}
                    >
                      <div
                        className='mb-3'
                        style={{
                          color: 'var(--ps-text)',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {t('模板示例')}
                      </div>
                      <div
                        className='font-mono p-3 rounded-lg mb-4 overflow-x-auto'
                        style={{
                          background: 'var(--ps-input-bg)',
                          fontSize: '12px',
                          color: 'var(--ps-text-2)',
                          outline: '1px solid var(--ps-outline)',
                          outlineOffset: '-1px',
                        }}
                      >
                        https://api.day.app/yourkey/{'{title}'}/{'{content}'}
                        ?sound=alarm&group=quota
                      </div>
                      <div
                        className='space-y-2'
                        style={{
                          color: 'var(--ps-text-2)',
                          fontSize: '13px',
                        }}
                      >
                        <div>
                          • <strong>{'title'}:</strong> {t('通知标题')}
                        </div>
                        <div>
                          • <strong>{'content'}:</strong> {t('通知内容')}
                        </div>
                        <div className='pt-3 mt-3' style={{ borderTop: '1px solid var(--ps-divider)' }}>
                          <span style={{ color: 'var(--ps-text-2)' }}>
                            {t('更多参数请参考')}
                          </span>{' '}
                          <a
                            href='https://github.com/Finb/Bark'
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{
                              color: '#8164FF',
                              fontWeight: 500,
                            }}
                          >
                            Bark {t('官方文档')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === Section 5: Gotify 配置 === */}
              {settings.notify_type === 'gotify' && (
                <>
                  <div className='my-6 md:my-[36px]'>
                    <Divider />
                  </div>
                  <div>
                    <SectionTitle>{t('Gotify 配置')}</SectionTitle>
                    <SectionDescription>
                      {t(
                        '支持HTTP和HTTPS，填写Gotify服务器的完整URL地址',
                      )}
                    </SectionDescription>
                    <div className='mt-4 space-y-4'>
                      <div>
                        <FieldLabel>{t('Gotify服务器地址')}</FieldLabel>
                        <StyledInput
                          value={settings.gotify_url}
                          onChange={(val) => handleChange('gotify_url', val)}
                          placeholder={t(
                            '请输入Gotify服务器地址，例如: https://gotify.example.com',
                          )}
                        />
                      </div>
                      <div>
                        <FieldLabel>{t('Gotify应用令牌')}</FieldLabel>
                        <StyledInput
                          value={settings.gotify_token}
                          onChange={(val) => handleChange('gotify_token', val)}
                          placeholder={t('请输入Gotify应用令牌')}
                        />
                      </div>
                      <div>
                        <FieldLabel>{t('消息优先级')}</FieldLabel>
                        <Select
                          value={Number(settings.gotify_priority) || 5}
                          onChange={(val) => handleChange('gotify_priority', val)}
                          style={{ width: '100%' }}
                          optionList={[
                            { value: 0, label: t('0 - 最低') },
                            { value: 2, label: t('2 - 低') },
                            { value: 5, label: t('5 - 正常（默认）') },
                            { value: 8, label: t('8 - 高') },
                            { value: 10, label: t('10 - 最高') },
                          ]}
                        />
                        <div
                          className='mt-2'
                          style={{
                            color: 'var(--ps-text-2)',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                          }}
                        >
                          {t('消息优先级，范围0-10，默认为5')}
                        </div>
                      </div>
                      <div
                        className='p-4 rounded-xl'
                        style={{
                          background: 'var(--ps-bg)',
                          outline: '1px solid var(--ps-outline)',
                          outlineOffset: '-1px',
                        }}
                      >
                        <div
                          className='mb-3'
                          style={{
                            color: 'var(--ps-text)',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                          }}
                        >
                          {t('配置说明')}
                        </div>
                        <div
                          className='space-y-2'
                          style={{
                            color: 'var(--ps-text-2)',
                            fontSize: '13px',
                          }}
                        >
                          <div>1. {t('在Gotify服务器的应用管理中创建新应用')}</div>
                          <div>
                            2.{' '}
                            {t(
                              '复制应用的令牌（Token）并填写到上方的应用令牌字段',
                            )}
                          </div>
                          <div>3. {t('填写Gotify服务器的完整URL地址')}</div>
                          <div className='pt-3 mt-3' style={{ borderTop: '1px solid var(--ps-divider)' }}>
                            <span style={{ color: 'var(--ps-text-2)' }}>
                              {t('更多信息请参考')}
                            </span>{' '}
                            <a
                              href='https://gotify.net/'
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{
                                color: '#8164FF',
                                fontWeight: 500,
                              }}
                            >
                              Gotify {t('官方文档')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === Section 6: 上游模型更新通知 (仅管理员) === */}
              {isAdminOrRoot && (
                <>
                  <div className='my-6 md:my-[36px]'>
                    <Divider />
                  </div>
                  <div>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <SectionTitle>
                          {t('接收上游模型更新通知')}
                        </SectionTitle>
                        <SectionDescription>
                          {t(
                            '仅管理员可用。开启后，当系统定时检测全部渠道发现上游模型变更或检测异常时，将按你选择的通知方式发送汇总通知；渠道或模型过多时会自动省略部分明细。',
                          )}
                        </SectionDescription>
                      </div>
                      <div className='flex-shrink-0 mt-1'>
                        <Switch
                          checked={settings.upstream_model_update_notify_enabled}
                          onChange={(checked) =>
                            handleChange(
                              'upstream_model_update_notify_enabled',
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 保存按钮 */}
              <div className='mt-6 md:mt-[24px] flex md:justify-end'>
                <SaveButton onClick={handleSave} loading={saving}>
                  {t('保存设置')}
                </SaveButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
