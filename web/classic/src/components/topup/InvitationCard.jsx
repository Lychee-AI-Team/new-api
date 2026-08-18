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
import { Button, Typography } from '@douyinfe/semi-ui';

// 邀请奖励页视觉稿资源
import inviteIcon from '../../assets/figma-invite/1.svg';
import transferIcon from '../../assets/figma-invite/2.svg';
import pendingIncomeIcon from '../../assets/figma-invite/3.svg';
import totalIncomeIcon from '../../assets/figma-invite/4.svg';
import inviteCountIcon from '../../assets/figma-invite/5.svg';
import copyIcon from '../../assets/figma-invite/6.svg';
import registerIcon from '../../assets/figma-invite/7.svg';
import moreRewardIcon from '../../assets/figma-invite/8.svg';
import autoCreditIcon from '../../assets/figma-invite/9.svg';
import statsBg from '../../assets/figma-invite/10.png';
import { useActualTheme } from '../../context/Theme';

const { Text } = Typography;

const WALLET_PRIMARY = '#635DE7';
const WALLET_GRADIENT_BTN =
  'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)';

const SectionTitle = ({ children }) => (
  <div
    style={{
      color: 'var(--ps-text-label)',
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

// 渲染带换行的奖励说明（视觉稿为两行文本）
const RewardDesc = ({ text }) => (
  <>
    {text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 ? <br /> : null}
      </span>
    ))}
  </>
);

