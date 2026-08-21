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
import backIcon from '../../../../assets/personal/2.svg';
import separatorIcon from '../../../../assets/personal/1.svg';

const SubPageBreadcrumb = ({ t, title }) => {
  const navigate = useNavigate();

  return (
    <div
      className='flex items-center gap-2 mb-4 cursor-pointer select-none'
      style={{
        margin: '31px 0 50px 0px'
      }}
      onClick={() => navigate('/console/personal')}
    >
      <img
        src={backIcon}
        alt=''
        style={{ width: '24px', height: '24px', flexShrink: 0 }}
      />
      <span
        style={{
          color: 'var(--ps-text-2)',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {t('个人设置')}
      </span>
      <img
        src={separatorIcon}
        alt=''
        style={{ width: '16px', height: '16px', flexShrink: 0 }}
      />
      <span
        style={{
          color: 'var(--ps-text)',
          fontSize: '24px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default SubPageBreadcrumb;
