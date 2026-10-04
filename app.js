// 定投富足悠扬人生 - 网页版
// app.js

// 名言列表
const quotes = [
  { text: '定投改变命运。', author: '李笑来', book: '《定投改变命运》' },
  { text: '慢慢变富。', author: '沃伦·巴菲特', book: '' },
  { text: '时间是普通人最好的朋友。', author: '李笑来', book: '《定投改变命运》' },
  { text: '没有人愿意慢慢变富。', author: '沃伦·巴菲特', book: '' },
  { text: '复利是世界的第八大奇迹。', author: '爱因斯坦', book: '' },
  { text: '你现在的生活方式，决定了你未来的样子。', author: '乔治·克莱曼·罗宾逊', book: '' },
  { text: '成功的投资需要耐心和纪律。', author: '彼得·林奇', book: '' },
  { text: '不冒险的人将一事无成。', author: '本杰明·富兰克林', book: '' }
];

// 投资比例配置
const INVEST_CONFIG = {
  nasdaq: 0.6,   // 纳斯达克 60%
  csi300: 0.4    // 沪深300 40%
};

// 获取沪深300历史数据（模拟K线）
function getCSI300History() {
  const base = 3800;
  const data = [];
  let price = base;
  for (let i = 0; i < 30; i++) {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    data.push(price.toFixed(2));
  }
  return data;
}

// 获取纳斯达克历史数据（模拟K线）
function getNasdaqHistory() {
  const base = 17500;
  const data = [];
  let price = base;
  for (let i = 0; i < 30; i++) {
    price = price * (1 + (Math.random() - 0.48) * 0.015);
    data.push(price.toFixed(2));
  }
  return data;
}

// 市场数据缓存
let marketDataCache = {
  nasdaq: null,
  csi300: null,
  nasdaqHistory: null,
  csi300History: null,
  lastUpdate: null
};

// 从 Yahoo Finance 获取纳斯达克数据
async function fetchNasdaqData() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=1mo',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp || [];
      const closes = result.indicators.quote[0].close || [];

      // 获取今日数据
      const todayClose = closes[closes.length - 1];
      const prevClose = closes[closes.length - 2] || closes[closes.length - 1];

      return {
        price: todayClose,
        change: ((todayClose - prevClose) / prevClose * 100).toFixed(2),
        history: closes.slice(-30).map(v => v ? v.toFixed(2) : null).filter(v => v),
        prevClose: prevClose
      };
    }
  } catch (error) {
    console.log('获取纳斯达克数据失败，使用备用数据');
  }
  // 备用：返回模拟数据
  const history = getNasdaqHistory();
  return {
    price: parseFloat(history[history.length - 1]),
    change: (((parseFloat(history[history.length - 1]) - parseFloat(history[history.length - 2])) / parseFloat(history[history.length - 2])) * 100).toFixed(2),
    history: history,
    prevClose: parseFloat(history[history.length - 2])
  };
}

// 获取沪深300数据
function getCSI300Data() {
  const history = getCSI300History();
  const today = parseFloat(history[history.length - 1]);
  const prev = parseFloat(history[history.length - 2]);
  return {
    price: today,
    change: (((today - prev) / prev) * 100).toFixed(2),
    history: history,
    prevClose: prev
  };
}

// 获取并更新市场数据
async function updateMarketData() {
  const now = Date.now();
  if (marketDataCache.lastUpdate && (now - marketDataCache.lastUpdate) < 5 * 60 * 1000) {
    return marketDataCache;
  }

  marketDataCache.nasdaq = await fetchNasdaqData();
  marketDataCache.csi300 = getCSI300Data();
  marketDataCache.lastUpdate = now;

  return marketDataCache;
}

