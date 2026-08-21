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
import { Switch } from '@douyinfe/semi-ui';
import {
  API,
  showError,
  showSuccess,
  setUserData,
} from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { useTranslation } from 'react-i18next';

import SubPageBreadcrumb from '../components/SubPageBreadcrumb';

const PrivacyPage = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const { t } = useTranslation();
  const [recordIpLog, setRecordIpLog] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setRecordIpLog(data.record_ip_log || false);
      } else {
        showError(message);
      }
    } catch (error) {
      // ignore
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/api/user/self', {
        record_ip_log: recordIpLog,
      });
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

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={t('隐私设置')} />

          {/* 隐私设置主卡片 */}
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
              {/* 标题行：标题 + 开关 */}
              <div className='flex items-center gap-3'>
                <span
                  className='md:!text-[20px]'
                  style={{
                    color: 'var(--ps-text)',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {t('记录请求与错误日志IP')}
                </span>
                <Switch
                  checked={recordIpLog}
                  onChange={setRecordIpLog}
                />
              </div>

              {/* 描述 */}
              <div
                className='mt-4 md:mt-[14px] md:!text-[16px]'
                style={{
                  color: 'var(--ps-text-2)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  maxWidth: '448px',
                }}
              >
                {t(
                  '开启后，仅"消费"和"错误"日志将记录您的客户端IP地址',
                )}
              </div>

              {/* 保存按钮 */}
              <div className='mt-6 md:mt-[60px] flex md:justify-end'>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className='flex items-center justify-center transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full md:!w-[98px]'
                  style={{
                    height: '38px',
                    background:
                      'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
                    borderRadius: '10px',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {t('保存设置')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
