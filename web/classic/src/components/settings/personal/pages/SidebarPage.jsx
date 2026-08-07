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
} from '../../../../helpers';
import { StatusContext } from '../../../../context/Status';
import { UserContext } from '../../../../context/User';
import { useTranslation } from 'react-i18next';
import {
  mergeAdminConfig,
  useSidebar,
} from '../../../../hooks/common/useSidebar';
import { useUserPermissions } from '../../../../hooks/common/useUserPermissions';

import SubPageBreadcrumb from '../components/SubPageBreadcrumb';

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

// 模块卡片
const ModuleCard = ({ title, description, checked, onChange }) => (
  <div
    className='p-4 md:p-[20px] flex items-center justify-between gap-3'
    style={{
      background: 'var(--ps-bg)',
      boxShadow:
        '0px 4px 8px rgba(106, 58, 199, 0.08), inset -4px -4px 4px rgba(255, 255, 255, 0.25), inset 0px 4px 4px rgba(255, 255, 255, 0.25)',
      borderRadius: '12px',
      outline: '1px solid var(--ps-outline)',
      outlineOffset: '-1px',
      backdropFilter: 'blur(9px)',
      minHeight: '105px',
    }}
  >
    <div className='flex-1 min-w-0'>
      <div
        className='md:!text-[20px]'
        style={{
          color: 'var(--ps-text)',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        }}
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
        }}
      >
        {description}
      </div>
    </div>
    <div className='flex-shrink-0'>
      <Switch checked={checked} onChange={onChange} />
    </div>
  </div>
);

