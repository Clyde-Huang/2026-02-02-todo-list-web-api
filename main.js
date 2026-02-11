// 匯入 API 函式
import {
  getToken,
  clearToken,
  login,
  logout,
  signUp,
  getTodos,
  addTodo,
  deleteTodo,
  toggleTodo
} from './api.js';

// =====================================================
// Toast 通知系統
// =====================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 觸發動畫
  setTimeout(() => toast.classList.add('show'), 10);

  // 3秒後移除
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 替代 confirm 的函式
function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="confirm-btn confirm-cancel">取消</button>
        <button class="confirm-btn confirm-ok">確定</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    const handleClick = (result) => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
      resolve(result);
    };
    
    dialog.querySelector('.confirm-ok').onclick = () => handleClick(true);
    dialog.querySelector('.confirm-cancel').onclick = () => handleClick(false);
  });
}

// =====================================================
// 全域變數
// =====================================================
let todoList = [];
let currentFilter = "all"; // 'all', 'uncompleted', 'completed'
let elements = {};
let isLoading = false;

// =====================================================
// 頁面切換
// =====================================================
function showPage(pageId) {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signUpPage").style.display = "none";
  document.getElementById("todoListPage").style.display = "none";
  document.getElementById(pageId).style.display = "block";
}

// =====================================================
// 載入資料
// =====================================================
async function loadTodos() {
  console.log("🔍 從 API 讀取資料...");
  setLoading(true);

  try {
    const data = await getTodos();

    if (data.status) {
      todoList = data.data || [];
      console.log("✅ 已從 API 載入資料:", todoList);
      render();
    } else {
      throw new Error(data.message || "載入失敗");
    }
  } catch (error) {
    console.error("❌ 載入資料失敗:", error);
    showToast("無法載入待辦事項，請重新登入", "error");
    clearToken();
    showPage("loginPage");
    todoList = [];
  } finally {
    setLoading(false);
  }
}

// =====================================================
// 渲染畫面
// =====================================================
function render() {
  if (!elements.container) return;

  // 確保 todoList 是陣列
  if (!Array.isArray(todoList)) {
    console.warn("⚠️ todoList 不是陣列，重置為空陣列");
    todoList = [];
  }

  let showList = todoList;
  console.log(showList); // 強制使用

  // 根據篩選條件過濾
  switch (currentFilter) {
    case "completed":
      showList = todoList.filter((item) => item && item.status === true);
      break;
    case "uncompleted":
      showList = todoList.filter((item) => item && item.status === false);
      break;
    case "all":
    default:
      showList = todoList.filter((item) => item); // 過濾掉 undefined/null
      break;
  }

  // 更新統計
  const completedCount = todoList.filter((item) => item && item.status).length;
  elements.statistics.textContent = `${completedCount} 個已完成項目`;

  // 渲染列表
  if (showList.length === 0) {
    elements.container.innerHTML = '<li class="no_todo">目前沒有項目</li>';
    return;
  }

  elements.container.innerHTML = showList
    .map(
      (item) => `
        <li>
            <label class="todoList_label">
                <input class="todoList_input" type="checkbox" ${
                  item.status ? "checked" : ""
                } data-id="${item.id}">
                <span>${item.content}</span>
            </label>
            <a href="#" class="delete-todo-btn" data-id="${item.id}">
                <i class="fa fa-times delBtn"></i>
            </a>
        </li>
    `
    )
    .join("");
}

// =====================================================
// 操作函式
// =====================================================

// 新增待辦
function handleAddTodo() {
  const text = elements.input.value.trim();

  if (text === "") {
    showToast("請輸入內容", "warning");
    return;
  }
  if (isLoading) {
    showToast("處理中，請稍候", "info");
    return;
  }

  setLoading(true);

  addTodo(text)
    .then(function (data) {
      if (!data.status) {
        throw new Error(data.message || "新增失敗");
      }

      console.log("✅ 新增成功:", data);

      // 將新項目加入列表
      todoList.push(data.newTodo);

      // 清空輸入框
      elements.input.value = "";

      // 渲染畫面
      render();
      showToast("新增成功", "success");
    })
    .catch(function (error) {
      console.error("❌ 新增失敗:", error);
      showToast("新增待辦事項失敗：" + error.message, "error");
    })
    .finally(function () {
      setLoading(false);
    });
}

