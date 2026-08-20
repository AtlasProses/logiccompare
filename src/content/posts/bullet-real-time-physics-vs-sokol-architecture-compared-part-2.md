---
title: "Bullet Real-Time Physics vs. Sokol : Architecture Compared (Part 2)"
meta_title: "Bullet Real-Time Physics vs. Sokol : Architectur... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Bullet Real-Time Physics and Sokol Cross-Platform Graphics, dissecting architecture, trade-offs, and failure modes."
date: 2026-02-13T15:11:14.170Z
image: "/images/posts/bullet-real-time-physics-vs-sokol-architecture-compared-part-2-cover.webp"
categories: ["Gaming"]
authors: ["Alexander Reyes"]
tags: ["Bullet RealTime", "Sokol CrossPlatform"]
draft: false
---

*This is Part 2 of the series. [Read Part 1 here](/blog/bullet-real-time-physics-vs-sokol-architecture-compared).*

---

## Frequently Asked Questions (Strategic FAQ)



### **1. "Should I use Bullet for a 2D game, or is Box2D a better fit?"**
**Answer:**
**No—use Box2D or a custom solution instead.** Bullet is **not optimized for 2D** and carries **unnecessary overhead** (3D collision detection, soft-body support). Here’s why:
- **Performance:** Bullet’s **broad-phase collision (SAP/Dynamic AABB Tree)** is **2-3x slower** than Box2D’s **sweep-and-prune** in 2D.
- **Memory:** Bullet’s **collision cache** consumes **~50MB VRAM** even for simple 2D scenes; Box2D uses **~5MB**.
- **Stability:** Bullet’s **constraint solver** is **overkill for 2D joints** and can introduce **jitter** in platformers.

**Exception:** If you **absolutely need 3D physics in a 2D game** (e.g., *Rayman Legends*-style depth effects), **Bullet is viable—but profile aggressively**.

---


### **2. "Sokol has no MSAA—how do I handle anti-aliasing in a 3D game?"**
**Answer:**
Sokol’s **lack of MSAA is a deliberate trade-off** for **minimalism and portability**, but you have **three battle-tested workarounds**:
1. **FXAA + Manual Supersampling**
   - Render at **2x resolution**, then **downscale with FXAA**.
   - **Pros:** Works on **all platforms**, including WebGL.
   - **Cons:** **~30% GPU overhead** (but still faster than MSAA on mobile).
   - **Example (Sokol shader):**
     ```glsl
     // Fragment shader
     vec4 color = texture(sampler, uv * 2.0); // Render at 2x
     color = fxaa(color); // Apply FXAA
     ```

2. **TAA (Temporal Anti-Aliasing)**
   - **Best for 3D games** (e.g., *Celeste 64*).
   - **Pros:** **Higher quality** than FXAA, **lower overhead** than MSAA.
   - **Cons:** **Requires motion vectors** (not trivial in Sokol’s immediate-mode).
   - **Implementation:**
     - Use **Sokol’s `sg_apply_pipeline`** to bind a **history buffer**.
     - **Reproject** previous frame’s data using **velocity buffers**.

3. **Manual Edge Smoothing (For Pixel Art)**
   - **Best for 2D games** (e.g., *Dead Cells*).
   - **Pros:** **No performance cost**, **pixel-perfect control**.
   - **Cons:** **Only works for static edges**.
   - **Example:**
     ```glsl
     // Fragment shader
     vec4 color = texture(sampler, uv);
     vec4 neighbor = texture(sampler, uv + vec2(0.0, pixelSize.y));
     if (abs(color.r - neighbor.r) > 0.5) {
         color.rgb = mix(color.rgb, neighbor.rgb, 0.5); // Smooth edge
     }
     ```

**Verdict:**
- **For 2D:** **Manual smoothing > FXAA**.
- **For 3D:** **TAA > FXAA** (if you can implement motion vectors).

---


### **3. "Bullet’s GPU acceleration (CUDA/OpenCL) is tempting—should I use it?"**
**Answer:**
**No—unless you’re in a **high-end simulation** (e.g., *NVIDIA Omniverse*) and can **guarantee CUDA support**.** Here’s why:
- **Performance is inconsistent:**
  - **CUDA kernels block the main thread** if not **asynchronously dispatched**.
  - **OpenCL has driver overhead** (~1-2ms per dispatch on AMD GPUs).
- **Stability issues:**
  - **GPU sync stalls** can **freeze the entire application** (especially in VR).
  - **Soft-body physics** often **diverges** on GPU (floating-point precision differences).
- **Portability nightmare:**
  - **CUDA = NVIDIA only.**
  - **OpenCL = driver hell** (Intel/AMD support is spotty).

