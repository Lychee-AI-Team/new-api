// Package tencent_tc3 腾讯混元大模型渠道适配器（三段式密钥）
// 使用 TC3-HMAC-SHA256 签名，域名 hunyuan.tencentcloudapi.com
// 密钥格式：AppID|SecretID|SecretKey
package tencent_tc3

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/relay/channel"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

// Adaptor 腾讯混元三段式密钥适配器
// 使用 TC3-HMAC-SHA256 签名鉴权
type Adaptor struct {
	Sign      string // TC3 签名字符串
	AppID     int64  // 应用 ID
	Action    string // API Action（ChatCompletions）
	Version   string // API 版本（2023-09-01）
	Timestamp int64  // 请求时间戳
}

// Init 初始化适配器，设置 Action、Version 和 Timestamp
func (a *Adaptor) Init(info *relaycommon.RelayInfo) {
	a.Action = "ChatTranslations"
	a.Version = "2023-09-01"
	a.Timestamp = common.GetTimestamp()
}

// GetRequestURL 返回请求 URL（TC3 API 固定域名 + /）
func (a *Adaptor) GetRequestURL(info *relaycommon.RelayInfo) (string, error) {
	return fmt.Sprintf("%s/", info.ChannelBaseUrl), nil
}

// SetupRequestHeader 设置请求头（TC3 签名相关）
func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Header, info *relaycommon.RelayInfo) error {
	channel.SetupApiRequestHeader(info, c, req)
	req.Set("Authorization", a.Sign)
	req.Set("X-TC-Action", a.Action)
	req.Set("X-TC-Version", a.Version)
	req.Set("X-TC-Timestamp", strconv.FormatInt(a.Timestamp, 10))
	return nil
}

// ConvertOpenAIRequest 转换 OpenAI 请求为腾讯翻译 TC3 格式
// 从 Messages 中提取最后一条 user 消息作为待翻译文本
// 自动检测语言方向：中文→英文，其他→中文
func (a *Adaptor) ConvertOpenAIRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	apiKey := common.GetContextKeyString(c, constant.ContextKeyChannelKey)
	apiKey = strings.TrimPrefix(apiKey, "Bearer ")
	appId, secretId, secretKey, err := parseTencentConfig(apiKey)
	a.AppID = appId
	if err != nil {
		return nil, err
	}

	// 从 Messages 中提取待翻译文本（取最后一条 user 消息）
	var text string
	for i := len(request.Messages) - 1; i >= 0; i-- {
		if request.Messages[i].Role == "user" {
			text = request.Messages[i].StringContent()
			break
		}
	}
	if text == "" {
		return nil, errors.New("no user message found for translation")
	}

	// 自动检测翻译方向：如果包含中文字符则翻译为英文，否则翻译为中文
	source := "en"
	target := "zh"
	if containsChinese(text) {
		source = "zh"
		target = "en"
	}

	translationRequest := &TencentTranslationRequest{
		Model:  request.Model,
		Text:   text,
		Source: source,
		Target: target,
		Stream: request.Stream,
	}

	// 计算 TC3-HMAC-SHA256 签名
	a.Sign = getTencentTranslationSign(*translationRequest, a, secretId, secretKey)
	return translationRequest, nil
}

// ConvertGeminiRequest 不支持 Gemini 格式
func (a *Adaptor) ConvertGeminiRequest(*gin.Context, *relaycommon.RelayInfo, *dto.GeminiChatRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertClaudeRequest 不支持 Claude 格式
func (a *Adaptor) ConvertClaudeRequest(*gin.Context, *relaycommon.RelayInfo, *dto.ClaudeRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertAudioRequest 不支持音频请求
func (a *Adaptor) ConvertAudioRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.AudioRequest) (io.Reader, error) {
	return nil, errors.New("not implemented")
}

// ConvertImageRequest 不支持图片请求
func (a *Adaptor) ConvertImageRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.ImageRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertRerankRequest 不支持 Rerank 请求
func (a *Adaptor) ConvertRerankRequest(c *gin.Context, relayMode int, request dto.RerankRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertEmbeddingRequest 不支持 Embedding 请求
func (a *Adaptor) ConvertEmbeddingRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.EmbeddingRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertOpenAIResponsesRequest 不支持 Responses 格式
func (a *Adaptor) ConvertOpenAIResponsesRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.OpenAIResponsesRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// DoRequest 执行 HTTP 请求
func (a *Adaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (any, error) {
	return channel.DoApiRequest(a, c, info, requestBody)
}

// DoResponse 处理响应，将腾讯私有格式转换为 OpenAI 标准格式
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (usage any, err *types.NewAPIError) {
	if info.IsStream {
		usage, err = tencentStreamHandler(c, info, resp)
	} else {
		usage, err = tencentHandler(c, info, resp)
	}
	return
}

// GetModelList 返回支持的模型列表
func (a *Adaptor) GetModelList() []string {
	return ModelList
}

// GetChannelName 返回渠道名称
func (a *Adaptor) GetChannelName() string {
	return ChannelName
}
