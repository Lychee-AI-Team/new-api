package tencent

// ModelList 腾讯混元大模型列表
// 使用 OpenAI 兼容接口（api.hunyuan.cloud.tencent.com/v1）
// 文档参考：https://cloud.tencent.com/document/product/1729/104753
var ModelList = []string{
	// 旗舰生文模型
	"hunyuan-turbos-latest",         // 旗舰快思考模型（最新版），推理能力强，响应快
	"hunyuan-t1-latest",             // 深度推理模型（最新版），类似 o1 慢思考
	"hunyuan-2.0-thinking-20251109", // 混元 2.0 思考版，支持深度思考
	"hunyuan-2.0-instruct-20251111", // 混元 2.0 常规版，高性价比
	"hunyuan-a13b",                  // 混合推理模型

	// 轻量模型74
	"hunyuan-lite", // 轻量版（免费模型）

	// 多模态视觉模型
	"hunyuan-turbos-vision",       // TurboS 视觉版，图文理解
	"hunyuan-vision-1.5-instruct", // 视觉 1.5 增强版
	"hunyuan-t1-vision-20250916",  // T1 视觉版，图文深度推理
	"hunyuan-turbos-vision-video", // TurboS 视频理解版

	// 专用模型
	"hunyuan-large-role-latest", // 角色扮演/AI 数字人模型
	"hunyuan-functioncall",      // Function Calling 专用模型

	// Embedding 模型
	"hunyuan-embedding", // 文本向量化模型

	// 已补充的新增模型
	"hunyuan-pro",
	"hunyuan-vision",
	"hunyuan-standard",
	"hunyuan-standard-32K",
	"hunyuan-standard-256k",
	"hunyuan-code",
	"hunyuan-role",
	"hunyuan-turbo-vision",
	"hunyuan-turbo",
	"hunyuan-turbo-latest",
	"hunyuan-large",
	"hunyuan-large-longcontext",
	"hunyuan-turbos-20250226",
	"hunyuan-turbos-20250313",
	"hunyuan-t1-20250321",
	"hunyuan-t1-vision",
	"hunyuan-turbos-20250515",
	"hunyuan-large-vision",
	"hunyuan-t1-20250529",
	"hunyuan-turbos-20250604",
	"hunyuan-turbos-vision-20250619",
	"hunyuan-t1-vision-20250619",
	"hunyuan-t1-20250711",
	"hunyuan-turbos-20250716",
	"hunyuan-vision-7b-20250720",
	"hunyuan-t1-20250822",
	"hunyuan-turbos-20250926",
	"hunyuan-turbos-role-20251114",
	"hunyuan-role-latest",
}

var ChannelName = "tencent"