const SidebarPage = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [userState] = useContext(UserContext);
  const { refreshUserConfig } = useSidebar();
  const {
    hasSidebarSettingsPermission,
    isSidebarSectionAllowed,
    isSidebarModuleAllowed,
  } = useUserPermissions();

  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarModules, setSidebarModules] = useState({
    chat: { enabled: true, playground: true, chat: true },
    console: {
      enabled: true,
      detail: true,
      token: true,
      log: true,
      midjourney: true,
      task: true,
    },
    personal: { enabled: true, topup: true, invite: true, personal: true },
    admin: {
      enabled: true,
      channel: true,
      models: true,
      deployment: true,
      subscription: true,
      redemption: true,
      user: true,
      setting: true,
    },
  });
  const [adminConfig, setAdminConfig] = useState(null);

  useEffect(() => {
    loadSidebarConfigs();
  }, [statusState]);

  const loadSidebarConfigs = async () => {
    try {
      // 获取管理员全局配置
      if (statusState?.status?.SidebarModulesAdmin) {
        try {
          const adminConf = JSON.parse(
            statusState.status.SidebarModulesAdmin,
          );
          setAdminConfig(mergeAdminConfig(adminConf));
        } catch (error) {
          setAdminConfig(mergeAdminConfig(null));
        }
      } else {
        setAdminConfig(mergeAdminConfig(null));
      }

      // 获取用户个人配置
      const userRes = await API.get('/api/user/self');
      if (userRes.data.success && userRes.data.data.sidebar_modules) {
        let userConf;
        if (typeof userRes.data.data.sidebar_modules === 'string') {
          userConf = JSON.parse(userRes.data.data.sidebar_modules);
        } else {
          userConf = userRes.data.data.sidebar_modules;
        }
        setSidebarModules(userConf);
      }
    } catch (error) {
      console.error('加载边栏配置失败:', error);
    }
  };

  const handleSectionChange = (sectionKey) => (checked) => {
    setSidebarModules((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], enabled: checked },
    }));
  };

  const handleModuleChange = (sectionKey, moduleKey) => (checked) => {
    setSidebarModules((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [moduleKey]: checked },
    }));
  };

  const saveSidebarSettings = async () => {
    setSidebarLoading(true);
    try {
      const res = await API.put('/api/user/self', {
        sidebar_modules: JSON.stringify(sidebarModules),
      });
      if (res.data.success) {
        showSuccess(t('侧边栏设置保存成功'));
        await refreshUserConfig();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('保存失败'));
    }
    setSidebarLoading(false);
  };

  const resetSidebarModules = () => {
    setSidebarModules({
      chat: { enabled: true, playground: true, chat: true },
      console: {
        enabled: true,
        detail: true,
        token: true,
        log: true,
        midjourney: true,
        task: true,
      },
      personal: { enabled: true, topup: true, invite: true, personal: true },
      admin: {
        enabled: true,
        channel: true,
        models: true,
        deployment: true,
        subscription: true,
        redemption: true,
        user: true,
        setting: true,
      },
    });
  };

  // 检查功能是否被管理员允许
  const isAllowedByAdmin = (sectionKey, moduleKey = null) => {
    if (!adminConfig) return true;
    if (moduleKey) {
      return (
        adminConfig[sectionKey]?.enabled &&
        adminConfig[sectionKey]?.[moduleKey]
      );
    } else {
      return adminConfig[sectionKey]?.enabled;
    }
  };

  // 区域配置数据（根据权限过滤）
  const sectionConfigs = [
    {
      key: 'chat',
      title: t('聊天区域'),
      description: t('操练场和聊天功能'),
      modules: [
        {
          key: 'playground',
          title: t('操练场'),
          description: t('AI模型测试环境'),
        },
        { key: 'chat', title: t('聊天'), description: t('聊天会话管理') },
      ],
    },
    {
      key: 'console',
      title: t('控制台区域'),
      description: t('数据管理和日志查看'),
      modules: [
        {
          key: 'detail',
          title: t('数据看板'),
          description: t('系统数据统计'),
        },
        { key: 'token', title: t('令牌管理'), description: t('API令牌管理') },
        { key: 'log', title: t('使用日志'), description: t('API使用记录') },
        {
          key: 'midjourney',
          title: t('绘图日志'),
          description: t('绘图任务记录'),
        },
        { key: 'task', title: t('任务日志'), description: t('系统任务记录') },
      ],
    },
    {
      key: 'personal',
      title: t('个人中心区域'),
      description: t('用户个人功能'),
      modules: [
        {
          key: 'topup',
          title: t('钱包管理'),
          description: t('余额充值管理'),
        },
        {
          key: 'invite',
          title: t('邀请奖励'),
          description: t('邀请好友获得奖励'),
        },
        {
          key: 'personal',
          title: t('个人设置'),
          description: t('个人信息设置'),
        },
      ],
    },
    {
      key: 'admin',
      title: t('管理员区域'),
      description: t('系统管理功能'),
      modules: [
        {
          key: 'channel',
          title: t('渠道管理'),
          description: t('API渠道配置'),
        },
        { key: 'models', title: t('模型管理'), description: t('AI模型配置') },
        {
          key: 'deployment',
          title: t('模型部署'),
          description: t('模型部署管理'),
        },
        {
          key: 'subscription',
          title: t('订阅管理'),
          description: t('订阅套餐管理'),
        },
        {
          key: 'redemption',
          title: t('兑换码管理'),
          description: t('兑换码生成管理'),
        },
        { key: 'user', title: t('用户管理'), description: t('用户账户管理') },
        {
          key: 'setting',
          title: t('系统设置'),
          description: t('系统参数配置'),
        },
      ],
    },
  ]
    .filter((section) => isSidebarSectionAllowed(section.key))
    .map((section) => ({
      ...section,
      modules: section.modules.filter((module) =>
        isSidebarModuleAllowed(section.key, module.key),
      ),
    }))
    .filter(
      (section) =>
        section.modules.length > 0 && isAllowedByAdmin(section.key),
    );

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={t('边栏设置')} />

          {/* 边栏设置主卡片 */}
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
              {sectionConfigs.map((section, sectionIndex) => (
                <React.Fragment key={section.key}>
                  {sectionIndex > 0 && (
                    <div className='my-6 md:my-[36px]'>
                      <Divider />
                    </div>
                  )}

                  {/* 区域标题行 */}
                  <div className='flex items-center justify-between gap-4'>
                    <div>
                      <div
                        className='md:!text-[20px]'
                        style={{
                          color: 'var(--ps-text)',
                          fontSize: '16px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {section.title}
                      </div>
                      <div
                        className='mt-1 md:mt-[3px] md:!text-[16px]'
                        style={{
                          color: 'var(--ps-text-2)',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {section.description}
                      </div>
                    </div>
                    <div className='flex-shrink-0'>
                      <Switch
                        checked={sidebarModules[section.key]?.enabled}
                        onChange={handleSectionChange(section.key)}
                      />
                    </div>
                  </div>

                  {/* 区域分隔线 */}
                  <div className='mt-4 md:mt-[14px]'>
                    <Divider />
                  </div>

                  {/* 模块卡片网格 */}
                  <div className='mt-4 md:mt-[16px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-[20px]'>
                    {section.modules.map((module) => (
                      <ModuleCard
                        key={module.key}
                        title={module.title}
                        description={module.description}
                        checked={
                          sidebarModules[section.key]?.[module.key]
                        }
                        onChange={handleModuleChange(
                          section.key,
                          module.key,
                        )}
                      />
                    ))}
                  </div>
                </React.Fragment>
              ))}

              {/* 底部按钮 */}
              <div className='mt-6 md:mt-[24px] flex flex-col sm:flex-row gap-3 sm:justify-end'>
                {/* 重置为默认 */}
                <button
                  onClick={resetSidebarModules}
                  className='flex items-center justify-center transition-all duration-200 hover:opacity-80 w-full sm:!w-[112px]'
                  style={{
                    height: '38px',
                    background: 'var(--ps-btn-bg)',
                    borderRadius: '10px',
                    outline: '1px solid var(--ps-outline)',
                    outlineOffset: '-1px',
                    border: 'none',
                    color: '#635DE7',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('重置为默认')}
                </button>
                {/* 保存设置 */}
                <button
                  onClick={saveSidebarSettings}
                  disabled={sidebarLoading}
                  className='flex items-center justify-center transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full sm:!w-[98px]'
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
                    cursor: sidebarLoading ? 'not-allowed' : 'pointer',
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

export default SidebarPage;