export const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Серебристые волны-«ткань», поднимающиеся к краям, луч света по центру,
 * мерцающие частицы, виньетка и лёгкое зерно.
 */
export const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv += uMouse * 0.025;
  float t = uTime;
  float px = 1.0 / uRes.y;
  float ax = abs(uv.x);
  float col = 0.0;

  const int LINES = 36;
  for (int i = 0; i < LINES; i++) {
    float f = float(i) / float(LINES - 1);
    // Линии начинаются низко в центре и поднимаются к краям
    float y = -0.62 + f * 0.18 + pow(ax, 1.7) * (0.55 + f * 0.9);
    y += 0.035 * sin(uv.x * 2.6 + t * 0.35 + f * 4.0) * (0.4 + ax);
    float d = abs(uv.y - y);
    float core = smoothstep(1.8 * px, 0.0, d);
    float halo = 0.0025 / (d + 0.004);
    float side = smoothstep(0.04, 0.6, ax);
    float sheen = 0.35 + 0.65 * (0.5 + 0.5 * sin(f * 9.0 + t * 0.2 + uv.x * 1.5));
    col += (core * 0.5 + halo * 0.045) * side * sheen * (1.0 - f * 0.55);
  }

  // Свечение «пола» и вертикальный луч по центру
  col += 0.22 * exp(-pow(uv.x * 3.0, 2.0) - pow((uv.y + 0.5) * 6.0, 2.0));
  float beam = exp(-pow(uv.x * 14.0, 2.0)) * smoothstep(-0.5, -0.1, uv.y) * smoothstep(0.55, -0.1, uv.y);
  col += beam * (0.3 + 0.08 * sin(t * 1.3));

  // Мерцающие частицы
  vec2 grid = uv * 28.0;
  vec2 id = floor(grid);
  float h = hash(id);
  if (h > 0.93) {
    vec2 offset = vec2(hash(id + 1.3), hash(id + 2.7)) - 0.5;
    float dist = length(fract(grid) - 0.5 - offset * 0.7);
    float twinkle = 0.5 + 0.5 * sin(t * (1.0 + h * 3.0) + h * 40.0);
    col += smoothstep(0.06, 0.0, dist) * twinkle * 0.6;
  }

  col *= smoothstep(1.25, 0.25, length(uv * vec2(0.75, 1.0)));
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.025;

  vec3 c = col * vec3(0.93, 0.94, 0.97);
  c = c / (1.0 + c);
  gl_FragColor = vec4(c + vec3(0.02, 0.02, 0.024), 1.0);
}
`;
