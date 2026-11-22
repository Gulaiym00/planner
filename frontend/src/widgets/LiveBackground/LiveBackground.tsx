"use client";

import { useEffect, useRef } from "react";
import { useLiveBackground } from "@/hooks/useLiveBackground";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import styles from "./LiveBackground.module.css";

/** Фон считается в половинном разрешении — на размытом тёмном фоне разницы не видно, а нагрузка в 4 раза меньше */
const RESOLUTION_SCALE = 0.5;
const FRAME_MS = 1000 / 30;
/** Момент анимации для статичного кадра, когда живой фон выключен */
const STILL_TIME = 14;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile error");
  }
  return shader;
}

export function LiveBackground() {
  const [enabled] = useLiveBackground();
  const reducedMotion = usePrefersReducedMotion();
  const animate = enabled && !reducedMotion;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!canvas || !gl) return; // без WebGL остаётся CSS-градиент под холстом

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      gl.useProgram(program);
    } catch (e) {
      console.warn("LiveBackground disabled:", e);
      return;
    }

    // Один треугольник, покрывающий весь экран
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio, 2) * RESOLUTION_SCALE;
      canvas.width = Math.round(window.innerWidth * scale);
      canvas.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      if (!animate) draw(STILL_TIME);
    };
    resize();
    window.addEventListener("resize", resize);

    if (!animate) {
      return () => window.removeEventListener("resize", resize);
    }

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // requestAnimationFrame сам засыпает в свёрнутой вкладке
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      draw(now / 1000);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [animate]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