**When to use GPU acceleration:**
- **Large-scale soft-body simulations** (e.g., *cloth, fluids*).
- **Offline physics baking** (e.g., *destruction pre-computation*).
- **You control the hardware** (e.g., *NVIDIA DGX workstations*).

**When to avoid it:**
- **Games (99% of cases).**
- **Cross-platform projects.**
- **VR (latency is critical).**

**Alternative:**
- **Use Bullet’s CPU parallelism (TBB/TaskFlow)**—**more stable, easier to debug**.

---


### **4. "Sokol’s immediate-mode rendering seems limiting—how do I handle complex 3D scenes?"**
**Answer:**
Sokol’s **immediate-mode is not for *Crysis*—it’s for *Celeste***.** But if you **must** use it for 3D, follow these **hard-learned rules**:
1. **Batch Aggressively**
   - **Problem:** Immediate-mode **rebuilds draw calls every frame**—**10K triangles = 10K draw calls = death**.
   - **Solution:**
     - **Group meshes by material** (same shader, same textures).
     - **Use `sg_update_buffer`** to **stream geometry** (avoid `sg_append_buffer`).
     - **Example:**
       ```c
       // Bad: 1 draw call per mesh
       for (int i = 0; i < 1000; i++) {
           sg_apply_pipeline(pip);
           sg_apply_bindings(&bindings[i]);
           sg_draw(0, 6, 1);
       }

       // Good: 1 draw call for all meshes
       sg_apply_pipeline(pip);
       for (int i = 0; i < 1000; i++) {
           sg_apply_bindings(&bindings[i]);
           sg_draw(0, 6, 1);
       }
       ```

2. **Avoid Dynamic Lighting**
   - **Problem:** Sokol has **no built-in PBR**—**forward rendering is expensive**.
   - **Solution:**
     - **Bake lighting** (use **Blender + glTF**).
     - **Use vertex lighting** (cheap, works on mobile).
     - **Example (vertex shader):**
       ```glsl
       // Instead of 100 dynamic lights, use 1 baked lightmap
       vec3 light = texture(lightmap, uv).rgb;
       color.rgb *= light;
       ```

3. **Fake Shadows with Decals**
   - **Problem:** No **shadow mapping** in Sokol.
   - **Solution:**
     - **Projected decals** (for static shadows).
     - **Screen-space shadows** (for dynamic objects).
     - **Example (decal shader):**
       ```glsl
       // Project a shadow decal onto the ground
       vec4 shadow = texture(shadowTex, uv + vec2(0.0, -0.1));
       color.rgb *= mix(1.0, 0.5, shadow.a);
       ```

4. **Use `SOKOL_GL` for 3D (Not `SOKOL_GFX`)**
   - **Problem:** `sg_*` API is **too low-level** for 3D.
   - **Solution:**
     - **Sokol-GL** (higher-level wrapper) **simplifies 3D rendering**.
     - **Example:**
       ```c
       sgl_begin_triangles();
       sgl_v3f_t2f_c1i(x, y, z, u, v, color);
       sgl_end();
       ```

**Verdict:**
- **For 2D:** Sokol is **perfect**.
- **For simple 3D:** **Sokol-GL + batching**.
- **For complex 3D:** **Use a real engine (Godot, Unreal, Bevy)**.

---


## Synthesized Strategic Verdict & Gotchas



### **The Hard Truth: When to Use (and Avoid) Each Engine**

#### **Bullet Real-Time Physics: The Good, The Bad, The Ugly**
✅ **Use Bullet If:**
- You need **high-fidelity physics** (e.g., *Kerbal Space Program 2*, *Star Citizen*).
- You’re **simulating soft-body dynamics** (cloth, fluids, destruction).
- You **control the hardware** (e.g., **NVIDIA workstations** for CUDA).
- You **have time to tune the solver** (default settings are **too aggressive**).

❌ **Avoid Bullet If:**
- You’re making a **2D game** (use **Box2D**).
- You **can’t afford 100MB+ VRAM** (collision cache is **memory-hungry**).
- You **need cross-platform consistency** (console backends are **fragile**).
- You **don’t have a physics programmer** (Bullet’s **failure modes are subtle**).

🔥 **Battle-Hardened Gotchas:**
1. **Constraint Explosion is Your #1 Enemy**
   - **Symptom:** Joints **detach violently** at high speeds.
   - **Fix:** **Clamp velocities** + **reduce solver iterations** (try **4-6 instead of 10**).
   - **Example:**
     ```cpp
     btDiscreteDynamicsWorld* world = ...;
     world->getSolverInfo().m_numIterations = 6; // Default is 10 (too high)
     ```

