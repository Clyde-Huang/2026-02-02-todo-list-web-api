// 基本設定
const API = "https://todolist-api.hexschool.io";

// ************************************************
// 把需要的都列出來
// 註冊、登入、登出、查/增/刪/改狀態 todo
// 再一一處理 fetch
// ************************************************

// =====================================================
// Token 放 localStorage : 好配合 github page & 簡單
// =====================================================

// 取得 token 方法
export function getToken() {
  return localStorage.getItem("token");
}

// 儲存 token 方法
export function setToken(token) {
  localStorage.setItem("token", token);
}

// 清除 token 方法
export function clearToken() {
  localStorage.removeItem("token");
}

// 1.註冊
// POST /users/sign_up

export async function signUp(email, password, nickname) {
  const res = await fetch(`${API}/users/sign_up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      email, 
      password,
      nickname: nickname || email.split('@')[0]
    })
  });

  const data = await res.json();
  return data;
}

// 2.登入
// POST /users/sign_in

export async function login(email, password) {
  const res = await fetch(`${API}/users/sign_in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  // 登入成功 → 存 token
  if (data.status) {
    setToken(data.token);
  }

  return data;
}

// 3.登出
// POST /users/sign_out

export async function logout() {
  const token = getToken();

  // 通知後端登出（非必須，但有 API）
  await fetch(`${API}/users/sign_out`, {
    method: "POST",
    headers: {
      authorization: token
    }
  });

  // 前端要清 token 但後端 token 還在?
  clearToken();
}

// ===============================
// Todo API（全部直接 fetch）
// ===============================

// 共用 headers（每次都帶 token）

function authHeaders(extra = {}) {
  return {
    authorization: getToken(),
    ...extra
  };
}

// 4.取得 todos
// GET /todos

export async function getTodos() {
  const res = await fetch(`${API}/todos`, {
    headers: authHeaders()
  });

  return res.json();
}

// 5.新增 todo
// POST /todos

export async function addTodo(content) {
  const res = await fetch(`${API}/todos`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ content })
  });

  return res.json();
}

// 6.刪除 todo
// DELETE /todos/{id}

export async function deleteTodo(id) {
  const res = await fetch(`${API}/todos/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  return res.json();
}

// 7.切換完成狀態
// PATCH /todos/{id}/toggle

export async function toggleTodo(id) {
  const res = await fetch(`${API}/todos/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders()
  });

  return res.json();
}