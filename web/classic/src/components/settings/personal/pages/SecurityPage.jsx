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
import { useNavigate } from 'react-router-dom';
import { Input } from '@douyinfe/semi-ui'
import {
  API,
  copy,
  showError,
  showInfo,
  showSuccess,
  setStatusData,
  setUserData,
  prepareCredentialCreationOptions,
  buildRegistrationResult,
  isPasskeySupported,
} from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { useActualTheme } from '../../../../context/Theme';
import { useTranslation } from 'react-i18next';

import TwoFASetting from '../components/TwoFASetting';
import SubPageBreadcrumb from '../components/SubPageBreadcrumb';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import AccountDeleteModal from '../modals/AccountDeleteModal';
import SecureVerificationModal from '../../../common/modals/SecureVerificationModal';
import { useSecureVerification } from '../../../../hooks/common/useSecureVerification';

// 亮色主题图标
import circleBg from '../../../../assets/personal/security/8.svg';
import keyIcon from '../../../../assets/personal/security/7.svg';
import lockIcon from '../../../../assets/personal/security/9.svg';
import passkeyIcon from '../../../../assets/personal/security/11.svg';
import trashIcon from '../../../../assets/personal/security/15.svg';
import chevronRight from '../../../../assets/personal/security/4.svg';

// 深色主题图标
import darkCircle1 from '../../../../assets/personal/security/dark-circle-1.svg';
import darkIcon1 from '../../../../assets/personal/security/dark-icon-1.svg';
import darkCircle2 from '../../../../assets/personal/security/dark-circle-2.svg';
import darkIcon2 from '../../../../assets/personal/security/dark-icon-2.svg';
import darkCircle3 from '../../../../assets/personal/security/dark-circle-3.svg';
import darkIcon3 from '../../../../assets/personal/security/dark-icon-3.svg';
import darkCircle4 from '../../../../assets/personal/security/dark-circle-4.svg';
import darkIcon4 from '../../../../assets/personal/security/dark-icon-4.svg';
import darkChevronRight from '../../../../assets/personal/security/dark-chevron-right.svg';
import ModalPro from '@/components/common/ui/ModalPro';

