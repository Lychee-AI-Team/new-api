package openai

import (
	"bytes"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

func TestConvertImageEditsJSONPreservesImageURLPayload(t *testing.T) {
	t.Parallel()

	raw := `{
		"model":"Qwen-Image-Edit-2k",
		"prompt":"make it editorial",
		"image_url":"https://example.com/input.jpg",
		"size":"1360x2048",
		"seed":0
	}`
	var request dto.ImageRequest
	if err := common.Unmarshal([]byte(raw), &request); err != nil {
		t.Fatalf("Unmarshal returned error: %v", err)
	}

	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/v1/images/edits", strings.NewReader(raw))
	c.Request.Header.Set("Content-Type", "application/json")

	adaptor := &Adaptor{}
	info := &relaycommon.RelayInfo{RelayMode: relayconstant.RelayModeImagesEdits}
	converted, err := adaptor.ConvertImageRequest(c, info, request)
	if err != nil {
		t.Fatalf("ConvertImageRequest returned error: %v", err)
	}

	body, err := common.Marshal(converted)
	if err != nil {
		t.Fatalf("Marshal returned error: %v", err)
	}
	var payload map[string]any
	if err := common.Unmarshal(body, &payload); err != nil {
		t.Fatalf("Unmarshal marshaled payload returned error: %v", err)
	}
	if payload["image_url"] != "https://example.com/input.jpg" {
		t.Fatalf("image_url = %#v, want %q; body=%s", payload["image_url"], "https://example.com/input.jpg", string(body))
	}
	if payload["seed"] != float64(0) {
		t.Fatalf("seed = %#v, want 0; body=%s", payload["seed"], string(body))
	}
	if got := c.Request.Header.Get("Content-Type"); got != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", got)
	}
}

func TestConvertImageEditsMultipartStillForwardsFormData(t *testing.T) {
	t.Parallel()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if err := writer.WriteField("model", "gpt-image-1"); err != nil {
		t.Fatalf("WriteField model returned error: %v", err)
	}
	if err := writer.WriteField("prompt", "edit the image"); err != nil {
		t.Fatalf("WriteField prompt returned error: %v", err)
	}
	if err := writer.WriteField("num_inference_steps", "30"); err != nil {
		t.Fatalf("WriteField num_inference_steps returned error: %v", err)
	}
	part, err := writer.CreateFormFile("image", "input.jpg")
	if err != nil {
		t.Fatalf("CreateFormFile returned error: %v", err)
	}
	if _, err := part.Write([]byte("jpeg-bytes")); err != nil {
		t.Fatalf("writing image part returned error: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close returned error: %v", err)
	}

	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/v1/images/edits", &body)
	c.Request.Header.Set("Content-Type", writer.FormDataContentType())
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		t.Fatalf("ParseMultipartForm returned error: %v", err)
	}

	adaptor := &Adaptor{}
	info := &relaycommon.RelayInfo{RelayMode: relayconstant.RelayModeImagesEdits}
	converted, err := adaptor.ConvertImageRequest(c, info, dto.ImageRequest{Model: "gpt-image-1", Prompt: "edit the image"})
	if err != nil {
		t.Fatalf("ConvertImageRequest returned error: %v", err)
	}
	out, ok := converted.(*bytes.Buffer)
	if !ok {
		t.Fatalf("converted = %T, want *bytes.Buffer", converted)
	}

	mediaType, params, err := mime.ParseMediaType(c.Request.Header.Get("Content-Type"))
	if err != nil {
		t.Fatalf("ParseMediaType returned error: %v", err)
	}
	if mediaType != "multipart/form-data" {
		t.Fatalf("mediaType = %q, want multipart/form-data", mediaType)
	}
	reader := multipart.NewReader(out, params["boundary"])
	form, err := reader.ReadForm(32 << 20)
	if err != nil {
		t.Fatalf("ReadForm returned error: %v", err)
	}
	defer form.RemoveAll()

	if got := form.Value["model"]; len(got) != 1 || got[0] != "gpt-image-1" {
		t.Fatalf("model field = %#v, want gpt-image-1", got)
	}
	if got := form.Value["prompt"]; len(got) != 1 || got[0] != "edit the image" {
		t.Fatalf("prompt field = %#v, want edit the image", got)
	}
	if got := form.Value["num_inference_steps"]; len(got) != 1 || got[0] != "30" {
		t.Fatalf("num_inference_steps field = %#v, want 30", got)
	}
	files := form.File["image"]
	if len(files) != 1 {
		t.Fatalf("image files = %d, want 1", len(files))
	}
	file, err := files[0].Open()
	if err != nil {
		t.Fatalf("opening forwarded image returned error: %v", err)
	}
	defer file.Close()
	imageBytes, err := io.ReadAll(file)
	if err != nil {
		t.Fatalf("reading forwarded image returned error: %v", err)
	}
	if string(imageBytes) != "jpeg-bytes" {
		t.Fatalf("forwarded image bytes = %q, want jpeg-bytes", string(imageBytes))
	}
}

func TestDoRequestForImageEditsUsesRequestContentType(t *testing.T) {
	t.Parallel()
	service.InitHttpClient()

	tests := []struct {
		name        string
		contentType string
		wantPrefix  string
	}{
		{
			name:        "json image_url request",
			contentType: "application/json",
			wantPrefix:  "json:",
		},
		{
			name:        "multipart image upload request",
			contentType: "multipart/form-data; boundary=test-boundary",
			wantPrefix:  "multipart:",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Header.Get("Authorization") != "Bearer test-key" {
					t.Fatalf("Authorization = %q, want Bearer test-key", r.Header.Get("Authorization"))
				}
				w.Header().Set("Content-Type", "application/json")
				if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
					_, _ = w.Write([]byte(`{"data":[{"url":"multipart://ok"}]}`))
					return
				}
				_, _ = w.Write([]byte(`{"data":[{"url":"json://ok"}]}`))
			}))
			defer server.Close()

			gin.SetMode(gin.TestMode)
			recorder := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(recorder)
			c.Request = httptest.NewRequest(http.MethodPost, "/v1/images/edits", strings.NewReader(`{"model":"Qwen-Image-Edit-2k"}`))
			c.Request.Header.Set("Content-Type", tt.contentType)

			adaptor := &Adaptor{}
			info := &relaycommon.RelayInfo{
				RelayMode: relayconstant.RelayModeImagesEdits,
				ChannelMeta: &relaycommon.ChannelMeta{
					ChannelBaseUrl: server.URL,
					ApiKey:         "test-key",
				},
				RequestURLPath: "/v1/images/edits",
			}
			respAny, err := adaptor.DoRequest(c, info, strings.NewReader("request-body"))
			if err != nil {
				t.Fatalf("DoRequest returned error: %v", err)
			}
			resp := respAny.(*http.Response)
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("ReadAll returned error: %v", err)
			}
			if !strings.Contains(string(body), tt.wantPrefix) {
				t.Fatalf("response body = %s, want prefix marker %q", string(body), tt.wantPrefix)
			}
		})
	}
}
