package tencent_tc3

// TencentMessage 腾讯混元消息结构
type TencentMessage struct {
	Role    string `json:"Role"`
	Content string `json:"Content"`
}

// TencentChatRequest 腾讯混元对话请求（TC3 签名格式，ChatCompletions）
// 文档参考：https://cloud.tencent.com/document/product/1729/105701
type TencentChatRequest struct {
	Model       *string           `json:"Model"`
	Messages    []*TencentMessage `json:"Messages"`
	Stream      *bool             `json:"Stream,omitempty"`
	TopP        *float64          `json:"TopP,omitempty"`
	Temperature *float64          `json:"Temperature,omitempty"`
}

// TencentTranslationReference 翻译参考句对
type TencentTranslationReference struct {
	Type        string `json:"Type"`        // 参考类型：sentence
	Text        string `json:"Text"`        // 原文
	Translation string `json:"Translation"` // 译文
}

// TencentTranslationRequest 腾讯混元翻译请求（TC3 签名格式，ChatTranslations）
// 文档参考：https://cloud.tencent.com/document/product/1729/113395
type TencentTranslationRequest struct {
	Model       string                        `json:"Model"`                 // 模型名称
	Text        string                        `json:"Text"`                  // 待翻译文本
	Source      string                        `json:"Source"`                // 源语言（en/zh/ja/ko/fr/de 等）
	Target      string                        `json:"Target"`                // 目标语言
	Stream      bool                          `json:"Stream"`                // 流式开关
	Field       string                        `json:"Field,omitempty"`       // 翻译领域
	GlossaryIDs []string                      `json:"GlossaryIDs,omitempty"` // 术语表 ID
	References  []TencentTranslationReference `json:"References,omitempty"`  // 参考句对
}

// TencentError 腾讯 API 错误信息
type TencentError struct {
	Code    string `json:"Code"`
	Message string `json:"Message"`
}

// TencentUsage 腾讯 API token 使用量
type TencentUsage struct {
	PromptTokens     int `json:"PromptTokens"`
	CompletionTokens int `json:"CompletionTokens"`
	TotalTokens      int `json:"TotalTokens"`
}

// TencentResponseChoices 腾讯 API 响应选项
type TencentResponseChoices struct {
	FinishReason string         `json:"FinishReason,omitempty"` // 流式结束标志位
	Messages     TencentMessage `json:"Message,omitempty"`      // 同步模式返回内容
	Delta        TencentMessage `json:"Delta,omitempty"`        // 流模式返回内容
}

// TencentChatResponse 腾讯混元对话响应
type TencentChatResponse struct {
	Choices []TencentResponseChoices `json:"Choices,omitempty"` // 结果
	Created int64                    `json:"Created,omitempty"` // unix 时间戳
	Id      string                   `json:"Id,omitempty"`      // 会话 id
	Usage   TencentUsage             `json:"Usage,omitempty"`   // token 数量
	Error   TencentError             `json:"Error,omitempty"`   // 错误信息
	Note    string                   `json:"Note,omitempty"`    // 注释
	ReqID   string                   `json:"Req_id,omitempty"`  // 唯一请求 Id
}

// TencentChatResponseSB 腾讯混元对话响应（带 Response 包装层）
type TencentChatResponseSB struct {
	Response TencentChatResponse `json:"Response,omitempty"`
}
