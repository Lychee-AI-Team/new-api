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
import { API, showError, setStatusData, setUserData } from '../../helpers';
import { UserContext } from '../../context/User';
import { useTranslation } from 'react-i18next';

// 导入子组件
import UserInfoHeader from './personal/components/UserInfoHeader';
import AccountManagement from './personal/cards/AccountManagement';
import PreferencesSettings from './personal/cards/PreferencesSettings';
import OtherSettings from './personal/cards/OtherSettings';

const PersonalSetting = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const { t } = useTranslation();
  const [status, setStatus] = useState({});

  useEffect(() => {
    let saved = localStorage.getItem('status');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStatus(parsed);
    }
    // Always refresh status from server to avoid stale flags
    (async () => {
      try {
        const res = await API.get('/api/status');
        const { success, data } = res.data;
        if (success && data) {
          setStatus(data);
          setStatusData(data);
        }
      } catch (e) {
        // ignore and keep local status
      }
    })();

    getUserData();
  }, []);

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

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2 flex flex-col gap-4 md:gap-6'>
          {/* 顶部用户信息区域 */}
          <UserInfoHeader t={t} userState={userState} />

          {/* 签到日历 - 仅在启用时显示 */}
          {status?.checkin_enabled && (
            <div>
              {/* CheckinCalendar removed - will be re-added as separate page */}
            </div>
          )}

          {/* 账户管理 */}
          <AccountManagement t={t} />

          {/* 其他设置 */}
          <OtherSettings t={t} />

          {/* 偏好设置 */}
          <PreferencesSettings t={t} />
        </div>
      </div>
    </div>
  );
};

export default PersonalSetting;