// 切換完成狀態
function handleToggleTodo(id) {
  const item = todoList.find((t) => String(t.id) === String(id));

  if (!item) {
    console.error("❌ 找不到該項目，收到的 ID:", id);
    return;
  }

  if (isLoading) {
    console.log("⏳ 系統處理中，請稍候...");
    return;
  }

  setLoading(true);

  toggleTodo(id)
    .then(function (data) {
      if (!data.status) {
        throw new Error(data.message || "更新失敗");
      }

      console.log("✅ 更新成功:", data);

      // 同步本地資料 - 直接切換狀態
      const index = todoList.findIndex((t) => String(t.id) === String(id));
      if (index !== -1) {
        todoList[index].status = !todoList[index].status;
      }

      // 更新畫面
      render();
    })
    .catch(function (error) {
      console.error("❌ 更新失敗:", error);
      showToast("更新狀態失敗：" + error.message, "error");
    })
    .finally(function () {
      setLoading(false);
    });
}

// 刪除待辦
async function handleDeleteTodo(id) {
  const confirmed = await showConfirm("確定要刪除該項目?");
  if (!confirmed) return;

  setLoading(true);

  deleteTodo(id)
    .then(function (data) {
      if (!data.status) {
        throw new Error(data.message || "刪除失敗");
      }

      console.log("✅ 刪除成功");

      // 更新本地資料
      todoList = todoList.filter((t) => String(t.id) !== String(id));

      // 渲染畫面
      render();
      showToast("刪除成功", "success");
    })
    .catch(function (error) {
      console.error("❌ 刪除失敗:", error);
      showToast("刪除失敗：" + error.message, "error");
    })
    .finally(function () {
      setLoading(false);
    });
}

// 清除已完成項目
async function handleClearCompleted() {
  if (isLoading) {
    showToast("處理中，請稍候", "info");
    return;
  }

  const completedIds = todoList.filter((t) => t.status).map((t) => t.id);

  if (completedIds.length === 0) {
    showToast("沒有已完成項目可清除", "info");
    return;
  }

  const confirmed = await showConfirm(`確定要清除 ${completedIds.length} 個已完成項目嗎？`);
  if (!confirmed) return;

  setLoading(true);

  const deletePromises = completedIds.map((id) => deleteTodo(id));

  Promise.all(deletePromises)
    .then(function (responses) {
      const allSuccess = responses.every((res) => res.status);

      if (!allSuccess) {
        throw new Error("部分項目清除失敗");
      }

      console.log("✅ 清除已完成項目成功");

      todoList = todoList.filter((t) => !t.status);
      render();
      showToast("清除成功", "success");
    })
    .catch(function (error) {
      console.error("❌ 清除失敗:", error);
      showToast("清除已完成項目失敗：" + error.message, "error");
    })
    .finally(function () {
      setLoading(false);
    });
}

// 篩選
function filterByStatus(status) {
  currentFilter = status;
  const tabs = document.querySelectorAll(".todoList_tab a");
  tabs.forEach((tab) => tab.classList.remove("active"));

  switch (status) {
    case "all":
      tabs[0].classList.add("active");
      break;
    case "uncompleted":
      tabs[1].classList.add("active");
      break;
    case "completed":
      tabs[2].classList.add("active");
      break;
  }

  render();
}

// =====================================================
// Loading 狀態控制
// =====================================================
function setLoading(state) {
  isLoading = state;

  const addBtn = document.getElementById("addTodoBtn");
  const input = document.getElementById("todoInput");

  if (addBtn && input) {
    if (state) {
      addBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      input.disabled = true;
    } else {
      addBtn.innerHTML = '<i class="fa fa-plus"></i>';
      input.disabled = false;
    }
  }

  const container = document.getElementById("todoListContainer");
  if (container && state) {
    container.innerHTML = '<li class="no_todo">載入中...</li>';
  }
}

// =====================================================
// 工具函式：綁定事件監聽
// =====================================================
function bindEvent(id, event, handler) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`元素 #${id} 不存在，請檢查 HTML 結構`);
    return;
  }
  element.addEventListener(event, handler);
  return element;
}

