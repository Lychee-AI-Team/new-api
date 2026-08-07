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
import { Modal } from '@douyinfe/semi-ui';

const MODAL_BG_URL = `${import.meta.env.BASE_URL}modal-bg.jpg`;
const MODAL_DARK_BG_URL = `${import.meta.env.BASE_URL}modal-dark-bg.jpg`;

// 用 CSS 自定义属性传递 URL，CSS 中在 .semi-modal-content 上应用背景图
const modalBgStyle = {
  '--modal-bg-url': `url(${MODAL_BG_URL})`,
  '--modal-bg-url-dark': `url(${MODAL_DARK_BG_URL})`,
};

function mergeClassName(...names) {
  return names.filter(Boolean).join(' ');
}

const ModalPro = React.forwardRef(function ModalPro(props, ref) {
  const { style, className, ...rest } = props;

  const mergedStyle = { ...modalBgStyle, ...style };
  const mergedClassName = mergeClassName('modal-pro-bg', className);

  return (
    <Modal
      ref={ref}
      className={mergedClassName}
      style={mergedStyle}
      {...rest}
    />
  );
});

// Expose static methods with background image
['info', 'success', 'error', 'warning', 'confirm'].forEach((method) => {
  ModalPro[method] = (config) => {
    const { style, className, ...rest } = config || {};
    const mergedStyle = { ...modalBgStyle, ...style };
    const mergedClassName = mergeClassName('modal-pro-bg', className);
    return Modal[method]({
      ...rest,
      className: mergedClassName,
      style: mergedStyle,
    });
  };
});

ModalPro.destroyAll = Modal.destroyAll;

export default ModalPro;