// 可复用的安全设置行组件
const SecurityRow = ({ icon, title, description, children, maxWidth, circleBgIcon = circleBg }) => (
  <div className='py-6 px-4 md:py-[36px] md:pl-[66px] md:pr-[57px]'>
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4'>
      {/* 左侧：图标 + 标题 + 描述 */}
      <div className='flex items-center gap-3 flex-1 min-w-0 md:ml-[20px]'>
        {/* 图标 */}
        <div className='relative flex-shrink-0' style={{ width: '48px', height: '48px' }}>
          <img src={circleBgIcon} alt='' style={{ width: '48px', height: '48px' }} />
          <div className='absolute inset-0 flex items-center justify-center'>
            <img src={icon} alt='' style={{ maxWidth: '36px', maxHeight: '36px' }} />
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
const ActionButton = ({ children, onClick, disabled, loading, chevronIcon = chevronRight }) => (
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
    <img src={chevronIcon} alt='' style={{ width: '16px', height: '16px' }} />
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

const SecurityPage = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const actualTheme = useActualTheme();
  const isDark = actualTheme === 'dark';

  // 主题感知图标
  const icons = isDark
    ? {
        circle1: darkCircle1,
        icon1: darkIcon1,
        circle2: darkCircle2,
        icon2: darkIcon2,
        circle3: darkCircle3,
        icon3: darkIcon3,
        circle4: darkCircle4,
        icon4: darkIcon4,
        chevron: darkChevronRight,
      }
    : {
        circle1: circleBg,
        icon1: keyIcon,
        circle2: circleBg,
        icon2: lockIcon,
        circle3: circleBg,
        icon3: passkeyIcon,
        circle4: circleBg,
        icon4: trashIcon,
        chevron: chevronRight,
      };

  const [inputs, setInputs] = useState({
    self_account_deletion_confirmation: '',
    original_password: '',
    set_new_password: '',
    set_new_password_confirmation: '',
  });
  const [status, setStatus] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [systemToken, setSystemToken] = useState('');
  const [passkeyStatus, setPasskeyStatus] = useState({ enabled: false });
  const [passkeyRegisterLoading, setPasskeyRegisterLoading] = useState(false);
  const [passkeyDeleteLoading, setPasskeyDeleteLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [
    passkeyRequiredVerificationMethod,
    setPasskeyRequiredVerificationMethod,
  ] = useState(null);

  const {
    isModalVisible: isPasskeyVerificationModalVisible,
    verificationMethods: passkeyVerificationMethods,
    verificationState: passkeyVerificationState,
    startVerification: startPasskeyVerification,
    executeVerification: executePasskeyVerification,
    cancelVerification: cancelPasskeyVerification,
    setVerificationCode: setPasskeyVerificationCode,
    switchVerificationMethod: switchPasskeyVerificationMethod,
    checkVerificationMethods: checkPasskeyVerificationMethods,
  } = useSecureVerification({
    onSuccess: () => {
      setPasskeyRequiredVerificationMethod(null);
    },
  });

  const visiblePasskeyVerificationMethods = passkeyRequiredVerificationMethod
    ? {
        ...passkeyVerificationMethods,
        has2FA:
          passkeyRequiredVerificationMethod === '2fa' &&
          passkeyVerificationMethods.has2FA,
        hasPasskey:
          passkeyRequiredVerificationMethod === 'passkey' &&
          passkeyVerificationMethods.hasPasskey,
      }
    : passkeyVerificationMethods;

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

    isPasskeySupported()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false));
  }, []);

  const getUserData = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      setUserData(data);
      await loadPasskeyStatus();
    } else {
      showError(message);
    }
  };

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const generateAccessToken = async () => {
    const res = await API.get('/api/user/token');
    const { success, message, data } = res.data;
    if (success) {
      setSystemToken(data);
      await copy(data);
      showSuccess(t('令牌已重置并已复制到剪贴板'));
    } else {
      showError(message);
    }
  };

  const handleSystemTokenClick = async (e) => {
    e.target.select();
    await copy(e.target.value);
    showSuccess(t('系统令牌已复制到剪切板'));
  };

  const loadPasskeyStatus = async () => {
    try {
      const res = await API.get('/api/user/passkey');
      const { success, data, message } = res.data;
      if (success) {
        setPasskeyStatus({
          enabled: data?.enabled || false,
          last_used_at: data?.last_used_at || null,
          backup_eligible: data?.backup_eligible || false,
          backup_state: data?.backup_state || false,
        });
      } else {
        showError(message);
      }
    } catch (error) {
      // 忽略错误，保留默认状态
    }
  };

  const startPasskeyManagementVerification = async (apiCall, options = {}) => {
    const methods = await checkPasskeyVerificationMethods();
    const requiredMethod = methods.has2FA
      ? '2fa'
      : methods.hasPasskey
        ? 'passkey'
        : null;

    if (!requiredMethod) {
      showError(t('您需要先启用两步验证或 Passkey 才能执行此操作'));
      return;
    }

    if (requiredMethod === 'passkey' && !methods.passkeySupported) {
      showInfo(t('当前设备不支持 Passkey'));
      return;
    }

    setPasskeyRequiredVerificationMethod(requiredMethod);
    await startPasskeyVerification(apiCall, {
      preferredMethod: requiredMethod,
      title: t('安全验证'),
      ...options,
    });
  };

  const startPasskeyRegistration = async () => {
    const methods = await checkPasskeyVerificationMethods();
    if (!methods.has2FA) {
      try {
        await registerPasskey();
      } catch (error) {
        showError(error.message || t('Passkey 注册失败，请重试'));
      }
      return;
    }

    setPasskeyRequiredVerificationMethod('2fa');
    await startPasskeyVerification(registerPasskey, {
      preferredMethod: '2fa',
      title: t('安全验证'),
    });
  };

  const registerPasskey = async () => {
    setPasskeyRegisterLoading(true);
    try {
      const beginRes = await API.post('/api/user/passkey/register/begin');
      const { success, message, data } = beginRes.data;
      if (!success) {
        throw new Error(message || t('无法发起 Passkey 注册'));
      }

      const publicKey = prepareCredentialCreationOptions(
        data?.options || data?.publicKey || data,
      );
      const credential = await navigator.credentials.create({ publicKey });
      const payload = buildRegistrationResult(credential);
      if (!payload) {
        throw new Error(t('Passkey 注册失败，请重试'));
      }

      const finishRes = await API.post(
        '/api/user/passkey/register/finish',
        payload,
      );
      if (!finishRes.data.success) {
        throw new Error(
          finishRes.data.message || t('Passkey 注册失败，请重试'),
        );
      }

      showSuccess(t('Passkey 注册成功'));
      await loadPasskeyStatus();
      return finishRes.data;
    } catch (error) {
      if (error?.name === 'AbortError') {
        showInfo(t('已取消 Passkey 注册'));
        return { cancelled: true };
      }
      throw new Error(error?.message || t('Passkey 注册失败，请重试'));
    } finally {
      setPasskeyRegisterLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!passkeySupported || !window.PublicKeyCredential) {
      showInfo(t('当前设备不支持 Passkey'));
      return;
    }
    await startPasskeyRegistration();
  };

  const removePasskey = async () => {
    setPasskeyDeleteLoading(true);
    try {
      const res = await API.delete('/api/user/passkey');
      const { success, message } = res.data;
      if (!success) {
        throw new Error(message || t('操作失败，请重试'));
      }

      showSuccess(t('Passkey 已解绑'));
      await loadPasskeyStatus();
      return res.data;
    } catch (error) {
      throw new Error(error?.message || t('操作失败，请重试'));
    } finally {
      setPasskeyDeleteLoading(false);
    }
  };

  const handleRemovePasskey = async () => {
    await startPasskeyManagementVerification(removePasskey);
  };

  const handlePasskeyVerificationCancel = () => {
    setPasskeyRequiredVerificationMethod(null);
    cancelPasskeyVerification();
  };

  const changePassword = async () => {
    if (inputs.set_new_password === '') {
      showError(t('请输入新密码！'));
      return;
    }
    if (inputs.original_password === inputs.set_new_password) {
      showError(t('新密码需要和原密码不一致！'));
      return;
    }
    if (inputs.set_new_password !== inputs.set_new_password_confirmation) {
      showError(t('两次输入的密码不一致！'));
      return;
    }
    const res = await API.put(`/api/user/self`, {
      original_password: inputs.original_password,
      password: inputs.set_new_password,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('密码修改成功！'));
    } else {
      showError(message);
    }
    setShowChangePasswordModal(false);
  };

  const deleteAccount = async () => {
    if (inputs.self_account_deletion_confirmation !== userState.user.username) {
      showError(t('请输入你的账户名以确认删除！'));
      return;
    }

    const res = await API.delete('/api/user/self');
    const { success, message } = res.data;

    if (success) {
      showSuccess(t('账户已删除！'));
      await API.get('/api/user/logout');
      userDispatch({ type: 'logout' });
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      showError(message);
    }
  };

  const passkeyEnabled = passkeyStatus?.enabled;

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={t('安全设置')} />

          {/* 安全设置主卡片 */}
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
              {/* Row 1: 系统访问令牌 */}
              <div className='py-6 px-4 md:py-[36px] md:pl-[66px] md:pr-[57px]'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4'>
                  {/* 左侧：图标 + 标题 + 描述 */}
                  <div className='flex items-center gap-3 flex-1 min-w-0 md:ml-[20px]'>
                    <div className='relative flex-shrink-0' style={{ width: '48px', height: '48px' }}>
                      <img src={icons.circle1} alt='' style={{ width: '48px', height: '48px' }} />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <img src={icons.icon1} alt='' style={{ width: '36px', height: '36px' }} />
                      </div>
                    </div>
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
                        {t('系统访问令牌')}
                      </div>
                      <div
                        className='mt-1 md:mt-2 md:!text-[16px]'
                        style={{
                          color: 'var(--ps-text-2)',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          maxWidth: '448px',
                        }}
                      >
                        {t('用于API调用的身份验证令牌，请妥善保管')}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0 md:ml-auto'>
                    <ActionButton onClick={generateAccessToken} chevronIcon={icons.chevron}>
                      {systemToken ? t('重新生成') : t('生成令牌')}
                    </ActionButton>
                  </div>
                </div>
                {/* 令牌显示 */}
                {systemToken && (
                  <div className='mt-3 md:ml-[60px]'>
                    <Input
                      readonly
                      value={systemToken}
                      onClick={handleSystemTokenClick}
                      size='large'
                    />
                  </div>
                )}
              </div>

              <Divider />

              {/* Row 2: 密码管理 */}
              <SecurityRow
                icon={icons.icon2}
                circleBgIcon={icons.circle2}
                title={t('密码管理')}
                description={t('定期更改密码可以提高账户安全性')}
              >
                <ActionButton onClick={() => setShowChangePasswordModal(true)} chevronIcon={icons.chevron}>
                  {t('修改密码')}
                </ActionButton>
              </SecurityRow>

              <Divider />

              {/* Row 3: Passkey 登录 */}
              <SecurityRow
                icon={icons.icon3}
                circleBgIcon={icons.circle3}
                title={t('Passkey 登录')}
                description={
                  passkeyEnabled
                    ? t('已启用 Passkey，无需密码即可登录')
                    : t('使用 Passkey 实现免密且更安全的登录体验')
                }
              >
                {passkeyEnabled ? (
                  <ActionButton
                    onClick={() => {
                      ModalPro.confirm({
                        title: t('确认解绑 Passkey'),
                        content: t(
                          '解绑后将无法使用 Passkey 登录，确定要继续吗？',
                        ),
                        okText: t('确认解绑'),
                        cancelText: t('取消'),
                        okType: 'danger',
                        onOk: handleRemovePasskey,
                      });
                    }}
                    loading={passkeyDeleteLoading}
                    chevronIcon={icons.chevron}
                  >
                    {t('解绑Passkey')}
                  </ActionButton>
                ) : (
                  <ActionButton
                    onClick={handleRegisterPasskey}
                    disabled={!passkeySupported}
                    loading={passkeyRegisterLoading}
                    chevronIcon={icons.chevron}
                  >
                    {t('注册Passkey')}
                  </ActionButton>
                )}
              </SecurityRow>

              <Divider />

              {/* Row 4: 两步验证设置 (TwoFASetting 组件) */}
              <TwoFASetting t={t} isDark={isDark} />

              <Divider />

              {/* Row 5: 删除账户 */}
              <SecurityRow
                icon={icons.icon4}
                circleBgIcon={icons.circle4}
                title={t('删除账户')}
                description={t('此操作不可逆，所有数据将被永久删除')}
              >
                <ActionButton onClick={() => setShowAccountDeleteModal(true)} chevronIcon={icons.chevron}>
                  {t('删除账户')}
                </ActionButton>
              </SecurityRow>
            </div>
          </div>
        </div>
      </div>

      {/* 模态框组件 */}
      <ChangePasswordModal
        t={t}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        changePassword={changePassword}
        turnstileEnabled={turnstileEnabled}
        turnstileSiteKey={turnstileSiteKey}
        setTurnstileToken={setTurnstileToken}
      />

      <AccountDeleteModal
        t={t}
        showAccountDeleteModal={showAccountDeleteModal}
        setShowAccountDeleteModal={setShowAccountDeleteModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        deleteAccount={deleteAccount}
        userState={userState}
        turnstileEnabled={turnstileEnabled}
        turnstileSiteKey={turnstileSiteKey}
        setTurnstileToken={setTurnstileToken}
      />

      <SecureVerificationModal
        visible={isPasskeyVerificationModalVisible}
        verificationMethods={visiblePasskeyVerificationMethods}
        verificationState={passkeyVerificationState}
        onVerify={executePasskeyVerification}
        onCancel={handlePasskeyVerificationCancel}
        onCodeChange={setPasskeyVerificationCode}
        onMethodSwitch={switchPasskeyVerificationMethod}
        title={passkeyVerificationState.title}
        description={passkeyVerificationState.description}
      />
    </div>
  );
};

export default SecurityPage;
