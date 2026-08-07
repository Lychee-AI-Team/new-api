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
import {
  API,
  showError,
  showSuccess,
  showInfo,
  setStatusData,
  setUserData,
  onCustomOAuthClicked,
  getOAuthProviderIcon,
} from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { useTranslation } from 'react-i18next';

import EmailBindModal from '../modals/EmailBindModal';
import WeChatBindModal from '../modals/WeChatBindModal';
import SubPageBreadcrumb from '../components/SubPageBreadcrumb';

// 图标资源
import circleBg from '../../../../assets/personal/security/8.svg';
import chevronRight from '../../../../assets/personal/security/4.svg';
import wechatIcon from '../../../../assets/personal/binding/wechat.svg';
import ModalPro from '@/components/common/ui/ModalPro';

// 可复用的绑定行组件
const BindingRow = ({ icon, title, description, children, maxWidth }) => (
  <div className='py-6 px-4 md:py-[36px] md:pl-[66px] md:pr-[57px]'>
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4'>
      {/* 左侧：图标 + 标题 + 描述 */}
      <div className='flex items-center gap-3 flex-1 min-w-0 md:ml-[20px]'>
        {/* 图标 */}
        <div className='relative flex-shrink-0' style={{ width: '48px', height: '48px' }}>
          <img src={circleBg} alt='' style={{ width: '48px', height: '48px' }} />
          <div className='absolute inset-0 flex items-center justify-center'>
            {icon}
          </div>
        </div>

        {/* 标题 + 描述 */}
        <div className='flex-1 min-w-0'>
          <div
            style={{
              color: 'var(--ps-text)',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}
            className='md:!text-[20px]'
          >
            {title}
          </div>
          <div
            className='mt-1 md:mt-2 md:!text-[16px]'
            style={{
              color: 'var(--ps-text-2)',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              maxWidth: maxWidth || '448px',
            }}
          >
            {description}
          </div>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className='flex-shrink-0 md:ml-auto'>{children}</div>
    </div>
  </div>
);

// 可复用的操作按钮
const ActionButton = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className='flex items-center justify-center gap-1 transition-all duration-200 hover:opacity-80 disabled:opacity-50 w-full md:!w-[166px]'
    style={{
      height: '50px',
      background: 'var(--ps-btn-bg)',
      borderRadius: '10px',
      outline: '1px solid var(--ps-outline)',
      outlineOffset: '-1px',
      color: 'var(--ps-btn-text)',
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
    }}
  >
    <span>{children}</span>
    <img src={chevronRight} alt='' style={{ width: '16px', height: '16px' }} />
  </button>
);

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

