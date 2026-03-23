// Package tencent 腾讯混元大模型渠道适配器
// 使用 OpenAI 兼容接口：https://api.hunyuan.cloud.tencent.com/v1
// 鉴权方式：Bearer Token（API Key）
// 文档参考：https://cloud.tencent.com/document/product/1729/111007
package tencent

import (
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/relay/channel"
	"github.com/QuantumNous/new-api/relay/channel/openai"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

// Adaptor 腾讯混元适配器
// 基于 OpenAI 兼容接口，请求/响应格式与 OpenAI 完全一致
type Adaptor struct {
}

// Init 初始化适配器（无需额外初始化）
func (a *Adaptor) Init(info *relaycommon.RelayInfo) {
}

// GetRequestURL 构造请求 URL
// 根据不同的 RelayMode 返回对应的 API 路径
func (a *Adaptor) GetRequestURL(info *relaycommon.RelayInfo) (string, error) {
	switch info.RelayMode {
	case constant.RelayModeEmbeddings:
		// Embedding 模型使用 /v1/embeddings 端点
		return fmt.Sprintf("%s/v1/embeddings", info.ChannelBaseUrl), nil
	default:
		// 其他模型统一使用 /v1/chat/completions 端点
		return fmt.Sprintf("%s/v1/chat/completions", info.ChannelBaseUrl), nil
	}
}

// SetupRequestHeader 设置请求头
// 使用标准 Bearer Token 鉴权（与 OpenAI 相同）
func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Header, info *relaycommon.RelayInfo) error {
	channel.SetupApiRequestHeader(info, c, req)
	req.Set("Authorization", "Bearer "+info.ApiKey)
	return nil
}

// ConvertOpenAIRequest 转换 OpenAI 格式请求
// 腾讯混元 OpenAI 兼容接口直接支持 OpenAI 格式，无需转换
func (a *Adaptor) ConvertOpenAIRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}

// ConvertClaudeRequest 转换 Claude 格式请求（不支持）
func (a *Adaptor) ConvertClaudeRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.ClaudeRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertGeminiRequest 转换 Gemini 格式请求（不支持）
func (a *Adaptor) ConvertGeminiRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.GeminiChatRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertAudioRequest 转换音频请求（不支持）
func (a *Adaptor) ConvertAudioRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.AudioRequest) (io.Reader, error) {
	return nil, errors.New("not implemented")
}

// ConvertImageRequest 转换图片请求（不支持）
func (a *Adaptor) ConvertImageRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.ImageRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertRerankRequest 转换 Rerank 请求（不支持）
func (a *Adaptor) ConvertRerankRequest(c *gin.Context, relayMode int, request dto.RerankRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// ConvertEmbeddingRequest 转换 Embedding 请求
// 腾讯混元支持 /v1/embeddings 接口，直接透传请求
func (a *Adaptor) ConvertEmbeddingRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.EmbeddingRequest) (any, error) {
	return request, nil
}

// ConvertOpenAIResponsesRequest 转换 OpenAI Responses 格式请求（不支持）
func (a *Adaptor) ConvertOpenAIResponsesRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.OpenAIResponsesRequest) (any, error) {
	return nil, errors.New("not implemented")
}

// DoRequest 执行 HTTP 请求
func (a *Adaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (any, error) {
	return channel.DoApiRequest(a, c, info, requestBody)
}

// DoResponse 处理响应
// 委托给 openai.Adaptor 处理，因为腾讯混元 OpenAI 兼容接口的响应格式与 OpenAI 完全一致
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (usage any, err *types.NewAPIError) {
	adaptor := openai.Adaptor{}
	return adaptor.DoResponse(c, resp, info)
}

// GetModelList 返回支持的模型列表
func (a *Adaptor) GetModelList() []string {
	return ModelList
}

// GetChannelName 返回渠道名称
func (a *Adaptor) GetChannelName() string {
	return ChannelName
}
