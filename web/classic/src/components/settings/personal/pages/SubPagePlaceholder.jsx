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
import SubPageBreadcrumb from '../components/SubPageBreadcrumb';

const SubPagePlaceholder = ({ t, title, description }) => {
  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-7xl mx-auto px-2'>
          {/* 面包屑导航 */}
          <SubPageBreadcrumb t={t} title={title} />

          {/* Placeholder card */}
          <div
            className='flex flex-col items-center justify-center'
            style={{
              minHeight: '400px',
              background: 'var(--ps-bg)',
              borderRadius: '16px',
              outline: '1px solid var(--ps-outline)',
              outlineOffset: '-1px',
              backdropFilter: 'blur(9px)',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--ps-text)',
                marginBottom: '12px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: 'var(--ps-text-2)',
              }}
            >
              {description || t('此功能正在开发中，敬请期待')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubPagePlaceholder;