2. **Broad-Phase Saturation Kills Performance**
   - **Symptom:** **FPS drops to 10 at 5K+ bodies**.
   - **Fix:** **Switch to Dynamic AABB Tree** + **use LOD physics**.
   - **Example:**
     ```cpp
     btBroadphaseInterface* broadphase = new btDbvtBroadphase(); // Dynamic AABB Tree
     ```

3. **GPU Acceleration is a Trap**
   - **Symptom:** **Random stutters** when mixing CUDA/OpenCL with rendering.
   - **Fix:** **Stick to CPU parallelism (TBB/TaskFlow)**.

4. **Soft-Body Physics is Expensive**
   - **Symptom:** **~5ms/frame for 100 soft bodies**.
   - **Fix:** **Use rigid bodies + joints** where possible.

---
#### **Sokol Cross-Platform Graphics: The Good, The Bad, The Ugly**
✅ **Use Sokol If:**
- You’re making a **2D game** (e.g., *Dead Cells*, *Celeste*).
- You **need cross-platform portability** (WebGL, mobile, consoles).
- You **hate build systems** (single-header, no dependencies).
- You **want minimal overhead** (~18MB VRAM for 1K sprites).

❌ **Avoid Sokol If:**
- You’re making a **3D game** (use **Godot, Unreal, or Bevy**).
- You **need MSAA, PBR, or advanced post-processing**.
- You **can’t batch draw calls manually** (immediate-mode is **not magic**).
- You **need VR** (Sokol-GL is **not VR-ready**).

🔥 **Battle-Hardened Gotchas:**
1. **Shader Cache Invalidation is a Silent Killer**
   - **Symptom:** **400MB VRAM spike on first load**.
   - **Fix:** **Pre-warm shaders** + **use Sokol 1.1.2+**.
   - **Example:**
     ```c
     // Pre-compile shaders in a loading screen
     sg_shader_desc desc = { ... };
     sg_shader shd = sg_make_shader(&desc);
     ```

2. **No Depth Pre-Pass = Overdraw Hell**
   - **Symptom:** **FPS drops in complex scenes**.
   - **Fix:** **Manual depth sorting** + **early-Z rejection**.
   - **Example (shader):**
     ```glsl
     // Fragment shader
     if (gl_FragCoord.z > texture(depthTex, uv).r) discard;
     ```

3. **Immediate-Mode is Not for 3D**
   - **Symptom:** **10K draw calls = 60FPS → 10FPS**.
   - **Fix:** **Batch aggressively** + **use Sokol-GL**.
   - **Example:**
     ```c
     // Bad: 1 draw call per sprite
     for (int i = 0; i < 1000; i++) {
         sg_apply_bindings(&bindings[i]);
         sg_draw(0, 6, 1);
     }

     // Good: 1 draw call for all sprites
     sg_apply_bindings(&batch_bindings);
     sg_draw(0, 6 * 1000, 1);
     ```

4. **No MSAA? Fake It.**
   - **Symptom:** **Jagged edges in pixel art**.
   - **Fix:** **FXAA + supersampling** or **manual edge smoothing**.
   - **Example (FXAA):**
     ```glsl
     vec4 color = texture(sampler, uv * 2.0); // Render at 2x
     color = fxaa(color); // Apply FXAA
     ```

---


### **Final Verdict: Which One Should You Use?**

| **Scenario**               | **Winner**               | **Why?**                                                                 |
|----------------------------|--------------------------|--------------------------------------------------------------------------|
| **AAA 3D Physics**         | **Bullet**               | **High-fidelity, GPU-accelerated, battle-tested.**                      |
| **Indie 2D Game**          | **Sokol**                | **Minimalist, portable, no bloat.**                                     |
| **VR Simulation**          | **Bullet (CPU-only)**    | **Stable, low-latency, no GPU sync stalls.**                            |
| **Cross-Platform Mobile**  | **Sokol**                | **Works on WebGL, iOS, Android—Bullet doesn’t.**                        |
| **Soft-Body Physics**      | **Bullet**               | **No alternative (PhysX is closed-source, Box2D is 2D-only).**          |
| **Embedded Systems**       | **Sokol**                | **~10K LoC, no dependencies, runs on Raspberry Pi.**                     |
| **3D Game (Not Physics)**  | **Neither (Use Godot)**  | **Sokol is too limited; Bullet is overkill.**                           |



### **The One Non-Negotiable Rule**
> **"If you’re not profiling, you’re guessing."**
- **Bullet:** Profile **broad-phase collision** and **constraint solver**—**they’re the bottlenecks**.
- **Sokol:** Profile **draw calls** and **shader compilation**—**they’re the killers**.

**Both engines are tools—not religions.** Use them where they excel, and **don’t force them into roles they weren’t designed for.**