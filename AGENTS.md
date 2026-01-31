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
