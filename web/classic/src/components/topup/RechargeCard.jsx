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

import React, { useState } from 'react';
import { Typography, Button, Banner, Card, Skeleton, Spin, Tag, Tooltip, Checkbox } from '@douyinfe/semi-ui'
import { SiStripe } from 'react-icons/si';
import { CreditCard } from 'lucide-react';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import { getCurrencyConfig } from '../../helpers/render';
import SubscriptionPlansCard from './SubscriptionPlansCard';

// 钱包管理页视觉稿资源
import walletIcon from '../../assets/figma-wallet/6.svg';
import billingIcon from '../../assets/figma-wallet/13.svg';
import statsBg from '../../assets/figma-wallet/14.png';
import statsBalanceIcon from '../../assets/figma-wallet/10.svg';
import statsUsageIcon from '../../assets/figma-wallet/11.svg';
import statsRequestsIcon from '../../assets/figma-wallet/12.svg';
import coinIcon1 from '../../assets/figma-wallet/7.svg';
import coinIcon2 from '../../assets/figma-wallet/8.svg';
import coinIcon3 from '../../assets/figma-wallet/9.svg';
import wechatPayIcon from '../../assets/figma-wallet/4.svg';
import alipayIcon from '../../assets/figma-wallet/5.svg';
import ModalPro from '@/components/common/ui/ModalPro';

const { Text } = Typography;

// 预设卡片金币图标（对应视觉稿 100 / 200 / 500）
const PRESET_COIN_ICONS = [coinIcon1, coinIcon2, coinIcon3];

// 主题自适应图标：颜色跟随 --ps-text-label（亮色为深色、深色为白色）
const StepperUpIcon = () => (
  <svg width='8' height='8' viewBox='0 0 8 8' fill='none' aria-hidden='true'>
    <path
      d='M4 1.83337C4.18907 1.83337 4.36964 1.9084 4.50325 2.04202L6.62467 4.16344C6.82891 4.36768 6.82891 4.69927 6.62467 4.90351C6.42044 5.10775 6.08885 5.10775 5.88461 4.90351L4 3.0189L2.11539 4.90351C1.91115 5.10775 1.57956 5.10775 1.37533 4.90351C1.17109 4.69927 1.17109 4.36768 1.37533 4.16344L3.49675 2.04202C3.63036 1.9084 3.81093 1.83337 4 1.83337Z'
      fill='var(--ps-text-label)'
    />
  </svg>
);

const StepperDownIcon = () => (
  <svg width='8' height='8' viewBox='0 0 8 8' fill='none' aria-hidden='true'>
    <path
      d='M4 6.16663C3.81093 6.16663 3.63036 6.0916 3.49675 5.95798L1.37533 3.83656C1.17109 3.63232 1.17109 3.30073 1.37533 3.09649C1.57956 2.89225 1.91115 2.89225 2.11539 3.09649L4 4.9811L5.88461 3.09649C6.08885 2.89225 6.42044 2.89225 6.62467 3.09649C6.82891 3.30073 6.82891 3.63232 6.62467 3.83656L4.50325 5.95798C4.36964 6.0916 4.18907 6.16663 4 6.16663Z'
      fill='var(--ps-text-label)'
    />
  </svg>
);

const RedemptionIcon = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden='true'>
    <path
      d='M13.3334 6H2.66675C2.29856 6 2.00008 6.29848 2.00008 6.66667V13.3333C2.00008 13.7015 2.29856 14 2.66675 14H13.3334C13.7016 14 14.0001 13.7015 14.0001 13.3333V6.66667C14.0001 6.29848 13.7016 6 13.3334 6Z'
      stroke='var(--ps-text-label)'
      strokeWidth='1.33333'
    />
    <path
      d='M1.33341 4.00002C1.33341 3.63635 1.61194 3.33336 2.00008 3.33336H14.0001C14.3882 3.33336 14.6667 3.63635 14.6667 4.00002V6.00002H1.33341V4.00002Z'
      stroke='var(--ps-text-label)'
      strokeWidth='1.33333'
    />
    <path
      d='M8.00008 3.33336V14'
      stroke='var(--ps-text-label)'
      strokeWidth='1.33333'
    />
    <path
      d='M8.00053 3.33331C7.91243 2.63875 7.42885 1.33331 6.00053 1.33331C4.86986 1.33331 4.46684 2.25912 4.70134 2.94299C4.93584 3.62686 5.83734 4.15673 8.00053 3.33331Z'
      stroke='var(--ps-text-label)'
      strokeWidth='1.33333'
    />
    <path
      d='M7.99964 3.33331C8.08774 2.63875 8.57132 1.33331 9.99964 1.33331C11.1303 1.33331 11.5333 2.25912 11.2988 2.94299C11.0643 3.62686 10.1632 4.15673 7.99964 3.33331Z'
      stroke='var(--ps-text-label)'
      strokeWidth='1.33333'
    />
  </svg>
);

