import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // ✅ ESLint 官方推薦（所有專案的地基）
  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs}"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      /* ===============================
       * 基本安全與可讀性（ESLint 核心）
       * =============================== */

      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",

      /* ===============================
       * Airbnb 主流規則（手動加入）
       * =============================== */

      // ✅ 禁止 alert/confirm/prompt
      "no-alert": "warn",// 設 error 但練習用就設 warn

      // console 保留但警告（專案後有方法可自動移除）
      "no-console": "warn",

      // 禁止 ++ 運算子（Airbnb 建議禁止，但多數人習慣使用++）
      "no-plusplus": "warn",

      // 強制使用模板字串而非字串連接
      "prefer-template": "warn",

      // 建議使用解構賦值
      "prefer-destructuring": [
        "warn",
        {
          array: false,
          object: true,
        },
      ],

      // 禁止修改函數參數（但允許修改參數的屬性）
      "no-param-reassign": ["error", { props: false }],

      // 禁止變數遮蔽（shadow）
      "no-shadow": "error",

      // 強制駝峰命名
      camelcase: ["error", { properties: "always" }],

      // 強制變數宣告時必須賦值
      "init-declarations": ["error", "always"],

      // 強制使用 === 和 !==
      eqeqeq: ["error", "always"],

      // 強制函數括號前有空格（Airbnb 風格）
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],

      // 禁止多餘的分號
      "no-extra-semi": "error",

      // 強制物件字面值的屬性名稱使用一致的引號
      "quote-props": ["error", "as-needed"],

      // 禁止使用 Array 建構子
      "no-array-constructor": "error",

      // 禁止使用 Object 建構子
      "no-new-object": "error",

      // 強制回調函數使用箭頭函數
      "prefer-arrow-callback": "warn",

      // 強制箭頭函數的箭頭前後有空格
      "arrow-spacing": ["error", { before: true, after: true }],

      // 箭頭函數參數需要括號（Airbnb 預設）
      "arrow-parens": ["error", "always"],

      // 禁止不必要的 .bind()
      "no-useless-constructor": "error",

      // 禁止重複的 import
      "no-duplicate-imports": "error",

      // 強制 generator 函數中 * 號的位置
      "generator-star-spacing": ["error", { before: false, after: true }],

      // 禁止使用 eval()
      "no-eval": "error",

      // 禁止使用 with
      "no-with": "error",

      // 禁止不必要的三元運算子
      "no-unneeded-ternary": "error",
    },
  },

  // ✅ Prettier 永遠放最後（避免與格式化規則衝突）
  eslintConfigPrettier,
];