// =====================================================
// 初始化
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ 網頁載入完成!");

  // 初始化 DOM 元素
  elements = {
    input: document.getElementById("todoInput"),
    container: document.getElementById("todoListContainer"),
    statistics: document.getElementById("todoStatistics")
  };

  // 檢查登入狀態
  const token = getToken();

  if (token) {
    // 已登入，顯示 Todo 頁面並載入資料
    showPage("todoListPage");
    loadTodos();
  } else {
    // 未登入，顯示登入頁面
    showPage("loginPage");
  }

  // =====================================================
  // 登入表單
  // =====================================================
  bindEvent("loginForm", "submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPwd").value.trim();

    if (!email || !password) {
      showToast("請輸入 Email 和密碼", "warning");
      return;
    }

    try {
      const data = await login(email, password);

      if (data.status) {
        showToast("登入成功！", "success");
        showPage("todoListPage");

        // 顯示使用者名稱
        if (data.nickname) {
          document.getElementById("userName").textContent = data.nickname;
        }

        await loadTodos();

        // 清空表單
        document.getElementById("loginForm").reset();
      } else {
        showToast(data.message || "登入失敗", "error");
      }
    } catch (error) {
      console.error("❌ 登入錯誤:", error);
      showToast("登入失敗，請稍後再試", "error");
    }
  });

  // =====================================================
  // 註冊表單
  // =====================================================
  bindEvent("signUpForm", "submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPwd").value.trim();
    const password2 = document.getElementById("signUpPwd2").value.trim();
    const nickname = document.getElementById("signUpNickname").value.trim();

    if (!email || !password) {
      showToast("請輸入 Email 和密碼", "warning");
      return;
    }

    if (password !== password2) {
      showToast("兩次密碼輸入不一致", "warning");
      return;
    }

    try {
      const data = await signUp(email, password, nickname);

      if (data.status) {
        showToast("註冊成功！請登入", "success");
        showPage("loginPage");
        document.getElementById("signUpForm").reset();
      } else {
        showToast(data.message || "註冊失敗", "error");
      }
    } catch (error) {
      console.error("❌ 註冊錯誤:", error);
      showToast("註冊失敗，請稍後再試", "error");
    }
  });

  // =====================================================
  // 登出
  // =====================================================
  bindEvent("logoutBtn", "click", async function (e) {
    e.preventDefault();

    await logout();
    todoList = [];
    currentFilter = "all";

    showToast("已登出", "info");
    showPage("loginPage");
  });

  // =====================================================
  // Todo 操作
  // =====================================================

  // 新增
  bindEvent("addTodoBtn", "click", function (e) {
    e.preventDefault();
    handleAddTodo();
  });

  // Enter 鍵新增
  bindEvent("todoInput", "keypress", function (e) {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  });

  // 刪除（事件委託）
  elements.container.addEventListener("click", function (e) {
    const deleteBtn = e.target.closest(".delete-todo-btn");
    if (deleteBtn) {
      e.preventDefault();
      const todoId = deleteBtn.dataset.id;
      handleDeleteTodo(todoId);
    }
  });

  // 切換完成狀態（事件委託）
  elements.container.addEventListener("change", function (e) {
    if (e.target.classList.contains("todoList_input")) {
      const todoId = e.target.dataset.id;
      handleToggleTodo(todoId);
    }
  });

  // 清除已完成
  bindEvent("clearCompletedBtn", "click", function (e) {
    e.preventDefault();
    handleClearCompleted();
  });

  // =====================================================
  // 篩選標籤
  // =====================================================
  bindEvent("tabAll", "click", function (e) {
    e.preventDefault();
    filterByStatus("all");
  });

  bindEvent("tabUncompleted", "click", function (e) {
    e.preventDefault();
    filterByStatus("uncompleted");
  });

  bindEvent("tabCompleted", "click", function (e) {
    e.preventDefault();
    filterByStatus("completed");
  });

  // =====================================================
  // 頁面切換連結
  // =====================================================
  document.querySelectorAll('a[href="#loginPage"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showPage("loginPage");
    });
  });

  document.querySelectorAll('a[href="#signUpPage"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showPage("signUpPage");
    });
  });
});