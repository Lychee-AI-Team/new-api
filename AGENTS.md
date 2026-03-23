<<<<<<< HEAD
# New API - 代理编码指南

## 项目概述
New API 是基于 Gin 框架的大模型网关与 AI 资产管理系统，使用 Go 1.25.1+ 开发。

## 构建/检查/测试命令

### 构建和运行
```bash
go run main.go                     # 运行后端
make build-frontend                # 构建前端
docker-compose up -d              # Docker 运行
```

### 测试
```bash
go test ./...                      # 运行所有测试
go test ./package/name            # 运行特定包
go test -run TestName ./path       # 运行单个测试
go test -v ./...                  # 详细输出
go test -cover ./...              # 覆盖率
```

### 代码检查
```bash
go fmt ./...                      # 格式化代码
go vet ./...                      # 静态检查
```

## 代码风格指南

### 导入规范
标准库、项目内部包、第三方库分组，组间空行，组内字母顺序。

### 命名约定
- **公开函数/类型**: PascalCase (`GetAllChannels`, `DisableChannel`)
- **私有函数**: camelCase (`formatNotifyType`)
- **常量**: PascalCase (`UserGroupKeyFmt`)
- **JSON 字段**: snake_case (`json:"created_time"`)
- **数据库字段**: snake_case

### 错误处理
```go
err := model.InitDB()
if err != nil {
    common.FatalLog("failed to initialize database: " + err.Error())
    return err
}
```
必须检查所有错误，使用 `common.FatalLog` 或 `common.SysLog` 记录。

### 日志记录
```go
common.SysLog("system started")
common.SysError(fmt.Sprintf("error: %v", err))
middleware.SetUpLogger(server)  // 请求日志
```

### 测试规范
```go
func TestExample(t *testing.T) {
    orig := GlobalVar
    t.Cleanup(func() { GlobalVar = orig })
    require.NoError(t, err)
}
```
使用 `require` 包，修改全局状态时用 `t.Cleanup` 恢复。

### 模型定义（GORM）
```go
type Channel struct {
    Id         int    `json:"id"`
    Status     int    `json:"status" gorm:"default:1"`
    ChannelInfo ChannelInfo `json:"channel_info" gorm:"type:json"`
}

func (c ChannelInfo) Value() (driver.Value, error) { return common.Marshal(&c) }
func (c *ChannelInfo) Scan(value interface{}) error { return common.Unmarshal(value.([]byte), c) }
```

### Context 使用
```go
func RequestId() func(c *gin.Context) {
    return func(c *gin.Context) {
        c.Set(common.RequestIdKey, id)
        c.Next()
    }
}
```
所有 context keys 在 `constant/context_key.go` 中定义为 `ContextKey` 类型。

### 控制器/服务/中间件
遵循 controller/service/model/middleware/router 分层结构。

### DTO 定义
```go
type OpenAIErrorWithStatusCode struct {
    Error      types.OpenAIError `json:"error"`
    StatusCode int               `json:"status_code"`
}
```

### 环境变量
使用 `.env` 文件，通过 `os.Getenv()` 读取，配置初始化在 `InitResources()`。

### 类型定义
```go
type ContextKey string
const (
    ContextKeyUserId ContextKey = "id"
)
```
常量定义在 `constant/` 包中，按功能分组。

## 重要提醒
1. **永远不要提交密钥和凭据**
2. **运行 go fmt 和 go vet** 确保代码质量
3. **使用 require 包** 进行测试断言
4. **遵循现有代码结构**
5. **错误必须检查**，不要忽略 error 返回值
6. **使用统一的日志记录**，避免直接使用 fmt.Println
=======
# AGENTS.md — Project Conventions for new-api

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

## Tech Stack

- **Backend**: Go 1.22+, Gin web framework, GORM v2 ORM
- **Frontend**: React 18, Vite, Semi Design UI (@douyinfe/semi-ui)
- **Databases**: SQLite, MySQL, PostgreSQL (all three must be supported)
- **Cache**: Redis (go-redis) + in-memory cache
- **Auth**: JWT, WebAuthn/Passkeys, OAuth (GitHub, Discord, OIDC, etc.)
- **Frontend package manager**: Bun (preferred over npm/yarn/pnpm)

## Architecture

Layered architecture: Router -> Controller -> Service -> Model

