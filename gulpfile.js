/* ================================================
 * Hexo 静态资源优化脚本 (兼容 ESM/CommonJS)
 * 功能：安全地压缩 JS/CSS/HTML
 * 特点：
 * - 自动检测模块系统
 * - 兼容 Node.js 12+
 * - 完善的错误处理
 * ================================================ */

// 核心模块
const gulp = require("gulp");

// 配置参数
const config = {
  publicDir: "./public",
  excludes: {
    js: ["**/*.min.js", "**/tw_cn.js"],
    css: [],
  },
};

// 安全加载模块函数
async function safeRequire(moduleName) {
  try {
    // 尝试 CommonJS 方式
    return require(moduleName);
  } catch (e) {
    if (e.code === "ERR_REQUIRE_ESM") {
      // 如果是 ESM 模块则动态导入
      const module = await import(moduleName);
      // 对于 ESM 模块，优先返回 default 导出，如果没有则返回整个模块
      // 但某些模块可能只有命名导出，需要检查 default 是否存在
      if (module.default !== undefined) {
        return module.default;
      }
      // 如果没有 default 导出，检查是否有同名的命名导出
      const moduleParts = moduleName.split("/").pop().replace("gulp-", "");
      if (module[moduleParts]) {
        return module[moduleParts];
      }
      return module;
    }
    throw e;
  }
}

// 异步任务错误处理包装器
function taskWrapper(fn) {
  return async function (cb) {
    try {
      await fn();
      cb();
    } catch (err) {
      console.error("[任务错误]", err);
      cb(err);
    }
  };
}

// ==================== 任务定义 ====================

// 压缩 JS
gulp.task(
  "compress",
  taskWrapper(async () => {
    const terser = await safeRequire("gulp-terser");

    console.log("正在压缩 JS 文件...");
    return gulp
      .src([
        `${config.publicDir}/**/*.js`,
        ...config.excludes.js.map((ex) => `!${config.publicDir}/${ex}`),
      ])
      .pipe(terser())
      .on("error", (err) => console.error("[JS压缩错误]", err))
      .pipe(gulp.dest(config.publicDir));
  })
);

// 压缩 CSS
gulp.task(
  "minify-css",
  taskWrapper(async () => {
    const cleanCSS = await safeRequire("gulp-clean-css");

    console.log("正在压缩 CSS 文件...");
    return gulp
      .src(`${config.publicDir}/**/*.css`)
      .pipe(
        cleanCSS({
          compatibility: "ie11",
          rebase: false,
        })
      )
      .on("error", (err) => console.error("[CSS压缩错误]", err))
      .pipe(gulp.dest(config.publicDir));
  })
);

// 压缩 HTML
gulp.task(
  "minify-html",
  taskWrapper(async () => {
    const htmlclean = await safeRequire("gulp-htmlclean");
    const htmlmin = await safeRequire("gulp-html-minifier-terser");

    console.log("正在压缩 HTML 文件...");
    return gulp
      .src(`${config.publicDir}/**/*.html`)
      .pipe(htmlclean())
      .pipe(
        htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true,
        })
      )
      .on("error", (err) => console.error("[HTML压缩错误]", err))
      .pipe(gulp.dest(config.publicDir));
  })
);

// 清理任务
gulp.task(
  "clean",
  taskWrapper(async () => {
    try {
      const del = await safeRequire("del");
      const deleteFn = del.deleteAsync || del; // 兼容新旧版本

      await deleteFn(
        [
          `${config.publicDir}/**/*~`,
          `${config.publicDir}/**/*.bak`,
          `${config.publicDir}/**/.DS_Store`, // 新增 Mac 系统文件清理
        ],
        {
          force: true, // 允许删除项目目录外的文件
        }
      );

      console.log("清理完成");
    } catch (err) {
      console.error("清理过程中出错:", err);
      throw err;
    }
  })
);

// ==================== 任务组合 ====================
gulp.task("default", gulp.parallel("compress", "minify-css", "minify-html"));

gulp.task("build", gulp.series("clean", "default"));

/* ================================================
 * npm install gulp gulp-terser gulp-clean-css gulp-html-minifier-terser gulp-htmlclean del gulp-debug --save-dev
 * 使用说明：
 * 1. 开发优化: gulp
 * 2. 完整构建: gulp build
 * 3. 支持 Node.js 12+ 和 ESM/CommonJS 模块
 * ================================================ */
// hexo clean
// hexo generate
// gulp build
// hexo server 或 hexo deploy