const InvitationCard = ({
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  handleAffLinkClick,
}) => {
  const canTransfer = (userState?.user?.aff_quota || 0) > 0;
  // 深色主题下标题/说明文字统一使用 #93A0C5，亮色保持视觉稿原色（JS 控制，随主题切换即时生效）
  const actualTheme = useActualTheme();
  const isDark = actualTheme === 'dark';
  const rewardDescColor = isDark ? '#93A0C5' : '#6D6D78';

  const rewardItems = [
    {
      icon: registerIcon,
      iconSize: 38,
      title: t('邀请好友注册'),
      desc: t('好友通过您的专属链接注册，\n完成注册后即可获得奖励'),
    },
    {
      icon: autoCreditIcon,
      iconSize: 34,
      title: t('收益自动到账'),
      desc: t('通过划转功能将奖励额度转入\n到您的账户余额中'),
    },
    {
      icon: moreRewardIcon,
      iconSize: 34,
      title: t('邀请越多奖励越多'),
      desc: t('邀请的好友越多，您获得的\n奖励越多'),
    },
  ];

  // 统计项
  const stats = [
    { icon: pendingIncomeIcon, label: t('待使用收益'), value: renderQuota(userState?.user?.aff_quota || 0) },
    { icon: totalIncomeIcon, label: t('总收益'), value: renderQuota(userState?.user?.aff_history_quota || 0) },
    { icon: inviteCountIcon, label: t('邀请人数'), value: userState?.user?.aff_count || 0 },
  ];

  return (
    <div className='flex flex-col pt-[14px]'>
      {/* 页面头部 */}
      <div className='flex items-start gap-[19px]'>
        <div
          className='flex items-center justify-center flex-shrink-0'
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            marginTop: '2px',
            background: 'linear-gradient(164deg, #635DE7 0%, #81CBFA 100%)',
            boxShadow:
              '0px 2px 4px -2px rgba(0,0,0,0.10), 0px 4px 6px -1px rgba(0,0,0,0.10)',
          }}
        >
          <img src={inviteIcon} alt='' style={{ width: 16, height: 16 }} />
        </div>
        <div className='min-w-0'>
          <div
            className='truncate'
            style={{
              color: 'var(--ps-text)',
              fontSize: '30px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {t('邀请奖励')}
          </div>
          <div
            style={{
              color: 'var(--ps-text-2)',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              marginTop: '12px',
            }}
          >
            {t('邀请好友获得丰厚奖励')}
          </div>
        </div>
      </div>

      {/* 收益统计 */}
      <div
        className='w-full overflow-hidden mt-9'
        style={{
          borderRadius: '10px',
          backgroundImage: `linear-gradient(0deg, rgba(96,186,228,0.40) 0%, rgba(96,186,228,0.40) 100%), url(${statsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '16px',
        }}
      >
        <div className='flex items-center justify-between'>
          <Text strong style={{ color: 'white', fontSize: '16px' }}>
            {t('收益统计')}
          </Text>
          <button
            type='button'
            disabled={!canTransfer}
            onClick={() => setOpenTransfer(true)}
            style={{
              width: '110px',
              height: '24px',
              borderRadius: '8px',
              background: 'rgba(250,250,250,0.80)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              cursor: canTransfer ? 'pointer' : 'not-allowed',
              opacity: canTransfer ? 1 : 0.5,
            }}
          >
            <img src={transferIcon} alt='' style={{ width: 12, height: 12 }} />
            <span
              style={{
                background:
                  'linear-gradient(180deg, #635DE7 0%, #81CBFA 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              {t('划转到余额')}
            </span>
          </button>
        </div>
        <div className='grid grid-cols-3 gap-6 mt-6'>
          {stats.map((stat, index) => (
            <div className='text-center' key={index}>
              <div
                className='text-base sm:text-[32px] font-bold mb-2'
                style={{ color: 'white', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                {stat.value}
              </div>
              <div className='flex items-center justify-center gap-1'>
                <img src={stat.icon} alt='' style={{ width: 14, height: 14 }} />
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.80)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {stat.label}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 邀请链接 */}
      <div
        className='w-full mt-3'
        style={{
          background: 'var(--ps-bottom-bg)',
          borderRadius: '12px',
          outline: '1px solid var(--ps-outline)',
          outlineOffset: '-1px',
          padding: '24px',
        }}
      >
        <div className='flex flex-wrap items-center' style={{ gap: '16px' }}>
          <div
            className='flex items-center flex-1 min-w-[240px]'
            style={{
              height: '38px',
              background: 'var(--ps-input-bg)',
              borderRadius: '10px',
              outline: '1px solid var(--ps-outline)',
              outlineOffset: '-1px',
              padding: '0 14px',
            }}
          >
            <span
              className='whitespace-nowrap'
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ps-text-label)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('邀请链接')}
            </span>
            <span
              className='truncate ml-[22px]'
              style={{
                fontSize: '14px',
                color: 'var(--ps-text)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {affLink}
            </span>
          </div>
          <Button
            onClick={handleAffLinkClick}
            style={{
              background: WALLET_GRADIENT_BTN,
              border: 'none',
              borderRadius: '10px',
              width: '119px',
              height: '38px',
              padding: '0',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexShrink: 0,
            }}
          >
            <img src={copyIcon} alt='' style={{ width: 14, height: 14 }} />
            {t('复制链接')}
          </Button>
        </div>
      </div>

      {/* 奖励说明 */}
      <div className='w-full mt-8'>
        <SectionTitle>{t('奖励说明')}</SectionTitle>
        <div className='flex flex-wrap mt-[22px]' style={{ gap: '42px' }}>
          {rewardItems.map((item, index) => (
            <div
              key={index}
              className='relative'
              style={{
                width: '340px',
                maxWidth: '100%',
                height: '110px',
                background: 'var(--ps-bg)',
                boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
                borderRadius: '10px',
                outline: '1px solid var(--ps-outline)',
                outlineOffset: '-1px',
                backdropFilter: 'blur(22.5px)',
                WebkitBackdropFilter: 'blur(22.5px)',
                overflow: 'hidden',
              }}
            >
              {/* 图标：绝对定位 left 40，垂直居中（38px→top 36 / 34px→top 38） */}
              <img
                src={item.icon}
                alt=''
                style={{
                  position: 'absolute',
                  left: '40px',
                  top: (110 - item.iconSize) / 2,
                  width: item.iconSize,
                  height: item.iconSize,
                }}
              />
              {/* 标题：绝对定位 left 118 / top 20，16px 紫色 600 */}
              <div
                style={{
                  position: 'absolute',
                  left: '118px',
                  top: '20px',
                  color: WALLET_PRIMARY,
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  lineHeight: '22.64px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </div>
              {/* 说明：绝对定位 left 118 / top 50，14px 两行（与第一行左对齐） */}
              <div
                style={{
                  position: 'absolute',
                  left: '118px',
                  top: '50px',
                  color: rewardDescColor,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px',
                  textAlign: 'left',
                }}
              >
                <RewardDesc text={item.desc} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
