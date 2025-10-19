/**
 * 优化的星空背景动画
 * 支持移动端性能优化、页面可见性检测
 */
(function () {
  "use strict";

  // ============ 配置参数 ============
  const CONFIG = {
    // 颜色配置 (RGB)
    colors: {
      giant: "180,184,240", // 大星星（蓝色）
      comet: "226,225,224", // 彗星（白色）
      normal: "226,225,142", // 普通星星（黄色）
    },
    // 性能配置
    performance: {
      baseSpeed: 0.05,
      desktopParticleRatio: 0.216, // 桌面端粒子数 = 屏幕宽度 * 比例
      mobileParticleRatio: 0.108, // 移动端减半
      resizeDebounceMs: 200, // resize 防抖时间
    },
    // 移动端检测
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768,
  };

  // ============ 工具函数 ============
  const Utils = {
    // 随机数生成
    random: (min, max) => Math.random() * (max - min) + min,

    // 概率判断
    chance: (percentage) =>
      Math.floor(Math.random() * 1000) + 1 < 10 * percentage,

    // 防抖函数
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  };

  // ============ 星空动画类 ============
  class UniverseAnimation {
    constructor() {
      this.canvas = document.getElementById("universe");
      if (!this.canvas) {
        console.warn("Universe canvas not found");
        return;
      }

      this.ctx = this.canvas.getContext("2d");
      this.particles = [];
      this.animationId = null;
      this.isVisible = true;

      this.init();
    }

    init() {
      this.setupCanvas();
      this.createParticles();
      this.setupEventListeners();
      this.start();
    }

    setupCanvas() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.particleCount = Math.floor(
        this.width *
          (CONFIG.isMobile
            ? CONFIG.performance.mobileParticleRatio
            : CONFIG.performance.desktopParticleRatio)
      );

      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    createParticles() {
      this.particles = [];
      let isInitialLoad = true;

      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(
          new Particle(this.width, this.height, isInitialLoad)
        );
      }

      // 50ms 后允许彗星出现
      setTimeout(() => {
        this.particles.forEach((p) => (p.allowComet = true));
      }, 50);
    }

    setupEventListeners() {
      // 防抖的 resize 处理
      const debouncedResize = Utils.debounce(() => {
        this.setupCanvas();
        this.createParticles();
      }, CONFIG.performance.resizeDebounceMs);

      window.addEventListener("resize", debouncedResize, { passive: true });

      // 页面可见性检测（省电优化）
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
          this.isVisible = false;
        } else {
          this.isVisible = true;
          this.start();
        }
      });
    }

    render() {
      if (!this.isVisible) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        particle.update();
        particle.draw(this.ctx);
      }
    }

    start() {
      if (this.animationId) return;

      const animate = () => {
        this.render();
        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // ============ 粒子类 ============
  class Particle {
    constructor(canvasWidth, canvasHeight, isInitialLoad = false) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.allowComet = !isInitialLoad;
      this.reset();
    }

    reset() {
      // 粒子类型
      this.isGiant = Utils.chance(3);
      this.isComet = !this.isGiant && this.allowComet && Utils.chance(10);

      // 位置
      this.x = Utils.random(0, this.canvasWidth - 10);
      this.y = Utils.random(0, this.canvasHeight);

      // 大小
      this.radius = Utils.random(1.1, 2.6);

      // 速度
      const baseSpeed = CONFIG.performance.baseSpeed;
      const speedMultiplier = this.isComet ? Utils.random(50, 120) : 1;
      this.dx =
        Utils.random(baseSpeed, 6 * baseSpeed) +
        (this.isComet ? baseSpeed * speedMultiplier : 0) +
        2 * baseSpeed;
      this.dy =
        -Utils.random(baseSpeed, 6 * baseSpeed) -
        (this.isComet ? baseSpeed * speedMultiplier : 0);

      // 透明度
      this.opacity = 0;
      this.opacityThreshold = Utils.random(0.2, this.isComet ? 0.6 : 1);
      this.opacityDelta =
        Utils.random(0.0005, 0.002) + (this.isComet ? 0.001 : 0);
      this.fadingIn = true;
      this.fadingOut = false;
    }

    update() {
      // 位置更新
      this.x += this.dx;
      this.y += this.dy;

      // 淡入效果
      if (this.fadingIn) {
        this.opacity += this.opacityDelta;
        if (this.opacity >= this.opacityThreshold) {
          this.fadingIn = false;
        }
      }

      // 淡出效果
      if (this.fadingOut) {
        this.opacity -= this.opacityDelta / 2;
        if (this.opacity <= 0 || this.x > this.canvasWidth || this.y < 0) {
          this.reset();
          this.fadingOut = false;
        }
      }

      // 触发淡出
      if (
        !this.fadingOut &&
        (this.x > this.canvasWidth - this.canvasWidth / 4 || this.y < 0)
      ) {
        this.fadingOut = true;
      }
    }

    draw(ctx) {
      ctx.beginPath();

      if (this.isGiant) {
        // 大星星（发光效果）
        ctx.fillStyle = `rgba(${CONFIG.colors.giant},${this.opacity})`;
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      } else if (this.isComet) {
        // 彗星（拖尾效果）
        ctx.fillStyle = `rgba(${CONFIG.colors.comet},${this.opacity})`;
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);

        // 绘制尾巴
        for (let i = 0; i < 30; i++) {
          const tailOpacity = this.opacity - (this.opacity / 20) * i;
          if (tailOpacity > 0) {
            ctx.fillStyle = `rgba(${CONFIG.colors.comet},${tailOpacity})`;
            ctx.fillRect(
              this.x - (this.dx / 4) * i,
              this.y - (this.dy / 4) * i - 2,
              2,
              2
            );
          }
        }
      } else {
        // 普通星星
        ctx.fillStyle = `rgba(${CONFIG.colors.normal},${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.radius, this.radius);
      }

      ctx.closePath();
      ctx.fill();
    }
  }

  // ============ 初始化 ============
  // 等待 DOM 加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new UniverseAnimation();
    });
  } else {
    new UniverseAnimation();
  }
})();
