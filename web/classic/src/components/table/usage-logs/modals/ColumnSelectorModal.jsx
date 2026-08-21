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
import { Button, Checkbox } from '@douyinfe/semi-ui';
import { getLogsColumns } from '../UsageLogsColumnDefs';
import ModalPro from '@/components/common/ui/ModalPro';

const ColumnSelectorModal = ({
  showColumnSelector,
  setShowColumnSelector,
  visibleColumns,
  handleColumnVisibilityChange,
  handleSelectAll,
  initDefaultColumns,
  billingDisplayMode,
  setBillingDisplayMode,
  COLUMN_KEYS,
  isAdminUser,
  copyText,
  showUserInfoFunc,
  t,
}) => {
  const isTokensDisplay =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('quota_display_type') === 'TOKENS';

  const allColumns = getLogsColumns({
    t,
    COLUMN_KEYS,
    copyText,
    showUserInfoFunc,
    isAdminUser,
    billingDisplayMode,
  });

  return (
    <ModalPro
      className='column-selector-modal'
      title={<span className='column-selector-title'>{t('列设置')}</span>}
      visible={showColumnSelector}
      onCancel={() => setShowColumnSelector(false)}
      width={543}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      footer={
        <div className='flex justify-end gap-3'>
          <Button
            className='column-selector-btn-secondary'
            onClick={() => initDefaultColumns()}
          >
            {t('重 置')}
          </Button>
          <Button
            className='column-selector-btn-secondary'
            onClick={() => setShowColumnSelector(false)}
          >
            {t('取 消')}
          </Button>
          <Button
            theme='solid'
            type='primary'
            className='column-selector-btn-primary'
            onClick={() => setShowColumnSelector(false)}
          >
            {t('确 认')}
          </Button>
        </div>
      }
    >
      {/* 计费显示模式 */}
      <div style={{ marginBottom: 20 }}>
        <div className='column-selector-section-label' style={{ marginBottom: 12 }}>
          {t('计费显示模式')}
        </div>
        <div className='column-selector-tabs'>
          <div
            className={`column-selector-tab ${billingDisplayMode === 'price' ? 'active' : ''}`}
            onClick={() => setBillingDisplayMode('price')}
          >
            {isTokensDisplay ? t('价格模式') : t('价格模式（默认）')}
          </div>
          <div
            className={`column-selector-tab ${billingDisplayMode === 'ratio' ? 'active' : ''}`}
            onClick={() => setBillingDisplayMode('ratio')}
          >
            {isTokensDisplay ? t('倍率模式（默认）') : t('倍率模式')}
          </div>
        </div>
      </div>

      {/* 全选 */}
      <Checkbox
        checked={Object.values(visibleColumns).every((v) => v === true)}
        indeterminate={
          Object.values(visibleColumns).some((v) => v === true) &&
          !Object.values(visibleColumns).every((v) => v === true)
        }
        onChange={(e) => handleSelectAll(e.target.checked)}
      >
        {t('全选')}
      </Checkbox>

      {/* 列选择框 */}
      <div className='column-selector-box' style={{ marginTop: 12 }}>
        {allColumns.map((column) => {
          if (
            !isAdminUser &&
            (column.key === COLUMN_KEYS.CHANNEL ||
              column.key === COLUMN_KEYS.USERNAME ||
              column.key === COLUMN_KEYS.RETRY)
          ) {
            return null;
          }

          return (
            <div key={column.key} className='column-selector-item'>
              <Checkbox
                checked={!!visibleColumns[column.key]}
                onChange={(e) =>
                  handleColumnVisibilityChange(column.key, e.target.checked)
                }
              >
                {column.title}
              </Checkbox>
            </div>
          );
        })}
      </div>
    </ModalPro>
  );
};

export default ColumnSelectorModal;
