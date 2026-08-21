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
import { useNavigate } from 'react-router-dom';
import sectionIcon from '../../../../assets/personal/3.svg';
import chevronRight from '../../../../assets/personal/1.svg';

const AccountManagement = ({ t }) => {
  const navigate = useNavigate();

  const items = [
    {
      title: t('账户绑定'),
      desc: t('绑定第三方账号，便捷登录'),
      path: '/console/personal/account-binding',
    },
    {
      title: t('安全设置'),
      desc: t('密码修改、2FA验证等安全设置'),
      path: '/console/personal/security',
    },
  ];

  return (
    <div
      className='relative w-full'
      style={{
        background: 'var(--ps-bg)',
        borderRadius: '12px',
        outline: '1px solid var(--ps-outline)',
        outlineOffset: '-1px',
        backdropFilter: 'blur(9px)',
        boxShadow:
          '0px 4px 8px rgba(106,58,199,0.08), inset -4px -4px 4px rgba(255,255,255,0.25), inset 0px 4px 4px rgba(255,255,255,0.25)',
      }}
    >
      {/* Section header */}
      <div className='absolute' style={{ left: '22px', top: '20px' }}>
        <img src={sectionIcon} alt='' style={{ width: '36px', height: '36px' }} />
      </div>
      <div style={{ paddingLeft: '77px', paddingTop: '14px' }}>
        <div
          style={{
            color: 'var(--ps-text)',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}
        >
          {t('账户管理')}
        </div>
        <div
          style={{
            color: 'var(--ps-text-2)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            marginTop: '4px',
          }}
        >
          {t('账户绑定、安全设置和身份验证')}
        </div>
      </div>

      {/* Sub-cards */}
      <div
        className='grid grid-cols-1 lg:grid-cols-2 gap-4'
        style={{ padding: '24px' }}
      >
        {items.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className='relative cursor-pointer transition-all duration-200 hover:shadow-md'
            style={{
              height: '84px',
              background: 'var(--ps-bg)',
              borderRadius: '10px',
              outline: '1px solid var(--ps-outline)',
              outlineOffset: '-1px',
              backdropFilter: 'blur(6.25px)',
              boxShadow:
                '0px 4px 8px rgba(106,58,199,0.08), inset -4px -4px 4px rgba(255,255,255,0.25), inset 0px 4px 4px rgba(255,255,255,0.25)',
            }}
          >
            <div className='absolute' style={{ left: '22px', top: '17px', right: '22px' }}>
              <div
                style={{
                  color: 'var(--ps-text)',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  color: 'var(--ps-text-2)',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  marginTop: '15px',
                }}
              >
                {item.desc}
              </div>
            </div>
            <div
              className='absolute'
              style={{ right: '22px', top: '34px' }}
            >
              <img src={chevronRight} alt='' style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountManagement;
