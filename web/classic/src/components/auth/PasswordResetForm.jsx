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

import React, { useEffect, useState } from 'react';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  getSystemName,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import { Button, Form } from '@douyinfe/semi-ui';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import { IconMail } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PasswordResetForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
  });
  const { email } = inputs;

  const [loading, setLoading] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
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

  function handleChange(value) {
    setInputs((inputs) => ({ ...inputs, email: value }));
  }

  async function handleSubmit(e) {
    if (!email) {
      showError(t('请输入邮箱地址'));
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo(t('请稍后几秒重试，Turnstile 正在检查用户环境！'));
      return;
    }
    setDisableButton(true);
    setLoading(true);
    const res = await API.get(
      `/api/reset_password?email=${email}&turnstile=${turnstileToken}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('重置邮件发送成功，请检查邮箱！'));
      setInputs({ ...inputs, email: '' });
    } else {
      showError(message);
    }
    setLoading(false);
  }

  return (
    <div
      className='login-page relative overflow-hidden flex items-center justify-center min-h-screen'
      style={{
        background: 'var(--login-bg)',
      }}
    >
      <div className='w-full max-w-sm'>
        {/* Logo 和系统名称 */}
        <div className='flex items-center justify-center mb-6 gap-2'>
          <img src={logo} alt='Logo' className='h-10 rounded-full' />
          <span
            className='text-2xl font-bold'
            style={{ color: 'var(--login-text-primary)' }}
          >
            {systemName}
          </span>
        </div>

        <div className='flex flex-col items-center'>
          <div className='w-full max-w-[384px]'>
            <div
              className='overflow-hidden'
              style={{
                background: 'var(--login-card-bg)',
                borderRadius: '16px',
                border: '1px solid var(--login-card-border)',
              }}
            >
              <div className='flex justify-center pt-10 pb-2'>
                <span
                  className='text-2xl font-bold'
                  style={{ color: 'var(--login-text-primary)' }}
                >
                  {t('密码重置')}
                </span>
              </div>
              <div className='px-5 py-6'>
                <Form className='space-y-3'>
                  <Form.Input
                    field='email'
                    label={t('邮箱')}
                    placeholder={t('请输入您的邮箱地址')}
                    name='email'
                    value={email}
                    onChange={handleChange}
                    prefix={<IconMail />}
                  />

                  <div className='space-y-2 pt-2'>
                    <Button
                      theme='solid'
                      className='w-full !rounded-full'
                      type='primary'
                      htmlType='submit'
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={disableButton}
                      style={{
                        background:
                          'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
                        color: 'white',
                      }}
                    >
                      {disableButton
                        ? `${t('重试')} (${countdown})`
                        : t('提交')}
                    </Button>
                  </div>
                </Form>

                <div className='mt-6 text-center text-sm'>
                  <Text style={{ color: 'var(--login-text-primary)' }}>
                    {t('想起来了？')}{' '}
                    <Link
                      to='/login'
                      style={{ color: 'var(--login-link-color)' }}
                      className='font-medium'
                    >
                      {t('登录')}
                    </Link>
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {turnstileEnabled && (
          <div className='flex justify-center mt-6'>
            <Turnstile
              sitekey={turnstileSiteKey}
              onVerify={(token) => {
                setTurnstileToken(token);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetForm;
