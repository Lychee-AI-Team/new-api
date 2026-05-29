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

import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Spin } from '@douyinfe/semi-ui';
import {
  API,
  showError,
  showSuccess,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';

export default function SettingsExchangeSync(props) {
  const { t } = useTranslation();
  const sectionTitle = props.hideSectionTitle ? undefined : t('兑换码同步设置');
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    ExchangeSyncEnabled: false,
    ExchangeSyncApiUrl: '',
    ExchangeSyncAuthToken: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  const formApiRef = useRef(null);

  useEffect(() => {
    if (props.options && formApiRef.current) {
      const currentInputs = {
        ExchangeSyncEnabled: props.options.ExchangeSyncEnabled || false,
        ExchangeSyncApiUrl: props.options.ExchangeSyncApiUrl || '',
        ExchangeSyncAuthToken: props.options.ExchangeSyncAuthToken || '',
      };
      setInputs(currentInputs);
      setOriginInputs({ ...currentInputs });
      formApiRef.current.setValues(currentInputs);
    }
  }, [props.options]);

  const handleFormChange = (values) => {
    setInputs(values);
  };

  const submitExchangeSyncSettings = async () => {
    setLoading(true);
    try {
      const options = [];

      if (originInputs.ExchangeSyncEnabled !== inputs.ExchangeSyncEnabled) {
        options.push({
          key: 'exchange_sync_setting.enabled',
          value: inputs.ExchangeSyncEnabled.toString(),
        });
      }
      if (originInputs.ExchangeSyncApiUrl !== inputs.ExchangeSyncApiUrl) {
        options.push({
          key: 'exchange_sync_setting.api_url',
          value: inputs.ExchangeSyncApiUrl,
        });
      }
      if (originInputs.ExchangeSyncAuthToken !== inputs.ExchangeSyncAuthToken) {
        options.push({
          key: 'exchange_sync_setting.auth_token',
          value: inputs.ExchangeSyncAuthToken,
        });
      }

      if (options.length === 0) {
        showSuccess(t('没有需要更新的配置'));
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        options.map((option) =>
          API.put('/api/option/', {
            key: option.key,
            value: option.value,
          }),
        ),
      );

      const errorResults = results.filter((res) => !res.data.success);
      if (errorResults.length === 0) {
        showSuccess(t('更新成功'));
        setOriginInputs({ ...inputs });
        props.refresh && props.refresh();
      } else {
        errorResults.forEach((res) => {
          showError(res.data.message);
        });
      }
    } catch (error) {
      showError(t('更新失败'));
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <Form
        initValues={inputs}
        onValueChange={handleFormChange}
        getFormApi={(api) => (formApiRef.current = api)}
      >
        <Form.Section text={sectionTitle}>
          <Form.Switch
            field='ExchangeSyncEnabled'
            label={t('启用兑换码同步')}
            extraText={t('开启后，用户兑换码充值成功后会同步到外部平台')}
          />
          <Form.Input
            field='ExchangeSyncApiUrl'
            label={t('同步接口地址')}
            placeholder={'https://example.com/api/exchange/redeem'}
            style={{ width: '100%' }}
            extraText={t('外部平台兑换码同步接口的完整 URL')}
          />
          <Form.Input
            field='ExchangeSyncAuthToken'
            label={t('认证 Token')}
            placeholder={'X-Exchange-Token 的值'}
            style={{ width: '100%' }}
            extraText={t('请求头 X-Exchange-Token 的认证值')}
          />
          <Button onClick={submitExchangeSyncSettings} style={{ marginTop: 16 }}>
            {t('保存兑换码同步设置')}
          </Button>
        </Form.Section>
      </Form>
    </Spin>
  );
}