```
router/        — HTTP routing (API, relay, dashboard, web)
controller/    — Request handlers
service/       — Business logic
model/         — Data models and DB access (GORM)
relay/         — AI API relay/proxy with provider adapters
  relay/channel/ — Provider-specific adapters (openai/, claude/, gemini/, aws/, etc.)
middleware/    — Auth, rate limiting, CORS, logging, distribution
setting/       — Configuration management (ratio, model, operation, system, performance)
common/        — Shared utilities (JSON, crypto, Redis, env, rate-limit, etc.)
dto/           — Data transfer objects (request/response structs)
constant/      — Constants (API types, channel types, context keys)
types/         — Type definitions (relay formats, file sources, errors)
i18n/          — Backend internationalization (go-i18n, en/zh)
oauth/         — OAuth provider implementations
pkg/           — Internal packages (cachex, ionet)
web/           — React frontend
  web/src/i18n/  — Frontend internationalization (i18next, zh/en/fr/ru/ja/vi)
```

## Internationalization (i18n)

### Backend (`i18n/`)
- Library: `nicksnyder/go-i18n/v2`
- Languages: en, zh

### Frontend (`web/src/i18n/`)
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Languages: zh (fallback), en, fr, ru, ja, vi
- Translation files: `web/src/i18n/locales/{lang}.json` — flat JSON, keys are Chinese source strings
- Usage: `useTranslation()` hook, call `t('中文key')` in components
- Semi UI locale synced via `SemiLocaleWrapper`
- CLI tools: `bun run i18n:extract`, `bun run i18n:sync`, `bun run i18n:lint`

## Rules

### Rule 1: JSON Package — Use `common/json.go`

All JSON marshal/unmarshal operations MUST use the wrapper functions in `common/json.go`:

- `common.Marshal(v any) ([]byte, error)`
- `common.Unmarshal(data []byte, v any) error`
- `common.UnmarshalJsonStr(data string, v any) error`
- `common.DecodeJson(reader io.Reader, v any) error`
- `common.GetJsonType(data json.RawMessage) string`

Do NOT directly import or call `encoding/json` in business code. These wrappers exist for consistency and future extensibility (e.g., swapping to a faster JSON library).

Note: `json.RawMessage`, `json.Number`, and other type definitions from `encoding/json` may still be referenced as types, but actual marshal/unmarshal calls must go through `common.*`.

### Rule 2: Database Compatibility — SQLite, MySQL >= 5.7.8, PostgreSQL >= 9.6

All database code MUST be fully compatible with all three databases simultaneously.

**Use GORM abstractions:**
- Prefer GORM methods (`Create`, `Find`, `Where`, `Updates`, etc.) over raw SQL.
- Let GORM handle primary key generation — do not use `AUTO_INCREMENT` or `SERIAL` directly.

**When raw SQL is unavoidable:**
- Column quoting differs: PostgreSQL uses `"column"`, MySQL/SQLite uses `` `column` ``.
- Use `commonGroupCol`, `commonKeyCol` variables from `model/main.go` for reserved-word columns like `group` and `key`.
- Boolean values differ: PostgreSQL uses `true`/`false`, MySQL/SQLite uses `1`/`0`. Use `commonTrueVal`/`commonFalseVal`.
- Use `common.UsingPostgreSQL`, `common.UsingSQLite`, `common.UsingMySQL` flags to branch DB-specific logic.

**Forbidden without cross-DB fallback:**
- MySQL-only functions (e.g., `GROUP_CONCAT` without PostgreSQL `STRING_AGG` equivalent)
- PostgreSQL-only operators (e.g., `@>`, `?`, `JSONB` operators)
- `ALTER COLUMN` in SQLite (unsupported — use column-add workaround)
- Database-specific column types without fallback — use `TEXT` instead of `JSONB` for JSON storage

**Migrations:**
- Ensure all migrations work on all three databases.
- For SQLite, use `ALTER TABLE ... ADD COLUMN` instead of `ALTER COLUMN` (see `model/main.go` for patterns).

### Rule 3: Frontend — Prefer Bun

Use `bun` as the preferred package manager and script runner for the frontend (`web/` directory):
- `bun install` for dependency installation
- `bun run dev` for development server
- `bun run build` for production build
- `bun run i18n:*` for i18n tooling
>>>>>>> origin/main
