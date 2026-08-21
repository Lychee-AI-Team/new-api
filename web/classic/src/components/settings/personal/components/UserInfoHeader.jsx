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
import {
  isRoot,
  isAdmin,
  renderQuota,
  stringToColor,
} from '../../../../helpers';
import headerBg from '../../../../assets/personal/11.png';

const UserInfoHeader = ({ t, userState }) => {
  const getUsername = () => {
    if (userState.user) {
      return userState.user.username;
    } else {
      return 'null';
    }
  };

  const getAvatarText = () => {
    const username = getUsername();
    if (username && username.length > 0) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'NA';
  };

  const getRoleLabel = () => {
    if (isRoot()) return t('超级管理员');
    if (isAdmin()) return t('管理员');
    return t('普通用户');
  };

  return (
    <div
      className='relative w-full overflow-hidden'
      style={{
        borderRadius: '16px',
        outline: '1px solid var(--ps-outline)',
        outlineOffset: '-1px',
      }}
    >
      {/* 上半部分：渐变背景 + 用户信息 */}
      <div
        className='relative w-full'
        style={{
          height: '128px',
          backgroundImage: `linear-gradient(180deg, rgba(111,125,248,0.40) 0%, rgba(96,186,228,0.40) 100%), url(${headerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute flex items-center gap-3' style={{ left: '24px', top: '32px' }}>
          {/* 头像 */}
          <div
            className='flex items-center justify-center flex-shrink-0'
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '36px',
              background: 'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {getAvatarText()}
            </span>
          </div>

          {/* 用户名 + 标签 */}
          <div className='flex flex-col gap-3 min-w-0'>
            <div
              className='truncate'
              style={{
                color: 'white',
                fontSize: '30px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {getUsername()}
            </div>
            <div className='flex items-center gap-2'>
              <span
                className='inline-flex items-center justify-center'
                style={{
                  height: '24px',
                  padding: '0 8px',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {getRoleLabel()}
              </span>
              <span
                className='inline-flex items-center justify-center'
                style={{
                  height: '24px',
                  padding: '0 8px',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}
              >
                ID: {userState?.user?.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 下半部分：余额和统计信息 */}
      <div
        className='relative w-full'
        style={{
          background: 'var(--ps-bottom-bg)',
          padding: '25px',
        }}
      >
        <div className='flex flex-wrap items-center justify-between gap-4'>
          {/* 左侧：账户余额 */}
          <div className='flex flex-col gap-2'>
            <span
              style={{
                color: 'var(--ps-text-label)',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              {t('账户余额（元）')}
            </span>
            <span
              style={{
                background:
                  'linear-gradient(90deg, rgba(99,93,231,1) 0%, rgba(129,203,250,1) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                fontSize: '36px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.90px',
              }}
            >
              {renderQuota(userState?.user?.quota)}
            </span>
          </div>

          {/* 右侧：历史消耗 | 请求次数 | 用户分组 */}
          <div className='flex items-center gap-4 md:gap-10 mr-[10px]'>
            {/* 历史消耗 */}
            <div className='flex flex-col gap-2'>
              <span
                style={{
                  color: 'var(--ps-text-label)',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                {t('历史消耗')}
              </span>
              <span
                style={{
                  background:
                    'linear-gradient(90deg, rgba(99,93,231,1) 0%, rgba(129,203,250,1) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  fontSize: '20px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.90px',
                }}
              >
                {renderQuota(userState?.user?.used_quota)}
              </span>
            </div>

            {/* 分隔线 */}
            <div
              className='hidden sm:block'
              style={{
                width: '1px',
                height: '48px',
                background: 'var(--ps-divider)',
                flexShrink: 0,
              }}
            />

            {/* 请求次数 */}
            <div className='flex flex-col gap-2'>
              <span
                style={{
                  color: 'var(--ps-text-label)',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                {t('请求次数')}
              </span>
              <span
                style={{
                  background:
                    'linear-gradient(90deg, rgba(99,93,231,1) 0%, rgba(129,203,250,1) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  fontSize: '20px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.90px',
                }}
              >
                {userState.user?.request_count || 0}
              </span>
            </div>

            {/* 分隔线 */}
            <div
              className='hidden sm:block'
              style={{
                width: '1px',
                height: '48px',
                background: 'var(--ps-divider)',
                flexShrink: 0,
              }}
            />

            {/* 用户分组 */}
            <div className='flex flex-col gap-2'>
              <span
                style={{
                  color: 'var(--ps-text-label)',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                {t('用户分组')}
              </span>
              <span
                style={{
                  background:
                    'linear-gradient(90deg, rgba(99,93,231,1) 0%, rgba(129,203,250,1) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  fontSize: '20px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.90px',
                }}
              >
                {userState?.user?.group || t('default')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoHeader;
