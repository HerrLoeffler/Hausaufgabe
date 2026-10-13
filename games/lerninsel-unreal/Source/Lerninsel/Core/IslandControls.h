#pragma once
#include <cmath>
namespace Island {inline float NormalizeSensitivity(float v){if(!std::isfinite(v))return 1.f;return v<.25f?.25f:v>3.f?3.f:v;}}
