type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

interface ShaderLocations {
  position: number;
  uv: number;
  pointer: WebGLUniformLocation;
  viewport: WebGLUniformLocation;
  imageSize: WebGLUniformLocation;
  image: WebGLUniformLocation;
}

interface RendererResources {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  texture: WebGLTexture;
  locations: ShaderLocations;
}

const vertexShader100 = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShader100 = `
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_pointer;
uniform vec2 u_viewport;
uniform vec2 u_imageSize;
varying vec2 v_uv;
void main() {
  float viewportAspect = u_viewport.x / u_viewport.y;
  float imageAspect = u_imageSize.x / u_imageSize.y;
  vec2 sampleUv = v_uv;
  vec2 cropMin = vec2(0.0);
  vec2 cropMax = vec2(1.0);

  if (viewportAspect > imageAspect) {
    float visibleHeight = imageAspect / viewportAspect;
    cropMin.y = (1.0 - visibleHeight) * 0.5;
    cropMax.y = cropMin.y + visibleHeight;
    sampleUv.y = cropMin.y + v_uv.y * visibleHeight;
  } else {
    float visibleWidth = viewportAspect / imageAspect;
    cropMin.x = (1.0 - visibleWidth) * 0.62;
    cropMax.x = cropMin.x + visibleWidth;
    sampleUv.x = cropMin.x + v_uv.x * visibleWidth;
  }

  vec4 baseColor = texture2D(u_image, sampleUv);
  float luminance = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
  float depth = luminance - 0.5;
  sampleUv += u_pointer * depth * 0.004;
  sampleUv = clamp(sampleUv, cropMin, cropMax);
  vec4 color = texture2D(u_image, sampleUv);
  gl_FragColor = vec4(color.rgb, 1.0);
}`;

const vertexShader300 = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShader300 = `#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_pointer;
uniform vec2 u_viewport;
uniform vec2 u_imageSize;
in vec2 v_uv;
out vec4 outColor;
void main() {
  float viewportAspect = u_viewport.x / u_viewport.y;
  float imageAspect = u_imageSize.x / u_imageSize.y;
  vec2 sampleUv = v_uv;
  vec2 cropMin = vec2(0.0);
  vec2 cropMax = vec2(1.0);

  if (viewportAspect > imageAspect) {
    float visibleHeight = imageAspect / viewportAspect;
    cropMin.y = (1.0 - visibleHeight) * 0.5;
    cropMax.y = cropMin.y + visibleHeight;
    sampleUv.y = cropMin.y + v_uv.y * visibleHeight;
  } else {
    float visibleWidth = viewportAspect / imageAspect;
    cropMin.x = (1.0 - visibleWidth) * 0.62;
    cropMax.x = cropMin.x + visibleWidth;
    sampleUv.x = cropMin.x + v_uv.x * visibleWidth;
  }

  vec4 baseColor = texture(u_image, sampleUv);
  float luminance = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
  float depth = luminance - 0.5;
  sampleUv += u_pointer * depth * 0.004;
  sampleUv = clamp(sampleUv, cropMin, cropMax);
  vec4 color = texture(u_image, sampleUv);
  outColor = vec4(color.rgb, 1.0);
}`;

function compileShader(gl: WebGLContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the hero shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("Unable to compile the hero shader.");
  }
  return shader;
}

function getUniform(gl: WebGLContext, program: WebGLProgram, name: string): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error("Unable to locate the hero shader uniform.");
  return location;
}

