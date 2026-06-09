package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// ExchangeSyncSetting 兑换码同步配置
type ExchangeSyncSetting struct {
	Enabled   bool   `json:"enabled"`    // 是否启用兑换码同步
	ApiUrl    string `json:"api_url"`    // 同步接口地址
	AuthToken string `json:"auth_token"` // 同步接口认证 Token
}

var exchangeSyncSetting = ExchangeSyncSetting{
	Enabled:   false,
	ApiUrl:    "",
	AuthToken: "",
}

func init() {
	config.GlobalConfig.Register("exchange_sync_setting", &exchangeSyncSetting)
}

func GetExchangeSyncSetting() *ExchangeSyncSetting {
	return &exchangeSyncSetting
}

func IsExchangeSyncEnabled() bool {
	return exchangeSyncSetting.Enabled && exchangeSyncSetting.ApiUrl != ""
}