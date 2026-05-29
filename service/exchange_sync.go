package service

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
)

// exchangeSyncRequest 兑换码同步请求体
type exchangeSyncRequest struct {
	RedemptionCode string `json:"redemption_code"`
	ExternalUserID int    `json:"external_user_id"`
}

// exchangeSyncResponse 兑换码同步响应体
type exchangeSyncResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

// SyncExchangeRedeem 同步兑换码到外部平台
func SyncExchangeRedeem(redemptionCode string, userID int) error {
	setting := operation_setting.GetExchangeSyncSetting()
	if !setting.Enabled || setting.ApiUrl == "" {
		return nil
	}

	reqBody := exchangeSyncRequest{
		RedemptionCode: redemptionCode,
		ExternalUserID: userID,
	}

	jsonData, err := common.Marshal(reqBody)
	if err != nil {
		common.SysError(fmt.Sprintf("exchange sync: failed to marshal request: %s", err.Error()))
		return fmt.Errorf("exchange sync: failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", setting.ApiUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		common.SysError(fmt.Sprintf("exchange sync: failed to create request: %s", err.Error()))
		return fmt.Errorf("exchange sync: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if setting.AuthToken != "" {
		req.Header.Set("X-Exchange-Token", setting.AuthToken)
	}

	client := GetHttpClient()
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}

	resp, err := client.Do(req)
	if err != nil {
		common.SysError(fmt.Sprintf("exchange sync: failed to call api: %s", err.Error()))
		return fmt.Errorf("exchange sync: failed to call api: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		common.SysError(fmt.Sprintf("exchange sync: failed to read response: %s", err.Error()))
		return fmt.Errorf("exchange sync: failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		common.SysError(fmt.Sprintf("exchange sync: api returned status %d, body: %s", resp.StatusCode, string(body)))
		return fmt.Errorf("exchange sync: api returned status %d", resp.StatusCode)
	}

	var syncResp exchangeSyncResponse
	if err := common.Unmarshal(body, &syncResp); err != nil {
		common.SysError(fmt.Sprintf("exchange sync: failed to parse response: %s", err.Error()))
		return fmt.Errorf("exchange sync: failed to parse response: %w", err)
	}

	if !syncResp.Success {
		common.SysError(fmt.Sprintf("exchange sync: api returned failure: %s", syncResp.Message))
		return fmt.Errorf("exchange sync: api returned failure: %s", syncResp.Message)
	}

	common.SysLog(fmt.Sprintf("exchange sync: successfully synced redemption code %s for user %d", redemptionCode, userID))
	return nil
}