export function createHeroDepthRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  container: HTMLElement,
): () => void {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  };

  let gl: WebGLContext | null = null;
  let webgl2 = false;
  let resources: RendererResources | null = null;
  let observer: ResizeObserver | null = null;
  let animationFrame = 0;
  let disposed = false;
  let contextLost = false;
  let bounds: DOMRect | null = null;
  let width = 0;
  let height = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const compileResources = () => {
    if (!gl) throw new Error("WebGL is unavailable.");

    let vertex: WebGLShader | null = null;
    let fragment: WebGLShader | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;

    try {
      vertex = compileShader(gl, gl.VERTEX_SHADER, webgl2 ? vertexShader300 : vertexShader100);
      fragment = compileShader(gl, gl.FRAGMENT_SHADER, webgl2 ? fragmentShader300 : fragmentShader100);
      program = gl.createProgram();
      if (!program) throw new Error("Unable to create the hero shader program.");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      vertex = null;
      fragment = null;
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Unable to link the hero shader program.");

      const position = gl.getAttribLocation(program, "a_position");
      const uv = gl.getAttribLocation(program, "a_uv");
      if (position < 0 || uv < 0) throw new Error("Unable to locate the hero shader attributes.");

      buffer = gl.createBuffer();
      if (!buffer) throw new Error("Unable to create the hero geometry.");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );

      texture = gl.createTexture();
      if (!texture) throw new Error("Unable to create the hero texture.");
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      resources = {
        program,
        buffer,
        texture,
        locations: {
          position,
          uv,
          pointer: getUniform(gl, program, "u_pointer"),
          viewport: getUniform(gl, program, "u_viewport"),
          imageSize: getUniform(gl, program, "u_imageSize"),
          image: getUniform(gl, program, "u_image"),
        },
      };
    } catch (error) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      if (texture) gl.deleteTexture(texture);
      throw error;
    }
  };

  const releaseResources = () => {
    if (!gl || !resources) return;
    gl.deleteTexture(resources.texture);
    gl.deleteBuffer(resources.buffer);
    gl.deleteProgram(resources.program);
    resources = null;
  };

  const draw = () => {
    if (!gl || !resources || contextLost || width <= 0 || height <= 0) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(resources.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.buffer);
    gl.enableVertexAttribArray(resources.locations.position);
    gl.vertexAttribPointer(resources.locations.position, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(resources.locations.uv);
    gl.vertexAttribPointer(resources.locations.uv, 2, gl.FLOAT, false, 16, 8);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.texture);
    gl.uniform1i(resources.locations.image, 0);
    gl.uniform2f(resources.locations.pointer, currentX, currentY);
    gl.uniform2f(resources.locations.viewport, width, height);
    gl.uniform2f(resources.locations.imageSize, image.naturalWidth, image.naturalHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (gl.getError() !== gl.NO_ERROR) throw new Error("Unable to draw the hero photograph.");
    canvas.dataset.state = "ready";
  };

  const cancelFrame = () => {
    if (animationFrame === 0) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const fail = () => {
    canvas.dataset.state = "fallback";
    teardown();
  };

  const animate = () => {
    animationFrame = 0;
    if (disposed || contextLost) return;

    currentX += (targetX - currentX) * 0.11;
    currentY += (targetY - currentY) * 0.11;
    try {
      draw();
    } catch {
      fail();
      return;
    }

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      currentX = targetX;
      currentY = targetY;
      try {
        draw();
      } catch {
        fail();
      }
    }
  };

  const requestDraw = () => {
    if (animationFrame === 0 && !disposed && !contextLost) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const resize = () => {
    if (!gl || disposed) return;
    bounds = container.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (width <= 0 || height <= 0) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
    const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    try {
      draw();
    } catch {
      fail();
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!bounds || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    targetY = Math.max(-1, Math.min(1, (0.5 - (event.clientY - bounds.top) / bounds.height) * 2));
    requestDraw();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    requestDraw();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelFrame();
    canvas.removeAttribute("data-state");
  };

  const onContextRestored = () => {
    contextLost = false;
    try {
      resources = null;
      compileResources();
      resize();
    } catch {
      fail();
    }
  };

  function teardown() {
    if (disposed) return;
    disposed = true;
    cancelFrame();
    observer?.disconnect();
    observer = null;
    window.removeEventListener("resize", resize);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    releaseResources();
    gl = null;
    canvas.removeAttribute("data-state");
  }

  try {
    const gl2 = canvas.getContext("webgl2", attributes);
    if (gl2) {
      gl = gl2;
      webgl2 = true;
    } else {
      gl = canvas.getContext("webgl", attributes);
    }
    if (!gl) throw new Error("WebGL is unavailable.");

    const imageUrl = new URL(image.currentSrc || image.src, window.location.href);
    if (imageUrl.origin !== window.location.origin || image.naturalWidth === 0) {
      throw new Error("The hero image is not available to WebGL.");
    }

    compileResources();
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resize);
      observer.observe(container);
    }
    resize();
  } catch {
    canvas.dataset.state = "fallback";
    teardown();
  }

  return teardown;
}
