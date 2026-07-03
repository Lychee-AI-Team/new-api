package dto

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
)

func TestImageRequestUnmarshalCapturesAnonymousExtraFields(t *testing.T) {
	raw := []byte(`{
		"model":"Qwen-Image-Edit-2k",
		"prompt":"make it editorial",
		"image_url":"https://example.com/input.jpg",
		"seed":0
	}`)

	var request ImageRequest
	if err := common.Unmarshal(raw, &request); err != nil {
		t.Fatalf("Unmarshal returned error: %v", err)
	}
	if _, ok := request.Extra["image_url"]; !ok {
		t.Fatalf("image_url was not captured as an extra field")
	}
	if _, ok := request.Extra["seed"]; !ok {
		t.Fatalf("seed was not captured as an extra field")
	}

	if string(request.Extra["image_url"]) != `"https://example.com/input.jpg"` {
		t.Fatalf("extra image_url = %s, want quoted input URL", request.Extra["image_url"])
	}
	if string(request.Extra["seed"]) != `0` {
		t.Fatalf("extra seed = %s, want 0", request.Extra["seed"])
	}
}
