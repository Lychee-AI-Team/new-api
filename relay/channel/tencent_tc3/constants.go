package tencent_tc3

// ModelList 腾讯混元大模型列表（三段式密钥，TC3 签名 API）
// 仅包含不支持 OpenAI 兼容接口的模型
// 使用 TC3-HMAC-SHA256 签名，域名 hunyuan.tencentcloudapi.com
// 密钥格式：AppID|SecretID|SecretKey
var ModelList = []string{
	"hunyuan-translation",      // 旗舰级翻译模型
	"hunyuan-translation-lite", // 高性价比翻译模型
}

var ChannelName = "tencent_tc3"
