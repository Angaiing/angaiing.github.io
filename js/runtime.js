// 网站运行时间计算
function updateRuntime() {
  const siteStartTime = new Date("10/13/2025 21:00:00"); // 网站诞生时间
  const voyagerStartTime = new Date("08/01/2022 00:00:00"); // 旅行者1号计时起点
  const now = new Date();

  // 计算网站运行时间差(毫秒)
  const timeDiff = now - siteStartTime;

  // 转换为天、小时、分钟、秒
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  // 格式化显示(补零)
  const dnum = days;
  const hnum = hours.toString().padStart(2, "0");
  const mnum = minutes.toString().padStart(2, "0");
  const snum = seconds.toString().padStart(2, "0");

  // 计算旅行者1号距离
  const voyagerSeconds = (now - voyagerStartTime) / 1000;
  const distance = Math.trunc(23400000000 + voyagerSeconds * 17); // 初始距离 + 秒数 × 速度(17km/s)
  const au = (distance / 149597870.7).toFixed(2); // 转换为天文单位

  // 更新页面内容
  const runtimeHtml = `
    本站已运行 ${dnum} 天 ${hnum} 小时 ${mnum} 分 ${snum} 秒<br>
    <span style="font-size:12px;">旅行者一号距地球 ${au} AU,仍在星际流浪 ✨</span>
  `;

  const workboardElement = document.getElementById("workboard");
  if (workboardElement) {
    workboardElement.innerHTML = runtimeHtml;
  }
}

// 每秒更新一次
setInterval(updateRuntime, 1000);

// 页面加载时立即执行一次
updateRuntime();