// 钱包管理页主题色
const WALLET_PRIMARY = '#635DE7';
const WALLET_GRADIENT_BTN =
  'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)';

// 钱包管理页区块标题
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

const RechargeCard = ({
  t,
  enableOnlineTopUp,
  enableStripeTopUp,
  enableCreemTopUp,
  creemProducts,
  creemPreTopUp,
  presetAmounts,
  selectedPreset,
  selectPresetAmount,
  formatLargeNumber,
  priceRatio,
  wechatPayUnitPrice,
  payWay,
  topUpCount,
  minTopUp,
  renderQuotaWithAmount,
  getAmount,
  setTopUpCount,
  setSelectedPreset,
  renderAmount,
  amountLoading,
  payMethods,
  onSelectPayWay,
  onConfirmPayment,
  paymentLoading,
  redemptionCode,
  setRedemptionCode,
  topUp,
  isSubmitting,
  topUpLink,
  openTopUpLink,
  userState,
  renderQuota,
  statusLoading,
  topupInfo,
  onOpenHistory,
  enableWaffoTopUp,
  enableWaffoPancakeTopUp,
  enableWeChatPayTopUp,
  enableAliPayTopUp,
  subscriptionLoading = false,
  subscriptionPlans = [],
  billingPreference,
  onChangeBillingPreference,
  activeSubscriptions = [],
  allSubscriptions = [],
  reloadSubscriptionSelf,
  topUpAgreement = '',
}) => {
  const showAmountSkeleton = useMinimumLoadingTime(amountLoading);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const shouldShowSubscription =
    !subscriptionLoading && subscriptionPlans.length > 0;
  const regularPayMethods = payMethods || [];

  const handleAmountChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 1) {
      setTopUpCount(numValue);
      setSelectedPreset(null);
      getAmount(numValue);
    }
  };

  const stepAmount = (delta) => {
    const next = Math.max(1, (parseInt(topUpCount) || 1) + delta);
    setTopUpCount(next);
    setSelectedPreset(null);
    getAmount(next);
  };

  // 支付方式图标（优先使用视觉稿图标）
  const renderPayMethodIcon = (payMethod, isSelected) => {
    const iconStyle = {
      width: 18,
      height: 18,
      objectFit: 'contain',
      flexShrink: 0,
    };
    if (payMethod.type === 'wechat_pay' || payMethod.type === 'wxpay') {
      return <img src={wechatPayIcon} alt='wechat' style={iconStyle} />;
    }
    if (payMethod.type === 'alipay_direct' || payMethod.type === 'alipay') {
      return <img src={alipayIcon} alt='alipay' style={iconStyle} />;
    }
    if (payMethod.icon) {
      return <img src={payMethod.icon} alt={payMethod.name} style={iconStyle} />;
    }
    if (payMethod.type === 'stripe') {
      return <SiStripe size={18} color={isSelected ? '#fff' : '#635BFF'} />;
    }
    if (payMethod.type === 'waffo_pancake') {
      return (
        <CreditCard
          size={18}
          color={isSelected ? '#fff' : 'var(--semi-color-primary)'}
        />
      );
    }
    return (
      <CreditCard
        size={18}
        color={isSelected ? '#fff' : payMethod.color || 'var(--semi-color-text-2)'}
      />
    );
  };

  const topupContent = (
    <div className='flex w-full flex-col'>
      {/* 账户统计 */}
      <div
        className='relative w-full overflow-hidden'
        style={{
          borderRadius: '10px',
          backgroundImage: `linear-gradient(0deg, rgba(111,125,248,0.40) 0%, rgba(111,125,248,0.40) 100%), url(${statsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '16px',
        }}
      >
        <Text strong style={{ color: 'white', fontSize: '16px' }}>
          {t('账户统计')}
        </Text>
        <div className='grid grid-cols-3 gap-4 mt-5'>
          {/* 当前余额 */}
          <div className='text-center'>
            <div
              className='text-base sm:text-[32px] font-bold mb-2'
              style={{ color: 'white', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {renderQuota(userState?.user?.quota)}
            </div>
            <div className='flex items-center justify-center gap-1'>
              <img src={statsBalanceIcon} alt='' style={{ width: 14, height: 14 }} />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.80)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('当前余额')}
              </Text>
            </div>
          </div>
          {/* 历史消耗 */}
          <div className='text-center'>
            <div
              className='text-base sm:text-[32px] font-bold mb-2'
              style={{ color: 'white', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {renderQuota(userState?.user?.used_quota)}
            </div>
            <div className='flex items-center justify-center gap-1'>
              <img src={statsUsageIcon} alt='' style={{ width: 14, height: 14 }} />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.80)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('历史消耗')}
              </Text>
            </div>
          </div>
          {/* 请求次数 */}
          <div className='text-center'>
            <div
              className='text-base sm:text-[32px] font-bold mb-2'
              style={{ color: 'white', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {userState?.user?.request_count || 0}
            </div>
            <div className='flex items-center justify-center gap-1'>
              <img src={statsRequestsIcon} alt='' style={{ width: 14, height: 14 }} />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.80)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('请求次数')}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷充值（预设金额卡片） */}
      <div className='w-full mt-[35px]'>
        <SectionTitle>{t('快捷充值')}</SectionTitle>
        <div className='flex flex-wrap mt-[22px]' style={{ gap: '15px' }}>
          {presetAmounts.map((preset, index) => {
            const discount =
              preset.discount ||
              topupInfo?.discount?.[preset.value] ||
              1.0;
            const effectiveRatio =
              payWay === 'wechat_pay' ? wechatPayUnitPrice : priceRatio;
            const originalPrice = preset.value * effectiveRatio;
            const discountedPrice = originalPrice * discount;
            const hasDiscount = discount < 1.0;
            const actualPay = discountedPrice;
            const save = originalPrice - discountedPrice;

            // 根据当前货币类型换算显示金额和数量
            const { symbol, rate, type } = getCurrencyConfig();
            const statusStr = localStorage.getItem('status');
            let usdRate = 7;
            try {
              if (statusStr) {
                const s = JSON.parse(statusStr);
                usdRate = s?.usd_exchange_rate || 7;
              }
            } catch (e) {}

            let displayValue = preset.value;
            let displayActualPay = actualPay;
            let displaySave = save;

            if (type === 'USD') {
              displayActualPay = actualPay / usdRate;
              displaySave = save / usdRate;
            } else if (type === 'CNY') {
              displayValue = preset.value * usdRate;
            } else if (type === 'CUSTOM') {
              displayValue = preset.value * rate;
              displayActualPay = (actualPay / usdRate) * rate;
              displaySave = (save / usdRate) * rate;
            }

            const isSelected = selectedPreset === preset.value;
            return (
              <div
                key={index}
                className='relative cursor-pointer transition-all duration-200 hover:shadow-md'
                style={{
                  position: 'relative',
                  width: '259px',
                  maxWidth: '100%',
                  height: '136px',
                  background: 'var(--ps-bg)',
                  boxShadow: '0px 4px 8px rgba(106,58,199,0.08)',
                  borderRadius: '10px',
                  outline: isSelected
                    ? '2px solid ' + WALLET_PRIMARY
                    : '1px solid var(--ps-outline)',
                  outlineOffset: '-1px',
                  backdropFilter: 'blur(22.5px)',
                  WebkitBackdropFilter: 'blur(22.5px)',
                  padding: '11px',
                  overflow: 'hidden',
                }}
                onClick={() => selectPresetAmount(preset)}
              >
                {/* 左上角金币图标：18px，绝对定位在卡片左上方（left 10px / top 10px） */}
                <img
                  src={PRESET_COIN_ICONS[index % PRESET_COIN_ICONS.length]}
                  alt=''
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                    width: '18px',
                    height: '18px',
                  }}
                />
                {/* 内容：金额在上 / 实付·节省在下，上下各 flex-1，水平居中 */}
                <div className='flex h-full flex-col'>
                  <div className='flex flex-1 items-center justify-center'>
                    <span
                      style={{
                        color: WALLET_PRIMARY,
                        fontSize: '24px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {formatLargeNumber(displayValue)} {symbol}
                      {hasDiscount && (
                        <Tag style={{ marginLeft: 4 }} color='green'>
                          {(discount * 10).toFixed(1)}
                          {t('折')}
                        </Tag>
                      )}
                    </span>
                  </div>
                  <div className='flex flex-1 items-center justify-center'>
                    <div
                      style={{
                        color: 'var(--ps-text-2)',
                        fontSize: '14px',
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '1.4',
                        textAlign: 'center',
                      }}
                    >
                      {t('实付')} {symbol}
                      {displayActualPay.toFixed(2)}，{t('节省')}
                      <br />
                      {symbol}
                      {displaySave.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 选择充值金额 */}
      <div className='w-full mt-[32px]'>
        <SectionTitle>{t('选择充值金额')}</SectionTitle>
        <div className='flex flex-wrap items-center mt-3' style={{ gap: '12px' }}>
          {/* 充值金额输入 + 步进器（步进器与输入框分离，间隔 4px） */}
          <div
            className='flex items-stretch'
            style={{ gap: '4px', maxWidth: '100%' }}
          >
            <div
              className='flex items-stretch overflow-hidden'
              style={{
                flex: '1 1 auto',
                width: '556px',
                maxWidth: '556px',
                background: 'var(--ps-input-bg)',
                borderRadius: '10px',
                outline: '1px solid var(--ps-outline)',
                outlineOffset: '-1px',
                height: '38px',
              }}
            >
              <input
                type='text'
                inputMode='numeric'
                value={topUpCount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value);
                  if (!value || value < 1) {
                    setTopUpCount(1);
                    getAmount(1);
                  }
                }}
                placeholder={t('充值数量，最低 ') + renderQuotaWithAmount(minTopUp)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 14px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--ps-text)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
            <div
              className='flex flex-col'
              style={{
                width: '20px',
                height: '38px',
                flexShrink: 0,
                background: 'var(--ps-input-bg)',
                borderRadius: '3px',
                outline: '1px solid var(--ps-outline)',
                outlineOffset: '-1px',
              }}
            >
              <button
                type='button'
                onClick={() => stepAmount(1)}
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
                <StepperUpIcon />
              </button>
              <button
                type='button'
                onClick={() => stepAmount(-1)}
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
                <StepperDownIcon />
              </button>
            </div>
          </div>

          {/* 支付方式 */}
          {regularPayMethods.map((payMethod) => {
            const minTopupVal = Number(payMethod.min_topup) || 0;
            const isStripe = payMethod.type === 'stripe';
            const isWaffo =
              typeof payMethod.type === 'string' &&
              payMethod.type.startsWith('waffo:');
            const isWaffoPancake = payMethod.type === 'waffo_pancake';
            const isWeChatPay = payMethod.type === 'wechat_pay';
            const isAliPayDirect = payMethod.type === 'alipay_direct';
            const disabled =
              (!enableOnlineTopUp &&
                !isStripe &&
                !isWaffo &&
                !isWaffoPancake &&
                !isWeChatPay &&
                !isAliPayDirect) ||
              (!enableStripeTopUp && isStripe) ||
              (!enableWaffoTopUp && isWaffo) ||
              (!enableWaffoPancakeTopUp && isWaffoPancake) ||
              (!enableWeChatPayTopUp && isWeChatPay) ||
              minTopupVal > Number(topUpCount || 0);
            const isSelected = payWay === payMethod.type;

            const chip = (
              <button
                key={payMethod.type}
                type='button'
                disabled={disabled}
                onClick={() => onSelectPayWay(payMethod.type)}
                className='flex items-center gap-2'
                style={{
                  height: '38px',
                  padding: '0 17px',
                  borderRadius: '8px',
                  background: isSelected
                    ? 'linear-gradient(180deg, #89BDF9 0%, #8164FF 100%)'
                    : 'var(--ps-btn-bg)',
                  outline: '1px solid var(--ps-outline)',
                  outlineOffset: '-1px',
                  color: isSelected ? '#fff' : 'var(--ps-text)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {renderPayMethodIcon(payMethod, isSelected)}
                {payMethod.name}
              </button>
            );

            return disabled && minTopupVal > Number(topUpCount || 0) ? (
              <Tooltip
                content={t('此支付方式最低充值金额为') + ' ' + minTopupVal}
                key={payMethod.type}
              >
                {chip}
              </Tooltip>
            ) : (
              <React.Fragment key={payMethod.type}>{chip}</React.Fragment>
            );
          })}
        </div>

        {/* 实付金额 */}
        <div
          className='flex items-center gap-1 mt-[15px]'
          style={{
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: 'var(--ps-text)',
          }}
        >
          {t('实付金额：')}
          {showAmountSkeleton ? (
            <Skeleton
              active
              placeholder={
                <Skeleton.Title style={{ width: 60, height: 16 }} />
              }
              loading
            >
              <span />
            </Skeleton>
          ) : (
            <span style={{ color: WALLET_PRIMARY }}>{renderAmount()}</span>
          )}
        </div>

        {/* 充值协议 + 确认支付 */}
        {payWay && (
          <div className='space-y-3 pt-2 mt-2'>
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            >
              {t('我已知悉充值资金不支持直接开具发票，确认支付即代表同意本平台')}
              {topUpAgreement ? (
                <a
                  href='#'
                  style={{
                    textDecoration: 'underline',
                    marginLeft: 2,
                    color: 'var(--semi-color-primary)',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAgreementModalVisible(true);
                  }}
                >
                  {t('充值协议')}
                </a>
              ) : (
                <a
                  href='/user-agreement'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    textDecoration: 'underline',
                    marginLeft: 2,
                    color: 'var(--semi-color-primary)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('充值协议')}
                </a>
              )}
            </Checkbox>
            <Button
              type='primary'
              theme='solid'
              block
              size='large'
              disabled={!agreedToTerms}
              onClick={onConfirmPayment}
              loading={paymentLoading}
              style={{
                background: WALLET_GRADIENT_BTN,
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              {t('确认支付')}
            </Button>
          </div>
        )}
      </div>

      {/* Creem 充值区域 */}
      {enableCreemTopUp && creemProducts.length > 0 && (
        <div className='w-full mt-[32px]'>
          <SectionTitle>{t('Creem 充值')}</SectionTitle>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-[22px]'>
            {creemProducts.map((product, index) => (
              <Card
                key={index}
                onClick={() => creemPreTopUp(product)}
                className='cursor-pointer !rounded-2xl transition-all hover:shadow-md border-gray-200 hover:border-gray-300'
                bodyStyle={{ textAlign: 'center', padding: '16px' }}
              >
                <div className='font-medium text-lg mb-2'>{product.name}</div>
                <div className='text-sm text-gray-600 mb-2'>
                  {t('充值额度')}: {product.quota}
                </div>
                <div className='text-lg font-semibold text-blue-600'>
                  {product.currency === 'EUR' ? '€' : '$'}
                  {product.price}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 兑换码充值 */}
      <div
        className='w-full mt-[35px]'
        style={{
          background: 'var(--ps-bottom-bg)',
          borderRadius: '12px',
          outline: '1px solid var(--ps-outline)',
          outlineOffset: '-1px',
          padding: '20px 24px',
        }}
      >
        <div className='flex items-center gap-2 mb-4'>
          <RedemptionIcon />
          <Text strong style={{ color: 'var(--ps-text-label)', fontSize: '16px' }}>
            {t('兑换码充值')}
          </Text>
        </div>
        <div
          className='flex flex-wrap items-center'
          style={{ gap: '26px' }}
        >
          <input
            type='text'
            value={redemptionCode}
            onChange={(e) => setRedemptionCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && redemptionCode) topUp();
            }}
            placeholder={t('请输入兑换码')}
            className='flex-1'
            style={{
              flex: '1 1 200px',
              minWidth: '200px',
              height: '38px',
              padding: '0 14px',
              background: 'var(--ps-input-bg)',
              borderRadius: '10px',
              outline: '1px solid var(--ps-outline)',
              outlineOffset: '-1px',
              border: 'none',
              color: 'var(--ps-text)',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <Button
            type='primary'
            theme='solid'
            onClick={topUp}
            loading={isSubmitting}
            style={{
              background: WALLET_GRADIENT_BTN,
              border: 'none',
              borderRadius: '10px',
              width: '98px',
              height: '38px',
              padding: '0',
              fontWeight: 600,
            }}
          >
            {t('兑换额度')}
          </Button>
        </div>
        {topUpLink && (
          <div className='mt-3'>
            <Text type='tertiary'>
              {t('在找兑换码？')}
              <Text
                type='secondary'
                underline
                className='cursor-pointer'
                onClick={openTopUpLink}
              >
                {t('购买兑换码')}
              </Text>
            </Text>
          </div>
        )}
      </div>

      {/* 订阅套餐（可选，位于钱包管理页下方） */}
      {shouldShowSubscription && (
        <div className='w-full mt-[35px]'>
          <SubscriptionPlansCard
          t={t}
          loading={subscriptionLoading}
          plans={subscriptionPlans}
          payMethods={payMethods}
          enableOnlineTopUp={enableOnlineTopUp}
          enableStripeTopUp={enableStripeTopUp}
          enableCreemTopUp={enableCreemTopUp}
          billingPreference={billingPreference}
          onChangeBillingPreference={onChangeBillingPreference}
          activeSubscriptions={activeSubscriptions}
          allSubscriptions={allSubscriptions}
          reloadSubscriptionSelf={reloadSubscriptionSelf}
          withCard={false}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className='flex flex-col gap-9 pt-[14px]'>
      {/* 页面头部 */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-[19px] min-w-0'>
          <div
            className='flex items-center justify-center flex-shrink-0'
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              marginTop: '2px',
              background: 'linear-gradient(164deg, #635DE7 0%, #81CBFA 100%)',
              boxShadow:
                '0px 2px 4px -2px rgba(106,58,199,0.08), 0px 4px 6px -1px rgba(106,58,199,0.08)',
            }}
          >
            <img src={walletIcon} alt='' style={{ width: 16, height: 16 }} />
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
              {t('钱包管理')}
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
              {t('安全便捷的账户资金管理')}
            </div>
          </div>
        </div>
        <Button
          onClick={onOpenHistory}
          style={{
            background: WALLET_GRADIENT_BTN,
            border: 'none',
            borderRadius: '10px',
            width: '90px',
            height: '38px',
            padding: '0',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <img src={billingIcon} alt='' style={{ width: 16, height: 16 }} />
          {t('账单')}
        </Button>
      </div>

      {statusLoading ? (
        <div className='py-8 flex justify-center'>
          <Spin size='large' />
        </div>
      ) : enableOnlineTopUp ||
        enableStripeTopUp ||
        enableCreemTopUp ||
        enableWaffoTopUp ||
        enableWaffoPancakeTopUp ||
        enableWeChatPayTopUp ||
        enableAliPayTopUp ? (
        topupContent
      ) : (
        <Banner
          type='info'
          description={t(
            '管理员未开启在线充值功能，请联系管理员开启或使用兑换码充值。',
          )}
          className='!rounded-xl'
          closeIcon={null}
        />
      )}

      {/* 充值协议弹窗 */}
      <ModalPro
        title={t('充值协议')}
        visible={agreementModalVisible}
        onCancel={() => setAgreementModalVisible(false)}
        footer={
          <Button onClick={() => setAgreementModalVisible(false)}>
            {t('关闭')}
          </Button>
        }
        centered
        width={'80%'}
      >
        <div
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
          dangerouslySetInnerHTML={{ __html: topUpAgreement || '' }}
        />
      </ModalPro>
    </div>
  );
};

export default RechargeCard;
