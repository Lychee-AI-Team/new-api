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

import React, { useState, useEffect, useContext } from 'react';
import { Select } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showSuccess, showError } from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { normalizeLanguage } from '../../../../i18n/language';
import sectionIcon from '../../../../assets/personal/5.svg';
import chevronDown from '../../../../assets/personal/4.svg';

const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'vi', label: 'Tiếng Việt' },
];

const PreferencesSettings = ({ t }) => {
  const { i18n } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [currentLanguage, setCurrentLanguage] = useState(
    normalizeLanguage(i18n.language) || 'zh-CN',
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userState?.user?.setting) {
      try {
        const settings = JSON.parse(userState.user.setting);
        if (settings.language) {
          const lang = normalizeLanguage(settings.language);
          setCurrentLanguage(lang);
          if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [userState?.user?.setting, i18n]);

  const handleLanguagePreferenceChange = async (lang) => {
    if (lang === currentLanguage) return;

    setLoading(true);
    const previousLang = currentLanguage;

    try {
      setCurrentLanguage(lang);
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);

      const res = await API.put('/api/user/self', {
        language: lang,
      });

      if (res.data.success) {
        showSuccess(t('语言偏好已保存'));
        let settings = {};
        if (userState?.user?.setting) {
          try {
            settings = JSON.parse(userState.user.setting) || {};
          } catch (e) {
            settings = {};
          }
        }
        settings.language = lang;
        const nextUser = {
          ...userState.user,
          setting: JSON.stringify(settings),
        };
        userDispatch({
          type: 'login',
          payload: nextUser,
        });
        localStorage.setItem('user', JSON.stringify(nextUser));
      } else {
        showError(res.data.message || t('保存失败'));
        setCurrentLanguage(previousLang);
        i18n.changeLanguage(previousLang);
        localStorage.setItem('i18nextLng', previousLang);
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
      setCurrentLanguage(previousLang);
      i18n.changeLanguage(previousLang);
      localStorage.setItem('i18nextLng', previousLang);
    } finally {
      setLoading(false);
    }
  };

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
        <img src={sectionIcon} alt='' style={{ width: '38px', height: '38px' }} />
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
          {t('偏好设置')}
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
          {t('界面语言和其他个人偏好')}
        </div>
      </div>

      {/* Language preference sub-card */}
      <div style={{ padding: '24px' }}>
        <div
          className='relative transition-all duration-200'
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
              {t('语言偏好')}
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
              {t('选择您的首选界面语言，设置将自动保存并同步到所有设备')}
            </div>
          </div>

          {/* Language selector */}
          <div
            className='absolute'
            style={{ right: '22px', top: '22px' }}
          >
            <Select
              value={currentLanguage}
              onChange={handleLanguagePreferenceChange}
              loading={loading}
              style={{ width: 166 }}
              optionList={languageOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;
