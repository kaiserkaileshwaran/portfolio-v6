import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Text,
  Environment,
  ContactShadows,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

const smoothRange = (t, start, end) => {
  if (t <= start) return 0;
  if (t >= end) return 1;
  const p = (t - start) / (end - start);
  return p * p * (3 - 2 * p);
};
const themeColors = {
  sunrise: { codeColor: "#FF5500" },
  day: { codeColor: "#0284c7" },
  sunset: { codeColor: "#E74C3C" },
  night: { codeColor: "#22c55e" },
};

// 100% Native WebGL Coding Animation
const AnimatedCodeLines = ({ color, isTyping }) => {
  const [lines] = useState(() => {
    const linesArr = [];
    let delay = 0;
    const speed = 20.0;

    const addLine = (finalY, indent, width, myDelay) => {
      linesArr.push({
        finalY,
        indent,
        targetWidth: width,
        speed,
        delay: myDelay,
      });
    };

    // 1. Header Files (Top 3 lines sequential)
    addLine(0, 0, 2.0, delay);
    delay += 0.15;
    addLine(1, 0, 1.8, delay);
    delay += 0.15;
    addLine(2, 0, 2.2, delay);
    delay += 0.15;

    // Space and main function opens
    addLine(3, 0, 0, delay); // blank line
    addLine(4, 0, 1.5, delay);
    delay += 0.15;

    // Main function closes (will be pushed down dynamically)
    addLine(17, 0, 0.5, delay); // main close
    delay += 0.15;

    // Submain 1 opens and closes
    addLine(5, 1, 2.5, delay);
    addLine(9, 1, 0.5, delay);
    delay += 0.15;

    // Code inside Submain 1 (3 lines)
    addLine(6, 2, 1.8, delay);
    delay += 0.15;
    addLine(7, 2, 2.4, delay);
    delay += 0.15;
    addLine(8, 2, 1.5, delay);
    delay += 0.15;

    // Space and Return statement
    addLine(10, 0, 0, delay);
    delay += 0.15;

    addLine(11, 1, 1.2, delay); // return statement
    delay += 0.15;

    return linesArr;
  });

  const lineRefs = useRef([]);
  const timerRef = useRef(0);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (isTyping) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    }
  }, [isTyping]);

  useFrame((state, delta) => {
    if (!isTyping) {
      timerRef.current = 0;
      lines.forEach((line, i) => {
        if (lineRefs.current[i]) lineRefs.current[i].scale.x = 0.0001;
      });
      return;
    }

    timerRef.current += delta;
    const t = timerRef.current;

    if (t > 0 && t < 2.5 && Math.random() < 0.25 && audioCtxRef.current) {
      try {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(
          100 + Math.random() * 50,
          audioCtxRef.current.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
          40,
          audioCtxRef.current.currentTime + 0.02,
        );
        gain.gain.setValueAtTime(0.015, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtxRef.current.currentTime + 0.02,
        );
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.02);
      } catch {}
    }

    lines.forEach((line, i) => {
      if (!lineRefs.current[i]) return;
      const lineTime = Math.max(0, t - line.delay);
      let currentWidth = 0.0001;
      let yIndex = 0;

      if (lineTime > 0) {
        const typeProgress = Math.min(1, lineTime * line.speed);
        currentWidth = typeProgress * line.targetWidth;

        // Dynamic Y-axis positioning: count how many lines with a smaller finalY have been typed so far
        let countAbove = 0;
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].finalY < line.finalY && t >= lines[j].delay) {
            countAbove++;
          }
        }
        yIndex = countAbove;
      }

      lineRefs.current[i].scale.x = Math.max(0.0001, currentWidth);
      const xBase = -1.9 + line.indent * 0.4;
      lineRefs.current[i].position.x = xBase + currentWidth / 2;

      if (lineTime > 0) {
        // Snap to the new line position instantly like a text editor
        lineRefs.current[i].position.y = 1.0 - yIndex * 0.15;
      }
    });
  });

  return (
    <group>
      {lines.map((line, i) => (
        <mesh
          key={i}
          ref={(el) => (lineRefs.current[i] = el)}
          position={[line.xBase, line.y, 0]}
        >
          <planeGeometry args={[1, 0.08]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const createGradientTexture = (centerColor, edgeColor) => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  // Radial gradient: center to edges
  const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 350);
  gradient.addColorStop(0, centerColor); // Lightest in the very center
  gradient.addColorStop(1, edgeColor); // Darker at the edges

  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

// Very Light Metallic Sky Blue
const casingTexture = createGradientTexture("#B3D8F5", "#8EBCD9");
const trackpadTexture = createGradientTexture("#C0DFF8", "#8EBFED");

const RoundedKey = React.forwardRef(
  ({ width, height, depth, radius, ...props }, ref) => {
    const shape = React.useMemo(() => {
      const s = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      s.moveTo(x, y + radius);
      s.lineTo(x, y + height - radius);
      s.quadraticCurveTo(x, y + height, x + radius, y + height);
      s.lineTo(x + width - radius, y + height);
      s.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      s.lineTo(x + width, y + radius);
      s.quadraticCurveTo(x + width, y, x + width - radius, y);
      s.lineTo(x + radius, y);
      s.quadraticCurveTo(x, y, x, y + radius);
      return s;
    }, [width, height, radius]);

    const extrudeSettings = React.useMemo(
      () => ({
        depth: depth,
        bevelEnabled: false,
      }),
      [depth],
    );

    const geomRef = React.useRef();
    React.useLayoutEffect(() => {
      if (geomRef.current) {
        geomRef.current.center();
      }
    }, [shape, extrudeSettings]);

    return (
      <mesh ref={ref} {...props}>
        <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />
        {props.children}
      </mesh>
    );
  },
);

const TouchIdKey = React.forwardRef(
  ({ width, height, depth, radius, ...props }, ref) => {
    const shape = React.useMemo(() => {
      const s = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      s.moveTo(x, y + radius);
      s.lineTo(x, y + height - radius);
      s.quadraticCurveTo(x, y + height, x + radius, y + height);
      s.lineTo(x + width - radius, y + height);
      s.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      s.lineTo(x + width, y + radius);
      s.quadraticCurveTo(x + width, y, x + width - radius, y);
      s.lineTo(x + radius, y);
      s.quadraticCurveTo(x, y, x, y + radius);

      // Create a circular hole for the Touch ID scanner pad
      const hole = new THREE.Path();
      hole.absarc(0, 0, 0.09, 0, Math.PI * 2, false);
      s.holes.push(hole);

      return s;
    }, [width, height, radius]);

    const extrudeSettings = React.useMemo(
      () => ({
        depth: depth,
        bevelEnabled: false,
      }),
      [depth],
    );

    const geomRef = React.useRef();
    React.useLayoutEffect(() => {
      if (geomRef.current) {
        geomRef.current.center();
      }
    }, [shape, extrudeSettings]);

    return (
      <group ref={ref} {...props}>
        <mesh>
          <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />
          {props.children}
        </mesh>

        {/* Touch ID Shiny Metallic Ring (Recessed down to create a depth cut) */}
        <mesh position={[0, 0, 0.005]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.09, 0.004, 16, 64]} />
          <meshStandardMaterial
            color="#aaaaaa"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* The flat scanner pad nested inside the metallic ring (Recessed) */}
        <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          {/* Slightly thicker to fill the bottom of the cut */}
          <cylinderGeometry args={[0.086, 0.086, 0.01, 64]} />
          <meshStandardMaterial
            color="#050505"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      </group>
    );
  },
);

const ScissorMechanism = React.memo(({ width, height }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* White plastic scissor frame (Visibly 3D) */}
      <mesh position={[0, 0.0015, 0]}>
        <boxGeometry args={[width * 0.65, 0.003, height * 0.65]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Central rubber dome (Visibly 3D) */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.002, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
});

const RoundedPlane = React.forwardRef(
  ({ width, height, radius, ...props }, ref) => {
    const geomRef = React.useRef();

    React.useEffect(() => {
      if (geomRef.current) {
        const pos = geomRef.current.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
          uvs[i * 2] = (pos.getX(i) + width / 2) / width;
          uvs[i * 2 + 1] = (pos.getY(i) + height / 2) / height;
        }
        geomRef.current.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        geomRef.current.attributes.uv.needsUpdate = true;
      }
    }, [width, height, radius]);

    const shape = React.useMemo(() => {
      const s = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      s.moveTo(x, y + radius);
      s.lineTo(x, y + height - radius);
      s.quadraticCurveTo(x, y + height, x + radius, y + height);
      s.lineTo(x + width - radius, y + height);
      s.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      s.lineTo(x + width, y + radius);
      s.quadraticCurveTo(x + width, y, x + width - radius, y);
      s.lineTo(x + radius, y);
      s.quadraticCurveTo(x, y, x, y + radius);
      return s;
    }, [width, height, radius]);

    return (
      <mesh ref={ref} {...props}>
        <shapeGeometry args={[shape]} ref={geomRef} />
        {props.children}
      </mesh>
    );
  },
);

const HollowPort = React.forwardRef(
  ({ width, height, thickness, depth, radius, ...props }, ref) => {
    const shape = React.useMemo(() => {
      // Outer shape
      const s = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      s.moveTo(x, y + radius);
      s.lineTo(x, y + height - radius);
      s.quadraticCurveTo(x, y + height, x + radius, y + height);
      s.lineTo(x + width - radius, y + height);
      s.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      s.lineTo(x + width, y + radius);
      s.quadraticCurveTo(x + width, y, x + width - radius, y);
      s.lineTo(x + radius, y);
      s.quadraticCurveTo(x, y, x, y + radius);

      // Inner hole
      const hole = new THREE.Path();
      const ix = x + thickness;
      const iy = y + thickness;
      const iw = width - thickness * 2;
      const ih = height - thickness * 2;
      const ir = Math.max(0.001, radius - thickness);

      hole.moveTo(ix, iy + ir);
      hole.lineTo(ix, iy + ih - ir);
      hole.quadraticCurveTo(ix, iy + ih, ix + ir, iy + ih);
      hole.lineTo(ix + iw - ir, iy + ih);
      hole.quadraticCurveTo(ix + iw, iy + ih, ix + iw, iy + ih - ir);
      hole.lineTo(ix + iw, iy + ir);
      hole.quadraticCurveTo(ix + iw, iy, ix + iw - ir, iy);
      hole.lineTo(ix + ir, iy);
      hole.quadraticCurveTo(ix, iy, ix, iy + ir);

      s.holes.push(hole);
      return s;
    }, [width, height, thickness, radius]);

    const extrudeSettings = React.useMemo(
      () => ({
        depth: depth,
        bevelEnabled: false,
      }),
      [depth],
    );

    const geomRef = React.useRef();
    React.useLayoutEffect(() => {
      if (geomRef.current) geomRef.current.center();
    }, [shape, extrudeSettings]);

    return (
      <mesh ref={ref} {...props}>
        <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />
        {props.children}
      </mesh>
    );
  },
);

const RoundedChassis = React.forwardRef(
  ({ width, height, depth, radius, ...props }, ref) => {
    const shape = React.useMemo(() => {
      const s = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      s.moveTo(x, y + radius);
      s.lineTo(x, y + height - radius);
      s.quadraticCurveTo(x, y + height, x + radius, y + height);
      s.lineTo(x + width - radius, y + height);
      s.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      s.lineTo(x + width, y + radius);
      s.quadraticCurveTo(x + width, y, x + width - radius, y);
      s.lineTo(x + radius, y);
      s.quadraticCurveTo(x, y, x, y + radius);
      return s;
    }, [width, height, radius]);

    const extrudeSettings = React.useMemo(
      () => ({
        depth: Math.max(0.01, depth - 0.04), // 0.04 is 2 * bevelThickness
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      }),
      [depth],
    );

    // ExtrudeGeometry extrudes along Z from 0 to depth.
    // We center it on Z by shifting the geometry.
    const geomRef = React.useRef();
    React.useLayoutEffect(() => {
      if (geomRef.current) {
        geomRef.current.center();
      }
    }, [shape, extrudeSettings]);

    return (
      <mesh ref={ref} {...props}>
        <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />
        {props.children}
      </mesh>
    );
  },
);

const MacBookKeyboard = ({ scrollRef, backlightIntensity }) => {
  const emojiTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048; // Ultra-high resolution for maximum clarity
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Native OS Emojis
    ctx.font =
      '72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const emojis = "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 ☺️ 😊 😇 🙂 🙃 😉 😌".split(" ");
    const step = canvas.width / emojis.length;
    for (let i = 0; i < emojis.length; i++) {
      ctx.fillText(emojis[i], i * step + step / 2, canvas.height / 2 + 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16; // Maximum anisotropic filtering for extreme sharpness
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  const keys = React.useMemo(() => {
    const k = [];
    const layout = [
      [
        { w: 1, label: "esc", align: "bl" },
        { w: "TOUCH_BAR" },
        { w: "TOUCH_ID" },
      ],
      [
        { w: 1, label: "~\n`" },
        { w: 1, label: "!\n1" },
        { w: 1, label: "@\n2" },
        { w: 1, label: "#\n3" },
        { w: 1, label: "$\n4" },
        { w: 1, label: "%\n5" },
        { w: 1, label: "^\n6" },
        { w: 1, label: "&\n7" },
        { w: 1, label: "*\n8" },
        { w: 1, label: "(\n9" },
        { w: 1, label: ")\n0" },
        { w: 1, label: "_\n-" },
        { w: 1, label: "+\n=" },
        { w: 1.5, label: "delete", align: "br" },
      ],
      [
        { w: 1.5, label: "tab", align: "bl" },
        { w: 1, label: "Q" },
        { w: 1, label: "W" },
        { w: 1, label: "E" },
        { w: 1, label: "R" },
        { w: 1, label: "T" },
        { w: 1, label: "Y" },
        { w: 1, label: "U" },
        { w: 1, label: "I" },
        { w: 1, label: "O" },
        { w: 1, label: "P" },
        { w: 1, label: "{\n[" },
        { w: 1, label: "}\n]" },
        { w: 1, label: "|\n\\" },
      ],
      [
        { w: 1.75, label: "caps lock", align: "bl" },
        { w: 1, label: "A" },
        { w: 1, label: "S" },
        { w: 1, label: "D" },
        { w: 1, label: "F" },
        { w: 1, label: "G" },
        { w: 1, label: "H" },
        { w: 1, label: "J" },
        { w: 1, label: "K" },
        { w: 1, label: "L" },
        { w: 1, label: ":\n;" },
        { w: 1, label: "\"\n'" },
        { w: 1.75, label: "return", align: "br" },
      ],
      [
        { w: 2.25, label: "shift", align: "bl" },
        { w: 1, label: "Z" },
        { w: 1, label: "X" },
        { w: 1, label: "C" },
        { w: 1, label: "V" },
        { w: 1, label: "B" },
        { w: 1, label: "N" },
        { w: 1, label: "M" },
        { w: 1, label: "<\n," },
        { w: 1, label: ">\n." },
        { w: 1, label: "?\n/" },
        { w: 2.25, label: "shift", align: "br" },
      ],
      [
        { w: 1, label: "🌐", subLabel: "fn", align: "fn_special" },
        { w: 1, label: "^", subLabel: "control", align: "bl" },
        { w: 1, label: "⌥", subLabel: "option", align: "bl" },
        { w: 1.25, label: "⌘", subLabel: "command", align: "bl" },
        { w: 5.0, label: "" },
        { w: 1.25, label: "⌘", subLabel: "command", align: "br" },
        { w: 1, label: "⌥", subLabel: "option", align: "bl" },
        { w: "ARROW_CLUSTER" },
      ],
    ];

    const u = 0.3;
    const gapX = 0.04;
    const keyDepth = 0.24;
    const gapZ = 0.045;

    const startX = -2.455; // Left edge centered (14.5u width)
    const startZ = -1.5625; // Top edge centered in well (-0.85)

    layout.forEach((rowArr, rowIndex) => {
      let currentX = startX;
      const z = startZ + rowIndex * (keyDepth + gapZ);

      rowArr.forEach((keyDef) => {
        const type = keyDef.w;
        const label = keyDef.label;

        if (type === "ARROW_CLUSTER") {
          const arrowGapZ = 0.008; // Hairline gap
          const arrowD = (keyDepth - arrowGapZ) / 2;
          const upZ = z - keyDepth / 2 + arrowD / 2;
          const downZ = z + keyDepth / 2 - arrowD / 2;

          // Left Arrow (Half Height, aligns with Down Arrow)
          k.push({
            x: currentX + (1 * u) / 2,
            z: downZ,
            w: 1 * u,
            d: arrowD,
            label: "LEFT_ARROW",
          });
          currentX += 1 * u + gapX;
          // Up Arrow
          k.push({
            x: currentX + (1 * u) / 2,
            z: upZ,
            w: 1 * u,
            d: arrowD,
            label: "▲",
          });
          // Down Arrow
          k.push({
            x: currentX + (1 * u) / 2,
            z: downZ,
            w: 1 * u,
            d: arrowD,
            label: "▼",
          });
          currentX += 1 * u + gapX;
          // Right Arrow
          k.push({
            x: currentX + (1 * u) / 2,
            z: downZ,
            w: 1 * u,
            d: arrowD,
            label: "RIGHT_ARROW",
          });
          currentX += 1 * u + gapX;
        } else if (type === "TOUCH_BAR") {
          const touchBarActualWidth = 4.31;
          const touchBarDepth = keyDepth;
          k.push({
            x: currentX + touchBarActualWidth / 2,
            z,
            w: touchBarActualWidth,
            d: touchBarDepth,
            isTouchBar: true,
          });
          currentX += touchBarActualWidth + gapX;
        } else if (type === "TOUCH_ID") {
          const w = keyDepth;
          k.push({
            x: currentX + w / 2,
            z,
            w,
            d: keyDepth,
            isTouchId: true,
          });
          currentX += w + gapX;
        } else {
          const isTopRow = rowIndex === 0;
          const finalDepth = keyDepth;
          const actualWidth = isTopRow
            ? finalDepth
            : type * u + (type - 1) * gapX;
          k.push({
            x: currentX + actualWidth / 2,
            z,
            w: actualWidth,
            d: finalDepth,
            label,
            subLabel: keyDef.subLabel,
            align: keyDef.align,
          });
          currentX += actualWidth + gapX;
        }
      });
    });

    return k;
  }, []);

  const keysRef = React.useRef([]);
  const hoveredRefs = React.useRef(new Array(keys.length).fill(false));

  useFrame((state, delta) => {
    let keysFactor = 0;
    if (scrollRef && scrollRef.current) {
      const t = Math.sin(scrollRef.current * Math.PI);
      keysFactor = smoothRange(t, 0.4, 0.7);
    }

    keysRef.current.forEach((mesh, i) => {
      if (!mesh || !keys[i]) return;

      const isHovered = hoveredRefs.current[i];
      let targetY = 0.0502; // Default resting height

      if (keysFactor > 0.001) {
        // Global scroll disassembly (Random but strictly bounded so no key is low)
        let variance = Math.abs(
          (Math.sin(i * 12.9898 + keys[i].x * 78.233) * 43758.5453) % 1,
        );
        variance = 0.75 + variance * 0.25; // Maps [0, 1] to [0.75, 1.0]
        const maxHeight = 1.5;
        targetY = 0.0502 + keysFactor * (variance * (maxHeight - 0.0502));
      } else if (isHovered) {
        // Local hover lifting with a playful bounce
        targetY =
          0.0502 + 0.15 + Math.sin(state.clock.elapsedTime * 15) * 0.015;
      }

      if (keysFactor > 0.001) {
        // Scroll physics: absolute 1:1 responsiveness, no smoothing!
        mesh.position.y = targetY;
      } else {
        // Hover physics: smooth lerp
        mesh.position.y = THREE.MathUtils.lerp(
          mesh.position.y,
          targetY,
          delta * 15.0,
        );
      }
      mesh.position.x = keys[i].x;
      mesh.position.z = keys[i].z;
      mesh.rotation.set(0, 0, 0);
    });
  });

  return (
    <group>
      {/* Static Base Layer: Backlight Halos & Mechanical Scissor Switches */}
      {keys.map((key, i) => (
        <group key={`base-${i}`} position={[key.x, 0.0502, key.z]}>
          {/* Key Backlight Halo (Hidden for Touch Bar) */}

          {/* Mechanical Scissor Switch (Hidden for Touch Bar) */}
          {!key.isTouchBar && <ScissorMechanism width={key.w} height={key.d} />}
        </group>
      ))}

      {/* Interactive Floating Keycaps */}
      {keys.map((key, i) => (
        <group
          key={i}
          ref={(el) => (keysRef.current[i] = el)}
          position={[key.x, 0.0502, key.z]}
          onPointerOver={(e) => {
            e.stopPropagation();
            hoveredRefs.current[i] = true;
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            hoveredRefs.current[i] = false;
          }}
        >
          {key.isTouchBar ? (
            <group position={[0, 0.0025, 0]}>
              {/* Ultra-thin Glass Touch Bar Screen */}
              <RoundedKey
                width={key.w}
                height={key.d}
                depth={0.005}
                radius={0.02}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial
                  color="#000000"
                  metalness={0.9}
                  roughness={0.05}
                />
              </RoundedKey>
              {/* Ultra-High Clarity Native Emojis (Bypasses 3D SDF glitches for perfect yellow faces) */}
              <group position={[0, 0.0051, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  {/* Plane matching the Touch Bar size minus some padding */}
                  <planeGeometry args={[key.w - 0.2, key.d - 0.1]} />
                  <meshBasicMaterial
                    map={emojiTexture}
                    transparent={true}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            </group>
          ) : key.isTouchId ? (
            <TouchIdKey
              width={key.w}
              height={key.d}
              depth={0.02}
              radius={0.05}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color="#0a0a0a"
                roughness={0.8}
                metalness={0.2}
              />
            </TouchIdKey>
          ) : (
            <group>
              <RoundedKey
                width={key.w}
                height={key.d}
                depth={0.02}
                radius={key.d < 0.15 ? 0.015 : 0.03}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial color="#050505" roughness={0.8} />
              </RoundedKey>
              {key.label ? (
                <>
                  <Text
                    position={[
                      key.label === "LEFT_ARROW"
                        ? -0.007
                        : key.label === "RIGHT_ARROW"
                          ? 0.007
                          : key.align === "fn_special"
                            ? -key.w / 2 + 0.055
                            : key.align === "bl"
                              ? -key.w / 2 +
                                (key.label === "caps lock" ? 0.085 : 0.12)
                              : key.align === "br"
                                ? key.w / 2 - 0.12
                                : 0,
                      0.021,
                      key.label === "▲" || key.label === "▼"
                        ? -0.006
                        : key.align === "fn_special"
                          ? key.d / 2 - 0.035
                          : key.align
                            ? key.d / 2 - (key.subLabel ? 0.085 : 0.045)
                            : 0,
                    ]}
                    rotation={[
                      -Math.PI / 2,
                      0,
                      key.label === "LEFT_ARROW"
                        ? Math.PI / 2
                        : key.label === "RIGHT_ARROW"
                          ? -Math.PI / 2
                          : 0,
                    ]}
                    fontSize={
                      key.subLabel
                        ? key.label === "🌐"
                          ? 0.055
                          : 0.065 // Massive for detached symbols (⌘) except globe
                        : ["LEFT_ARROW", "▲", "▼", "RIGHT_ARROW"].includes(
                              key.label,
                            )
                          ? 0.035 // Tiny for half-height arrow keys
                          : key.label.length === 1
                            ? 0.09 // Huge for single letters (Q, W, E...)
                            : key.label.includes("\n") && key.label.length <= 4
                              ? 0.065 // Medium for symbols with numbers (!\n1)
                              : 0.04 // Smaller for words (caps lock, esc, tab, fn)
                    }
                    anchorX={
                      key.align === "fn_special"
                        ? "left"
                        : key.label === "caps lock" ||
                            key.label === "shift" ||
                            key.label === "tab" ||
                            key.label === "delete" ||
                            key.label === "return"
                          ? key.align === "bl"
                            ? "left"
                            : key.align === "br"
                              ? "right"
                              : "center"
                          : "center"
                    }
                    anchorY={key.align ? "bottom" : "middle"}
                    textAlign="center"
                    color={backlightIntensity > 0.5 ? "#ffffff" : "#dddddd"}
                    fillOpacity={1.0}
                    lineHeight={1.7}
                  >
                    {key.label === "LEFT_ARROW"
                      ? "▲"
                      : key.label === "RIGHT_ARROW"
                        ? "▲"
                        : key.label}
                  </Text>
                  {key.subLabel && (
                    <Text
                      position={[
                        key.align === "fn_special"
                          ? key.w / 2 - 0.055
                          : key.align === "bl"
                            ? -key.w / 2 + 0.12
                            : key.align === "br"
                              ? key.w / 2 - 0.12
                              : 0,
                        0.021,
                        key.align === "fn_special"
                          ? key.d / 2 - 0.045
                          : key.align
                            ? key.d / 2 - 0.035
                            : 0,
                      ]}
                      rotation={[-Math.PI / 2, 0, 0]}
                      fontSize={key.subLabel === "fn" ? 0.035 : 0.03} // Tiny for modifier words
                      anchorX={key.align === "fn_special" ? "right" : "center"}
                      anchorY="bottom"
                      textAlign="center"
                      color={backlightIntensity > 0.5 ? "#ffffff" : "#dddddd"}
                      fillOpacity={1.0}
                    >
                      {key.subLabel}
                    </Text>
                  )}
                  {key.label === "caps lock" && (
                    <mesh
                      position={[-key.w / 2 + 0.085, 0.021, -0.055]}
                      rotation={[-Math.PI / 2, 0, 0]}
                    >
                      <circleGeometry args={[0.008, 16]} />
                      <meshStandardMaterial
                        color="#88ff88"
                        emissive="#00ff00"
                        emissiveIntensity={2}
                      />
                    </mesh>
                  )}
                </>
              ) : null}
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

const CameraNotch = React.forwardRef(
  ({ width, height, radius, ...props }, ref) => {
    const shape = React.useMemo(() => {
      const s = new THREE.Shape();
      // Origin at center (0,0)
      // We want flat top, rounded bottom corners
      const w = width / 2;
      const h = height / 2;

      s.moveTo(-w, h); // Top left (sharp)
      s.lineTo(-w, -h + radius); // Down to bottom left
      s.quadraticCurveTo(-w, -h, -w + radius, -h); // Bottom left curve
      s.lineTo(w - radius, -h); // Bottom edge
      s.quadraticCurveTo(w, -h, w, -h + radius); // Bottom right curve
      s.lineTo(w, h); // Top right (sharp)
      s.lineTo(-w, h); // Back to start

      return s;
    }, [width, height, radius]);

    const geomRef = React.useRef();
    React.useLayoutEffect(() => {
      if (geomRef.current) geomRef.current.center();
    }, [shape]);

    return (
      <mesh ref={ref} {...props}>
        <shapeGeometry ref={geomRef} args={[shape]} />
        {props.children}
      </mesh>
    );
  },
);

const UltraRealisticMacBook = ({ config, theme }) => {
  const wallpaperTex = useTexture("/images/wallpaper.png");
  wallpaperTex.colorSpace = THREE.SRGBColorSpace;
  const groupRef = useRef();
  const screenRef = useRef();
  const baseRef = useRef();
  const trackpadRef = useRef();
  const { viewport } = useThree();

  const [isOpen, setIsOpen] = useState(false);
  const logoMaterialRef = React.useRef();
  const [isTyping, setIsTyping] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);

  const scrollRef = useRef(0);
  const appScale = useRef(0);
  const appWindowRef = useRef();

  useEffect(() => {
    const t1 = setTimeout(() => setIsOpen(true), 300);
    const t2 = setTimeout(() => setIsAppOpen(true), 1200);
    const t3 = setTimeout(() => setIsTyping(true), 1800);

    const handleScroll = () => {
      const maxScroll = Math.max(
        1,
        document.body.scrollHeight - window.innerHeight,
      );
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((state, delta) => {
    const progress = scrollRef.current;
    const t = Math.sin(progress * Math.PI); // 0 -> 1 -> 0

    // Calculate highly sequenced, staggered disassembly factors
    const screenF = smoothRange(t, 0.0, 0.4); // Phase 1: Screen detaches
    const baseF = smoothRange(t, 0.1, 0.5); // Phase 2: Base drops away
    const trackpadF = smoothRange(t, 0.7, 1.0); // Phase 4: Trackpad flies out last

    if (screenRef.current) {
      // Smoothly animate the base open/close state (time-based)
      if (!screenRef.current.openProgress) screenRef.current.openProgress = 0;
      screenRef.current.openProgress = THREE.MathUtils.lerp(
        screenRef.current.openProgress,
        isOpen ? 1 : 0,
        0.05,
      );

      const targetRotation = THREE.MathUtils.lerp(
        Math.PI / 2,
        -0.15,
        screenRef.current.openProgress,
      );

      // Apply exact 1:1 scroll physics on top of the base rotation!
      screenRef.current.rotation.x = targetRotation - screenF * 0.5;

      screenRef.current.position.y = 0.05 + screenF * 1.5;
      screenRef.current.position.z = -1.91 - screenF * 0.8;
    }

    if (baseRef.current) {
      baseRef.current.position.y = -(baseF * 1.2);
      baseRef.current.rotation.x = baseF * 0.2;
    }

    if (trackpadRef.current) {
      trackpadRef.current.position.y = 0.051 + trackpadF * 0.8;
      trackpadRef.current.position.z = 0.95;
      trackpadRef.current.rotation.x = 0;
    }

    // Spring animation for App Window
    if (isAppOpen) {
      appScale.current = THREE.MathUtils.lerp(
        appScale.current,
        1.0,
        delta * 8.0,
      );
    } else {
      appScale.current = 0;
    }

    if (appWindowRef.current) {
      appWindowRef.current.scale.setScalar(appScale.current);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = -0.3 + progress * Math.PI * 2;
    }
  });

  const responsiveScale = Math.min(1.1, viewport.width / 7.0);
  const desktopYOffset = Math.max(0, (viewport.width - 5.0) * 0.1);
  const yPos = -0.2 - Math.min(1.0, desktopYOffset);

  // Dynamic backlight that dims during the day and shines bright at night
  const getBacklightIntensity = () => {
    switch (theme) {
      case "day":
        return 0.0;
      case "sunrise":
        return 0.6;
      case "sunset":
        return 0.8;
      case "night":
        return 1.5;
      default:
        return 0.8;
    }
  };
  const backlightIntensity = getBacklightIntensity();

  return (
    <group
      ref={groupRef}
      position={[0, yPos, 0]}
      rotation={[0.2, -0.3, 0]}
      scale={responsiveScale}
    >
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.3}>
        {/* ================= BASE ================= */}
        <group ref={baseRef} position={[0, 0, 0]}>
          <RoundedChassis
            width={5.8}
            height={3.82}
            depth={0.1}
            radius={0.25}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              map={casingTexture}
              metalness={0.7}
              roughness={0.25}
              color="#ffffff"
            />
          </RoundedChassis>

          {/* Authentic MacBook Hinge Barrel (Black antenna/vent cover) */}
          <mesh position={[0, 0, -0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 4.2, 32]} />
            <meshStandardMaterial
              color="#111111"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* ====== LAPTOP PORTS (ULTRA REALISTIC HARDWARE) ====== */}
          {/* Left Side: MagSafe + 2x USB-C */}
          <group position={[-2.92, 0, 0]}>
            {/* MagSafe 3 Port at Z = -1.5625 */}
            <group position={[0, 0, -1.5625]}>
              {/* Black Void Base (stops Z-fighting, sits flush on chassis) */}
              <RoundedKey
                width={0.17}
                height={0.026}
                depth={0.001}
                radius={0.012}
                position={[-0.0005, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial color="#000000" roughness={1.0} />
              </RoundedKey>
              {/* Outer Hardware Rim (Proud of the chassis to create illusion of depth) */}
              <HollowPort
                width={0.19}
                height={0.03}
                thickness={0.006}
                depth={0.006}
                radius={0.015}
                position={[-0.003, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  map={casingTexture}
                  metalness={0.8}
                  roughness={0.3}
                  color="#e0e0e0"
                />
              </HollowPort>
              {/* Inner Aluminum Core */}
              <RoundedKey
                width={0.15}
                height={0.016}
                depth={0.004}
                radius={0.008}
                position={[-0.002, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  map={casingTexture}
                  metalness={0.7}
                  roughness={0.4}
                  color="#d0d0d0"
                />
              </RoundedKey>
              {/* 5 High-Detail Gold Pins (MagSafe) */}
              {[-0.04, -0.02, 0, 0.02, 0.04].map((zOffset, i) => (
                <group key={`pin-${i}`} position={[-0.0041, 0, zOffset]}>
                  {/* Tiny black receptacle slot behind each pin to make it pop visually */}
                  <mesh position={[0.001, 0, 0]}>
                    <boxGeometry args={[0.002, 0.006, 0.012]} />
                    <meshBasicMaterial color="#000000" />
                  </mesh>
                  {/* High-poly Gold Pin (Rotated to point out of the chassis along X) */}
                  <mesh
                    position={[-0.0005, 0, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    {/* Thicker, 32-segment cylinder for ultra-smooth circular pins */}
                    <cylinderGeometry args={[0.002, 0.002, 0.002, 32]} />
                    {/* Rich, highly reflective gold material */}
                    <meshStandardMaterial
                      color="#FFD700"
                      metalness={1.0}
                      roughness={0.1}
                      emissive="#221100"
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                </group>
              ))}
            </group>

            {/* USB-C Port 1 at Z = -1.3325 */}
            <group position={[0, 0, -1.3325]}>
              {/* Black Void Base */}
              <RoundedKey
                width={0.11}
                height={0.018}
                depth={0.001}
                radius={0.009}
                position={[-0.0005, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial color="#000000" roughness={1.0} />
              </RoundedKey>
              {/* Outer Hardware Rim */}
              <HollowPort
                width={0.13}
                height={0.024}
                thickness={0.005}
                depth={0.006}
                radius={0.012}
                position={[-0.003, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  map={casingTexture}
                  metalness={0.8}
                  roughness={0.3}
                  color="#e0e0e0"
                />
              </HollowPort>
              {/* Inner Connector Tongue */}
              <RoundedKey
                width={0.08}
                height={0.004}
                depth={0.004}
                radius={0.002}
                position={[-0.002, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  color="#1a1a1a"
                  metalness={0.5}
                  roughness={0.7}
                />
              </RoundedKey>
            </group>

            {/* USB-C Port 2 at Z = -1.1325 */}
            <group position={[0, 0, -1.1325]}>
              {/* Black Void Base */}
              <RoundedKey
                width={0.11}
                height={0.018}
                depth={0.001}
                radius={0.009}
                position={[-0.0005, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial color="#000000" roughness={1.0} />
              </RoundedKey>
              {/* Outer Hardware Rim */}
              <HollowPort
                width={0.13}
                height={0.024}
                thickness={0.005}
                depth={0.006}
                radius={0.012}
                position={[-0.003, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  map={casingTexture}
                  metalness={0.8}
                  roughness={0.3}
                  color="#e0e0e0"
                />
              </HollowPort>
              {/* Inner Connector Tongue */}
              <RoundedKey
                width={0.08}
                height={0.004}
                depth={0.004}
                radius={0.002}
                position={[-0.002, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <meshStandardMaterial
                  color="#1a1a1a"
                  metalness={0.5}
                  roughness={0.7}
                />
              </RoundedKey>
            </group>
          </group>

          {/* Right Side: 3.5mm Headphone Jack (Aligned with Row 0 / Function Keys at Z = -1.5625) */}
          <group position={[2.92, 0, -1.5625]}>
            {/* Black Void Base (Flush with chassis) */}
            <mesh position={[0.0005, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.001, 32]} />
              <meshStandardMaterial color="#000000" roughness={1.0} />
            </mesh>
            {/* Outer Hardware Rim (Flat pipe, not a bulging donut) */}
            <HollowPort
              width={0.032}
              height={0.032}
              thickness={0.004}
              depth={0.006}
              radius={0.016}
              position={[0.003, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <meshStandardMaterial
                map={casingTexture}
                metalness={0.8}
                roughness={0.3}
                color="#e0e0e0"
              />
            </HollowPort>
          </group>

          {/* ForceTouch Trackpad */}
          <group ref={trackpadRef} position={[0, 0.051, 0.95]}>
            <RoundedPlane
              width={2.4}
              height={1.4}
              radius={0.1}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                map={trackpadTexture}
                metalness={0.65}
                roughness={0.35}
                color="#ffffff"
              />
            </RoundedPlane>
          </group>

          {/* Keyboard Well */}
          <RoundedPlane
            width={5.2}
            height={1.9}
            radius={0.15}
            position={[0, 0.0502, -0.85]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              map={casingTexture}
              metalness={0.7}
              roughness={0.25}
              color="#ffffff"
            />
          </RoundedPlane>

          <MacBookKeyboard
            scrollRef={scrollRef}
            backlightIntensity={backlightIntensity}
          />
        </group>

        {/* ================= SCREEN ================= */}
        {/* Hinge Pivot Point at Z=-1.91. Y is 0.05 to perfectly seal the gap when closed */}
        <group
          ref={screenRef}
          position={[0, 0.05, -1.91]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          {/* Aluminum Screen Casing (Height 3.82, perfectly matches Base chassis!) */}
          <RoundedChassis
            width={5.8}
            height={3.82}
            depth={0.06}
            radius={0.25}
            position={[0, 1.91, -0.03]}
          >
            <meshStandardMaterial
              map={casingTexture}
              metalness={0.7}
              roughness={0.25}
              color="#ffffff"
            />
          </RoundedChassis>

          {/* Authentic MacBook Air Hinge Barrel (Black plastic antenna/vent cover) */}
          <mesh position={[0, 0, -0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 4.4, 32]} />
            <meshStandardMaterial
              color="#111111"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Developer Logo (Back of Screen - Glossy aluminum in day, glowing white at night when open!) */}
          <Text
            position={[0, 1.91, -0.071]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.8}
            anchorX="center"
            anchorY="middle"
          >
            {"</>"}
            {theme === "night" ? (
              <meshStandardMaterial
                ref={logoMaterialRef}
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0}
                depthTest={false}
              />
            ) : (
              <meshStandardMaterial
                color="#e0e0e0"
                metalness={1.0}
                roughness={0.05}
                depthTest={false}
              />
            )}
          </Text>

          {/* Edge-to-Edge Black Glass Bezel (Center 1.91, Height 3.78) */}
          <RoundedPlane
            width={5.76}
            height={3.78}
            radius={0.24}
            position={[0, 1.91, 0.005]}
          >
            <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
          </RoundedPlane>

          {/* Native 16:10 Wallpaper Background (Rounded corners to perfectly fit inside the glass bezel!) */}
          <RoundedPlane
            width={5.7}
            height={3.72}
            radius={0.21}
            position={[0, 1.91, 0.006]}
          >
            <meshBasicMaterial
              map={wallpaperTex}
              toneMapped={false}
              color={theme === "night" ? "#777777" : "#ffffff"}
            />
          </RoundedPlane>

          {/* Subtle Full-Width Glass Line (Menu Bar styling without elements) */}
          <mesh position={[0, 3.725, 0.0065]}>
            <planeGeometry args={[5.7, 0.15]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
          </mesh>

          {/* MacBook Air Realistic Camera Notch (Restored, Very Shallow height, flush against screen Z-index) */}
          <group position={[0, 3.74, 0.007]}>
            <CameraNotch width={0.5} height={0.12} radius={0.03}>
              <meshBasicMaterial color="#000000" />
            </CameraNotch>
            {/* The actual Camera Lens (Glassy, visible) */}
            <mesh position={[0, -0.01, 0.001]}>
              <circleGeometry args={[0.02, 32]} />
              <meshStandardMaterial
                color="#0a2a4a"
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
            <mesh position={[0, -0.01, 0.002]}>
              <circleGeometry args={[0.01, 16]} />
              <meshBasicMaterial color="#1a4a7a" />
            </mesh>
            {/* Camera LED Indicator */}
            <mesh position={[0.08, -0.01, 0.001]}>
              <circleGeometry args={[0.004, 16]} />
              <meshBasicMaterial color="#020202" />
            </mesh>
          </group>

          {/* The App Window */}
          <group ref={appWindowRef} position={[0, 1.91, 0.01]} scale={0}>
            {/* Window Background */}
            <RoundedPlane
              width={4.275}
              height={2.79}
              radius={0.06}
              position={[0, 0, 0]}
            >
              <meshBasicMaterial
                color={theme === "night" ? "#050505" : "#e5e7eb"}
              />
            </RoundedPlane>

            {/* Window Top Bar (Top edge 1.395, height 0.12, center 1.335) */}
            <RoundedPlane
              width={4.275}
              height={0.12}
              radius={0.06}
              position={[0, 1.335, 0.001]}
            >
              <meshBasicMaterial
                color={theme === "night" ? "#161b22" : "#d1d5db"}
              />
            </RoundedPlane>

            {/* Mac Traffic Light Buttons (Moved tight to the left edge) */}
            <mesh position={[-2.05, 1.335, 0.002]}>
              <circleGeometry args={[0.025, 16]} />
              <meshBasicMaterial color="#ff5f56" />
            </mesh>
            <mesh position={[-1.95, 1.335, 0.002]}>
              <circleGeometry args={[0.025, 16]} />
              <meshBasicMaterial color="#ffbd2e" />
            </mesh>
            <mesh position={[-1.85, 1.335, 0.002]}>
              <circleGeometry args={[0.025, 16]} />
              <meshBasicMaterial color="#27c93f" />
            </mesh>

            {/* Typing Code Animation inside the App Window */}
            <group position={[0, 0.1, 0.002]}>
              <AnimatedCodeLines color={config.codeColor} isTyping={isTyping} />
            </group>
          </group>
        </group>
      </Float>
    </group>
  );
};

const ThreeDObject = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.body.getAttribute("data-theme") || "night";
    }
    return "night";
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setTheme(document.body.getAttribute("data-theme") || "night");
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const config = themeColors[theme] || themeColors.night;

  // Dynamic global lighting that responds perfectly to the time of day / theme
  const getGlobalLightIntensity = () => {
    switch (theme) {
      case "day":
        return 1.0;
      case "sunrise":
        return 0.6;
      case "sunset":
        return 0.5;
      case "night":
        return 0.2;
      default:
        return 0.5;
    }
  };
  const globalLightIntensity = getGlobalLightIntensity();

  return (
    <div className="w-full h-full relative" style={{ pointerEvents: "auto" }}>
      <Canvas
        camera={{ position: [0, 1, 9], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.5 * globalLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5 * globalLightIntensity}
        />
        <pointLight
          position={[-5, -5, 5]}
          intensity={1 * globalLightIntensity}
        />

        <UltraRealisticMacBook config={config} theme={theme} />

        {/* Environment and floor */}
        <Environment
          preset="city"
          environmentIntensity={globalLightIntensity}
        />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.5}
          scale={20}
          blur={2}
          far={4.5}
          color="#87ceeb"
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.0}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDObject;