// 生成迷你图表SVG（中国市场：红涨绿跌）
function generateMiniChartSVG(history, isUp) {
  if (!history || history.length < 2) return '';

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const width = 200;
  const height = 40;
  const padding = 2;

  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // 中国市场：涨=红色，跌=绿色
  const color = isUp ? '#FF5252' : '#4CAF50';
  const gradientId = `grad_${Date.now()}`;

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </linearGradient>
      </defs>
      <polygon points="0,${height} ${points} ${width},${height}" fill="url(#${gradientId})"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"/>
    </svg>
  `;
}

// 获取随机名言
function getRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

// 计算积分
function getScore(type, duration) {
  let score = 10; // 基础分

  if (type === 'practice') {
    if (duration >= 120) score += 25;
    else if (duration >= 90) score += 15;
    else if (duration >= 60) score += 10;
    else if (duration >= 30) score += 5;
    else score += 2;
  }

  return score;
}

// 连续打卡里程碑奖励
function getContinuousReward(days) {
  const milestones = {
    3: 3,
    7: 5,
    14: 8,
    21: 10,
    30: 15,
    60: 25,
    100: 50
  };
  return milestones[days] || 0;
}

// 获取今天的日期字符串
function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

// 加载用户列表
function loadUserList() {
  const userList = localStorage.getItem('dingtou_user_list');
  if (userList) {
    return JSON.parse(userList);
  }
  return null;
}

// 保存用户列表
function saveUserList(userList) {
  localStorage.setItem('dingtou_user_list', JSON.stringify(userList));
}

// 获取当前登录用户ID
function getCurrentUserId() {
  return localStorage.getItem('dingtou_current_user');
}

// 设置当前登录用户
function setCurrentUserId(userId) {
  localStorage.setItem('dingtou_current_user', userId);
}

// 加载当前用户数据
function loadUserData() {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const userData = localStorage.getItem(`dingtou_user_${userId}`);
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
}

// 保存当前用户数据
function saveUserData(data) {
  const userId = getCurrentUserId();
  if (!userId) return;
  localStorage.setItem(`dingtou_user_${userId}`, JSON.stringify(data));
}

// 获取指定用户数据（供家长查看）
function getUserDataById(userId) {
  const userData = localStorage.getItem(`dingtou_user_${userId}`);
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
}

// 获取所有用户列表（供家长查看）
function getAllUsers() {
  const userList = loadUserList();
  if (!userList) return [];

  return userList.map(user => {
    const userData = getUserDataById(user.id);
    return { ...user, ...userData };
  });
}

// 创建新用户
function createUser(nickname, isParent = false) {
  const userList = loadUserList() || [];

  // 检查昵称是否重复
  if (userList.some(u => u.nickname === nickname)) {
    return { success: false, message: '昵称已存在' };
  }

  const userId = 'user_' + Date.now();
  const newUser = {
    id: userId,
    nickname: nickname,
    isParent: isParent,
    createdAt: new Date().toISOString()
  };

  const userData = {
    id: userId,
    nickname: nickname,
    isParent: isParent,
    totalAmount: 0,
    continuousDays: 0,
    totalPractice: 0,
    totalSport: 0,
    totalRead: 0,
    lastClockInDate: null
  };

  userList.push(newUser);
  saveUserList(userList);
  localStorage.setItem(`dingtou_user_${userId}`, JSON.stringify(userData));

  return { success: true, user: newUser, userData: userData };
}

// 删除用户
function deleteUser(userId) {
  const userList = loadUserList() || [];
  const newList = userList.filter(u => u.id !== userId);
  saveUserList(newList);
  localStorage.removeItem(`dingtou_user_${userId}`);

  // 如果删除的是当前用户，切换到第一个用户
  if (getCurrentUserId() === userId) {
    if (newList.length > 0) {
      setCurrentUserId(newList[0].id);
    } else {
      localStorage.removeItem('dingtou_current_user');
    }
  }
}

// 切换用户
function switchUser(userId) {
  setCurrentUserId(userId);
}

// 获取今日打卡数据
function loadTodayData() {
  const today = getToday();
  const todayData = localStorage.getItem('dingtou_today');
  if (todayData) {
    const data = JSON.parse(todayData);
    if (data.date === today) {
      return data;
    }
  }
  // 新的一天，重置数据
  const newData = { date: today, practice: false, sport: false, read: false };
  localStorage.setItem('dingtou_today', JSON.stringify(newData));
  return newData;
}

// 获取排行榜数据 - 只显示真实参与的用户
function loadRankData() {
  const allUsers = getAllUsers();

  // 过滤掉没有数据的用户，只保留有打卡记录的用户
  const activeUsers = allUsers.filter(user =>
    (user.totalPractice || 0) + (user.totalSport || 0) + (user.totalRead || 0) > 0
  );

  // 按累计金额排序
  activeUsers.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));

  return activeUsers;
}

// 页面切换
function showPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // 显示目标页面
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // 更新底部导航
  document.querySelectorAll('.tab-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageName) {
      item.classList.add('active');
    }
  });

  // 更新页面数据
  if (pageName === 'home') {
    updateHomePage();
  } else if (pageName === 'clockin') {
    updateClockinPage();
  } else if (pageName === 'account') {
    updateAccountPage();
  } else if (pageName === 'rank') {
    updateRankPage();
  } else if (pageName === 'mine') {
    updateMinePage();
  }

  // 更新名言
  updateQuote(pageName);
}

// Tab切换
let currentTab = 'practice';

function switchTab(tab) {
  currentTab = tab;

  // 更新Tab样式
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    if (t.dataset.tab === tab) {
      t.classList.add('active');
    }
  });

  // 显示/隐藏时长选择
  const durationSection = document.getElementById('duration-section');
  if (durationSection) {
    durationSection.style.display = tab === 'practice' ? 'block' : 'none';
  }

  // 更新内容标签
  const contentLabel = document.getElementById('content-label');
  if (contentLabel) {
    const labels = { practice: '练习内容', sport: '运动内容', read: '阅读内容' };
    contentLabel.textContent = labels[tab];
  }

  // 更新按钮颜色
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.className = `btn ${tab === 'practice' ? '' : tab === 'sport' ? 'btn-sport' : 'btn-read'}`;
  }

  // 更新预计积分
  updateEstimatedScore();
}

// 更新时长显示
function updateDuration() {
  const duration = document.getElementById('duration').value;
  document.getElementById('duration-value').textContent = duration;
  updateEstimatedScore();
}

// 更新预计积分
function updateEstimatedScore() {
  const duration = parseInt(document.getElementById('duration').value) || 60;
  const score = getScore(currentTab, duration);
  document.getElementById('estimated-score').textContent = score;
}

// 提交打卡
function submitClockIn() {
  const todayData = loadTodayData();
  const userData = loadUserData() || {
    nickname: '新用户',
    totalAmount: 0,
    continuousDays: 0,
    totalPractice: 0,
    totalSport: 0,
    totalRead: 0
  };

  const duration = parseInt(document.getElementById('duration').value) || 60;
  const content = document.getElementById('content-input').value;
  const score = getScore(currentTab, duration);

  // 更新今日打卡状态
  if (currentTab === 'practice') {
    todayData.practice = true;
    userData.totalPractice = (userData.totalPractice || 0) + 1;
  } else if (currentTab === 'sport') {
    todayData.sport = true;
    userData.totalSport = (userData.totalSport || 0) + 1;
  } else {
    todayData.read = true;
    userData.totalRead = (userData.totalRead || 0) + 1;
  }

  // 更新累计金额
  userData.totalAmount += score;

  // 更新连续天数
  const lastClockIn = userData.lastClockInDate;
  const today = getToday();

  if (lastClockIn) {
    const lastDate = new Date(lastClockIn);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      userData.continuousDays = (userData.continuousDays || 0) + 1;
    } else if (diffDays > 1) {
      userData.continuousDays = 1;
    }
  } else {
    userData.continuousDays = 1;
  }
  userData.lastClockInDate = today;

  // 检查连续打卡里程碑奖励
  const milestoneReward = getContinuousReward(userData.continuousDays);
  let message = `打卡成功！获得 ${score} 元`;

  if (milestoneReward > 0) {
    userData.totalAmount += milestoneReward;
    message += `\n🎉 达成连续 ${userData.continuousDays} 天，获得里程碑奖励 ${milestoneReward} 元！`;
  }

  // 保存数据 - 使用新的多用户存储方式
  saveUserData(userData);
  localStorage.setItem('dingtou_today', JSON.stringify(todayData));

  // 显示提示
  alert(message);

  // 清空输入
  document.getElementById('content-input').value = '';

  // 更新页面
  updateClockinPage();
  updateHomePage();
}

// 更新首页
function updateHomePage() {
  const userData = loadUserData();
  const todayData = loadTodayData();

  if (userData) {
    document.getElementById('total-amount').textContent = userData.totalAmount;
    document.getElementById('continuous-days').textContent = userData.continuousDays;
    document.getElementById('account-preview').textContent = `${userData.totalAmount} 元`;
  }

  // 更新打卡状态
  updateCheckStatus(todayData);
}

// 点击打卡卡片跳转到打卡页并切换对应Tab
function switchTabAndGo(tab) {
  switchTab(tab);
  showPage('clockin');
}

// 更新打卡状态显示
function updateCheckStatus(todayData) {
  const statusMap = {
    practice: { check: 'check-practice', status: 'practice-status' },
    sport: { check: 'check-sport', status: 'sport-status' },
    read: { check: 'check-read', status: 'read-status' }
  };

  for (const [type, ids] of Object.entries(statusMap)) {
    const checkEl = document.getElementById(ids.check);
    const statusEl = document.getElementById(ids.status);

    if (checkEl) {
      checkEl.classList.toggle('done', todayData[type]);
    }
    if (statusEl) {
      statusEl.textContent = todayData[type] ? '✓ 已完成' : '待打卡';
    }
  }
}

// 更新打卡页
function updateClockinPage() {
  const todayData = loadTodayData();
  updateCheckStatus(todayData);
  updateEstimatedScore();
}

// 更新账户页
async function updateAccountPage() {
  const userData = loadUserData();
  const totalAmount = userData ? userData.totalAmount : 0;

  document.getElementById('asset-value').textContent = totalAmount;

  // 获取真实市场数据
  const marketData = await updateMarketData();

  // 按投资比例分配
  const nasdaqAmount = (totalAmount * INVEST_CONFIG.nasdaq).toFixed(2);
  const csi300Amount = (totalAmount * INVEST_CONFIG.csi300).toFixed(2);

  document.getElementById('nasdaq-value').textContent = nasdaqAmount + ' 元';
  document.getElementById('hs300-value').textContent = csi300Amount + ' 元';

  // 纳斯达克
  const nasdaqChange = parseFloat(marketData.nasdaq.change);
  document.getElementById('nasdaq-change').textContent = nasdaqChange >= 0
    ? `↑ +${nasdaqChange.toFixed(2)}%`
    : `↓ ${nasdaqChange.toFixed(2)}%`;
  document.getElementById('nasdaq-change').className = `holding-change ${nasdaqChange >= 0 ? 'up' : 'down'}`;
  document.getElementById('nasdaq-price').textContent = marketData.nasdaq.price ? marketData.nasdaq.price.toFixed(2) : '--';

  // 沪深300
  const csiChange = parseFloat(marketData.csi300.change);
  document.getElementById('hs300-change').textContent = csiChange >= 0
    ? `↑ +${csiChange.toFixed(2)}%`
    : `↓ ${csiChange.toFixed(2)}%`;
  document.getElementById('hs300-change').className = `holding-change ${csiChange >= 0 ? 'up' : 'down'}`;
  document.getElementById('hs300-price').textContent = marketData.csi300.price ? marketData.csi300.price.toFixed(2) : '--';

  // 生成迷你图表
  const nasdaqChart = generateMiniChartSVG(marketData.nasdaq.history, nasdaqChange >= 0);
  const csi300Chart = generateMiniChartSVG(marketData.csi300.history, csiChange >= 0);
  document.getElementById('nasdaq-chart').innerHTML = nasdaqChart;
  document.getElementById('hs300-chart').innerHTML = csi300Chart;

  // 计算总收益
  const weightedChange = nasdaqChange * INVEST_CONFIG.nasdaq + csiChange * INVEST_CONFIG.csi300;
  const totalProfit = (totalAmount * weightedChange / 100).toFixed(2);
  const profitPercent = weightedChange.toFixed(2);

  document.getElementById('profit-value').textContent = `${totalProfit >= 0 ? '+' : ''}${totalProfit}元 (${profitPercent}%)`;
  document.getElementById('profit-value').className = `profit-value ${totalProfit >= 0 ? 'up' : 'down'}`;

  // 更新投资比例显示
  document.getElementById('nasdaq-percent').textContent = (INVEST_CONFIG.nasdaq * 100) + '%';
  document.getElementById('hs300-percent').textContent = (INVEST_CONFIG.csi300 * 100) + '%';
}

// 排行榜分页
const RANK_PAGE_SIZE = 10;
let currentRankPage = 1;
let totalRankPages = 1;

// 更新排行榜
function updateRankPage() {
  const rankList = loadRankData();
  const container = document.getElementById('rank-list');
  const paginationContainer = document.getElementById('rank-pagination');

  if (rankList.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
        <div>暂无打卡记录</div>
        <div style="font-size: 12px; margin-top: 5px;">完成打卡后自动上榜</div>
      </div>
    `;
    paginationContainer.innerHTML = '';
    return;
  }

  // 计算总页数
  totalRankPages = Math.ceil(rankList.length / RANK_PAGE_SIZE);
  if (currentRankPage > totalRankPages) currentRankPage = totalRankPages;

  // 获取当前页数据
  const startIndex = (currentRankPage - 1) * RANK_PAGE_SIZE;
  const endIndex = startIndex + RANK_PAGE_SIZE;
  const currentPageData = rankList.slice(startIndex, endIndex);

  // 渲染当前页
  container.innerHTML = currentPageData.map((user, index) => {
    const actualIndex = startIndex + index;
    return `
      <div class="rank-item ${actualIndex < 3 ? 'top-' + (actualIndex + 1) : ''}">
        <div class="rank-left">
          <div class="rank-number ${actualIndex < 3 ? 'rank-' + (actualIndex + 1) : ''}">
            ${actualIndex === 0 ? '🥇' : actualIndex === 1 ? '🥈' : actualIndex === 2 ? '🥉' : actualIndex + 1}
          </div>
          <div class="rank-info">
            <div class="rank-name">${user.nickname}</div>
            <div class="rank-days">连续 ${user.continuousDays || 0} 天 | ${(user.totalPractice || 0) + (user.totalSport || 0) + (user.totalRead || 0)} 次打卡</div>
          </div>
        </div>
        <div class="rank-amount">${user.totalAmount || 0} 元</div>
      </div>
    `;
  }).join('');

  // 渲染分页
  if (totalRankPages > 1) {
    let paginationHTML = '';

    // 上一页
    if (currentRankPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="goToRankPage(${currentRankPage - 1})">‹</button>`;
    }

    // 页码
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentRankPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalRankPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="goToRankPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="page-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="page-btn ${i === currentRankPage ? 'active' : ''}" onclick="goToRankPage(${i})">${i}</button>`;
    }

    if (endPage < totalRankPages) {
      if (endPage < totalRankPages - 1) {
        paginationHTML += `<span class="page-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="page-btn" onclick="goToRankPage(${totalRankPages})">${totalRankPages}</button>`;
    }

    // 下一页
    if (currentRankPage < totalRankPages) {
      paginationHTML += `<button class="page-btn" onclick="goToRankPage(${currentRankPage + 1})">›</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
  } else {
    paginationContainer.innerHTML = '';
  }
}

// 跳转到指定页
function goToRankPage(page) {
  currentRankPage = page;
  updateRankPage();
}

// 更新我的页面
function updateMinePage() {
  const userData = loadUserData();
  const userList = loadUserList() || [];
  const currentUserId = getCurrentUserId();
  const currentUser = userList.find(u => u.id === currentUserId);
  const isParent = currentUser && currentUser.isParent;

  // 控制家长专属功能显示
  const actionsCard = document.querySelector('#page-mine .actions-card');
  if (actionsCard) {
    if (isParent) {
      actionsCard.classList.add('is-parent');
    } else {
      actionsCard.classList.remove('is-parent');
    }
  }

  if (userData) {
    document.getElementById('mine-user-name').textContent = userData.nickname;
    document.getElementById('mine-total').textContent = userData.totalAmount;
    document.getElementById('mine-days').textContent = userData.continuousDays;
    document.getElementById('total-practice').textContent = `${userData.totalPractice || 0} 次`;
    document.getElementById('total-sport').textContent = `${userData.totalSport || 0} 次`;
    document.getElementById('total-read').textContent = `${userData.totalRead || 0} 次`;
  }
}

// 更新名言
function updateQuote(pageName) {
  const quote = getRandomQuote();
  const quoteEl = document.getElementById(`${pageName}-quote`);
  if (quoteEl) {
    quoteEl.querySelector('.quote-text').textContent = `"${quote.text}"`;
    quoteEl.querySelector('.quote-author').textContent = quote.author ? `—— ${quote.author}${quote.book}` : '';
  }
}

// 保存昵称（用于修改当前用户昵称）
function saveNickname() {
  const nickname = document.getElementById('nickname-input').value.trim();
  if (!nickname) {
    alert('请输入昵称');
    return;
  }

  // 检查昵称是否与其他用户重复
  const userList = loadUserList() || [];
  const currentUserId = getCurrentUserId();
  if (userList.some(u => u.nickname === nickname && u.id !== currentUserId)) {
    alert('昵称已存在，请使用其他昵称');
    return;
  }

  // 更新用户列表中的昵称
  const userIndex = userList.findIndex(u => u.id === currentUserId);
  if (userIndex >= 0) {
    userList[userIndex].nickname = nickname;
    saveUserList(userList);
  }

  // 更新用户数据
  let userData = loadUserData() || {};
  userData.nickname = nickname;
  saveUserData(userData);

  closeLoginModal();
  updateAllPages();

  alert('昵称修改成功！');
}

// 修改当前用户昵称
function editNickname() {
  const userData = loadUserData();
  document.getElementById('nickname-input').value = userData ? userData.nickname : '';
  document.getElementById('login-modal').classList.add('active');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  const userList = loadUserList();

  if (!userList || userList.length === 0) {
    // 首次使用，先创建家长账号
    setTimeout(() => {
      showParentSetupModal();
    }, 500);
  } else {
    // 检查当前登录状态
    if (!getCurrentUserId()) {
      // 未登录，显示账号选择
      setTimeout(() => {
        showAccountSelectModal();
      }, 300);
    }
  }

  // 初始化页面
  showPage('home');
});

// 显示家长设置弹窗（首次使用）
function showParentSetupModal() {
  document.getElementById('parent-setup-modal').classList.add('active');
  document.getElementById('parent-nickname-input').value = '';
}

// 创建家长账号
function createParentAccount() {
  const nickname = document.getElementById('parent-nickname-input').value.trim();
  if (!nickname) {
    alert('请输入昵称');
    return;
  }

  const result = createUser(nickname, true);
  if (!result.success) {
    alert(result.message);
    return;
  }

  setCurrentUserId(result.user.id);
  document.getElementById('parent-setup-modal').classList.remove('active');
  updateAllPages();
  alert('账号创建成功！');
}

// 显示账号选择弹窗
function showAccountSelectModal() {
  const userList = loadUserList() || [];
  const container = document.getElementById('account-select-list');
  const currentUserId = getCurrentUserId();

  container.innerHTML = userList.map(user => `
    <div class="account-option ${user.id === currentUserId ? 'active' : ''}" onclick="selectAccount('${user.id}')">
      <div class="account-avatar">${user.isParent ? '👨‍👩‍👧' : '🎹'}</div>
      <div class="account-name">${user.nickname}</div>
      ${user.id === currentUserId ? '<span class="account-check">✓</span>' : ''}
    </div>
  `).join('');

  document.getElementById('account-select-modal').classList.add('active');
}

// 选择账号
function selectAccount(userId) {
  switchUser(userId);
  document.getElementById('account-select-modal').classList.remove('active');
  updateAllPages();
}

// 关闭账号选择弹窗
function closeAccountSelectModal() {
  document.getElementById('account-select-modal').classList.remove('active');
}

// 显示添加账号弹窗（家长功能）
function showAddChildModal() {
  document.getElementById('add-child-nickname-input').value = '';
  document.getElementById('add-child-modal').classList.add('active');
}

// 关闭添加账号弹窗
function closeAddChildModal() {
  document.getElementById('add-child-modal').classList.remove('active');
}

// 添加孩子账号
function addChildAccount() {
  const nickname = document.getElementById('add-child-nickname-input').value.trim();
  if (!nickname) {
    alert('请输入昵称');
    return;
  }

  const result = createUser(nickname, false);
  if (!result.success) {
    alert(result.message);
    return;
  }

  closeAddChildModal();
  updateMinePage();
  alert(`孩子账号 "${nickname}" 创建成功！`);
}

// 显示家长管理面板
function showParentPanel() {
  const allUsers = getAllUsers();
  const container = document.getElementById('parent-user-list');

  container.innerHTML = allUsers.filter(u => !u.isParent).map(user => `
    <div class="parent-user-item">
      <div class="parent-user-info">
        <div class="parent-user-avatar">🎹</div>
        <div class="parent-user-details">
          <div class="parent-user-name">${user.nickname}</div>
          <div class="parent-user-stats">
            ${user.totalAmount || 0}元 | 连续${user.continuousDays || 0}天
          </div>
        </div>
      </div>
      <button class="btn-delete" onclick="confirmDeleteUser('${user.id}', '${user.nickname}')">删除</button>
    </div>
  `).join('');

  document.getElementById('parent-panel-modal').classList.add('active');
}

// 关闭家长管理面板
function closeParentPanel() {
  document.getElementById('parent-panel-modal').classList.remove('active');
}

// 确认删除用户
function confirmDeleteUser(userId, nickname) {
  if (confirm(`确定要删除 "${nickname}" 的账号吗？\n删除后所有数据将无法恢复。`)) {
    deleteUser(userId);
    showParentPanel();
    updateAllPages();
    alert('账号已删除');
  }
}

// 更新所有页面数据
function updateAllPages() {
  updateHomePage();
  updateClockinPage();
  updateAccountPage();
  updateRankPage();
  updateMinePage();
}