const AccountBindingPage = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const { t } = useTranslation();

  const [inputs, setInputs] = useState({
    wechat_verification_code: '',
    email_verification_code: '',
    email: '',
  });
  const [status, setStatus] = useState({});
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);
  const [showWeChatBindModal, setShowWeChatBindModal] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [customOAuthBindings, setCustomOAuthBindings] = useState([]);
  const [customOAuthLoading, setCustomOAuthLoading] = useState({});

  useEffect(() => {
    let saved = localStorage.getItem('status');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStatus(parsed);
      if (parsed.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(parsed.turnstile_site_key);
      }
    }
    (async () => {
      try {
        const res = await API.get('/api/status');
        const { success, data } = res.data;
        if (success && data) {
          setStatus(data);
          setStatusData(data);
          if (data.turnstile_check) {
            setTurnstileEnabled(true);
            setTurnstileSiteKey(data.turnstile_site_key);
          }
        }
      } catch (e) {
        // ignore
      }
    })();

    getUserData();
    loadCustomOAuthBindings();
  }, []);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  const getUserData = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      setUserData(data);
    } else {
      showError(message);
    }
  };

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const sendVerificationCode = async () => {
    if (inputs.email === '') {
      showError(t('请输入邮箱！'));
      return;
    }
    setDisableButton(true);
    if (turnstileEnabled && turnstileToken === '') {
      showInfo(t('请稍后几秒重试，Turnstile 正在检查用户环境！'));
      return;
    }
    setLoading(true);
    const res = await API.get(
      `/api/verification?email=${inputs.email}&turnstile=${turnstileToken}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('验证码发送成功，请检查邮箱！'));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const bindEmail = async () => {
    if (inputs.email_verification_code === '') {
      showError(t('请输入邮箱验证码！'));
      return;
    }
    setLoading(true);
    const res = await API.post('/api/oauth/email/bind', {
      email: inputs.email,
      code: inputs.email_verification_code,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('邮箱账户绑定成功！'));
      setShowEmailBindModal(false);
      userState.user.email = inputs.email;
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const bindWeChat = async () => {
    if (inputs.wechat_verification_code === '') return;
    const res = await API.post('/api/oauth/wechat/bind', {
      code: inputs.wechat_verification_code,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('微信账户绑定成功！'));
      setShowWeChatBindModal(false);
    } else {
      showError(message);
    }
  };

  // Custom OAuth bindings
  const loadCustomOAuthBindings = async () => {
    try {
      const res = await API.get('/api/user/oauth/bindings');
      if (res.data.success) {
        setCustomOAuthBindings(res.data.data || []);
      } else {
        showError(res.data.message || t('获取绑定信息失败'));
      }
    } catch (error) {
      showError(
        error.response?.data?.message || error.message || t('获取绑定信息失败'),
      );
    }
  };

  const handleUnbindCustomOAuth = async (providerId, providerName) => {
    ModalPro.confirm({
      title: t('确认解绑'),
      content: t('确定要解绑 {{name}} 吗？', { name: providerName }),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: async () => {
        setCustomOAuthLoading((prev) => ({ ...prev, [providerId]: true }));
        try {
          const res = await API.delete(
            `/api/user/oauth/bindings/${providerId}`,
          );
          if (res.data.success) {
            showSuccess(t('解绑成功'));
            await loadCustomOAuthBindings();
          } else {
            showError(res.data.message);
          }
        } catch (error) {
          showError(
            error.response?.data?.message || error.message || t('操作失败'),
          );
        } finally {
          setCustomOAuthLoading((prev) => ({ ...prev, [providerId]: false }));
        }
      },
    });
  };

  const handleBindCustomOAuth = (provider) => {
    onCustomOAuthClicked(provider);
  };

  const isCustomOAuthBound = (providerId) => {
    const normalizedId = Number(providerId);
    return customOAuthBindings.some(
      (b) => Number(b.provider_id) === normalizedId,
    );
  };

  const getCustomOAuthBinding = (providerId) => {
    const normalizedId = Number(providerId);
    return customOAuthBindings.find(
      (b) => Number(b.provider_id) === normalizedId,
    );
  };

  const isBound = (accountId) => Boolean(accountId);

  // 渲染自定义 OAuth 图标
  const renderCustomOAuthIcon = (provider, binding) => (
    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {getOAuthProviderIcon(
        provider.icon || binding?.provider_icon || '',
        28,
      )}
    </div>
  );

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={t('账户绑定')} />

          {/* 账户绑定主卡片 */}
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
            <div className='px-4 md:px-[73px]'>
              {/* Row 1: 微信绑定 */}
              <BindingRow
                icon={
                  <img src={wechatIcon} alt='' style={{ width: '36px', height: '36px' }} />
                }
                title={t('微信')}
                description={
                  !status.wechat_login
                    ? t('未启用')
                    : isBound(userState.user?.wechat_id)
                      ? t('已绑定')
                      : t('未绑定')
                }
              >
                <ActionButton
                  onClick={() => setShowWeChatBindModal(true)}
                  disabled={!status.wechat_login}
                >
                  {isBound(userState.user?.wechat_id)
                    ? t('修改绑定')
                    : status.wechat_login
                      ? t('绑定')
                      : t('未启用')}
                </ActionButton>
              </BindingRow>

              {/* 自定义 OAuth 提供商绑定 */}
              {status.custom_oauth_providers &&
                status.custom_oauth_providers.map((provider) => {
                  const bound = isCustomOAuthBound(provider.id);
                  const binding = getCustomOAuthBinding(provider.id);
                  return (
                    <React.Fragment key={provider.slug}>
                      <Divider />
                      <BindingRow
                        icon={renderCustomOAuthIcon(provider, binding)}
                        title={provider.name}
                        description={
                          bound
                            ? t('已绑定')
                            : t('未绑定')
                        }
                      >
                        {bound ? (
                          <ActionButton
                            onClick={() =>
                              handleUnbindCustomOAuth(
                                provider.id,
                                provider.name,
                              )
                            }
                            loading={customOAuthLoading[provider.id]}
                          >
                            {t('解绑')}
                          </ActionButton>
                        ) : (
                          <ActionButton
                            onClick={() => handleBindCustomOAuth(provider)}
                          >
                            {t('绑定')}
                          </ActionButton>
                        )}
                      </BindingRow>
                    </React.Fragment>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 模态框组件 */}
      <EmailBindModal
        t={t}
        showEmailBindModal={showEmailBindModal}
        setShowEmailBindModal={setShowEmailBindModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        sendVerificationCode={sendVerificationCode}
        bindEmail={bindEmail}
        disableButton={disableButton}
        loading={loading}
        countdown={countdown}
        turnstileEnabled={turnstileEnabled}
        turnstileSiteKey={turnstileSiteKey}
        setTurnstileToken={setTurnstileToken}
      />

      <WeChatBindModal
        t={t}
        showWeChatBindModal={showWeChatBindModal}
        setShowWeChatBindModal={setShowWeChatBindModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        bindWeChat={bindWeChat}
        status={status}
      />
    </div>
  );
};

export default AccountBindingPage;
