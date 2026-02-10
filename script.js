import Server from "./server";

const app = new Server();

// ===============================
// 暫存 token（教學版）
// ===============================
let TOKEN = null;

// ===============================
// 登入
// POST /login
// ===============================
app.post('/login', async (req) => {
  const { email, password } = req.body;

  const res = await fetch(
    'https://todolist-api.hexschool.io/users/sign_in',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }
  );

  const data = await res.json();

  // 登入成功 → 存 token
  if (data.status) {
    TOKEN = data.token;
    return { success: true };
  }

  return { success: false, message: data.message };
});

// ===============================
// 登出
// POST /logout
// ===============================
app.post('/logout', async () => {
  const res = await fetch(
    'https://todolist-api.hexschool.io/users/sign_out',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  );

  const data = await res.json();

  // 清空 token
  TOKEN = null;

  return data;
});

// ===============================
// 取得 todos
// GET /todos
// ===============================
app.get('/todos', async () => {
  const res = await fetch(
    'https://todolist-api.hexschool.io/todos',
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  );

  return await res.json();
});

// ===============================
// 新增 todo
// POST /todos
// ===============================
app.post('/todos', async (req) => {
  const { content } = req.body;

  const res = await fetch(
    'https://todolist-api.hexschool.io/todos',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ content })
    }
  );

  return await res.json();
});

// ===============================
// 刪除 todo
// DELETE /todos/:id
// ===============================
app.delete('/todos/:id', async (req) => {
  const { id } = req.params;

  const res = await fetch(
    `https://todolist-api.hexschool.io/todos/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  );

  return await res.json();
});

// ===============================
// 切換完成狀態
// PATCH /todos/:id/toggle
// ===============================
app.post('/todos/:id/toggle', async (req) => {
  const { id } = req.params;

  const res = await fetch(
    `https://todolist-api.hexschool.io/todos/${id}/toggle`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  );

  return await res.json();
});

// ===============================
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
